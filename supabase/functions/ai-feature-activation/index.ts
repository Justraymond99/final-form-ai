import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { feature_id, user_id } = await req.json();
    console.log(`Activating feature: ${feature_id} for user: ${user_id}`);

    // Define feature prompts
    const featurePrompts: Record<string, string> = {
      'recovery-optimization': `Generate a recovery optimization recommendation. Include:
        - Recovery score estimate (1-100)
        - Key recovery factors (sleep, nutrition, stress)
        - Personalized recovery tips
        - Recommended rest activities
        Return as JSON with: score, factors (array), tips (array), activities (array)`,
      'workout-optimization': `Generate workout optimization suggestions. Include:
        - Performance score estimate (1-100)
        - Training intensity recommendation
        - Exercise modifications
        - Progressive overload tips
        Return as JSON with: score, intensity, modifications (array), tips (array)`,
      'nutrition-optimization': `Generate nutrition optimization insights. Include:
        - Nutrition score estimate (1-100)
        - Macro balance assessment
        - Meal timing recommendations
        - Hydration tips
        Return as JSON with: score, macros, timing (array), hydration (array)`,
      'sleep-optimization': `Generate sleep optimization recommendations. Include:
        - Sleep quality score estimate (1-100)
        - Sleep hygiene tips
        - Pre-sleep routine suggestions
        - Recovery during sleep tips
        Return as JSON with: score, hygiene (array), routine (array), recovery (array)`,
    };

    const prompt = featurePrompts[feature_id] || featurePrompts['workout-optimization'];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a fitness AI assistant. Provide practical, actionable recommendations. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response received for feature:', feature_id);

    // Parse the JSON response
    let parsedContent;
    try {
      // Clean up any markdown formatting
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response as JSON:', content);
      parsedContent = {
        score: 75,
        tips: ['Focus on consistency', 'Stay hydrated', 'Get adequate rest'],
        recommendations: ['Start with moderate intensity', 'Track your progress']
      };
    }

    return new Response(JSON.stringify({
      success: true,
      feature_id,
      data: parsedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-feature-activation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});