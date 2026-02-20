import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, 'ai-food-suggestions');
    if (!rateLimitResult.allowed) {
      console.log('Rate limit exceeded');
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    const { userProfile, mealType } = await req.json();

    // Build context from user profile
    const profileContext = [];
    if (userProfile?.goal) profileContext.push(`Goal: ${userProfile.goal}`);
    if (userProfile?.dietary_preferences?.length) {
      profileContext.push(`Dietary preferences: ${userProfile.dietary_preferences.join(', ')}`);
    }
    if (userProfile?.allergies?.length) {
      profileContext.push(`Allergies: ${userProfile.allergies.join(', ')}`);
    }
    if (userProfile?.target_calories_per_day) {
      profileContext.push(`Target calories: ${userProfile.target_calories_per_day}/day`);
    }

    const systemPrompt = `You are a nutrition AI assistant. Suggest 5 specific, real food items that would be good for ${mealType || 'a meal'}.

${profileContext.length > 0 ? 'User context:\n' + profileContext.join('\n') : ''}

Return ONLY a JSON array of food suggestions. Each suggestion should have:
- name: specific food item name (e.g., "Fage Total 0% Greek Yogurt", "Grilled Chicken Breast")
- brand: brand name if applicable (e.g., "Fage", "Perdue") or null for generic items
- reason: brief reason why it's good (max 50 chars)

Example format:
[
  {"name": "Fage Total 0% Greek Yogurt", "brand": "Fage", "reason": "High protein, low sugar"},
  {"name": "Grilled Chicken Breast", "brand": null, "reason": "Lean protein for muscle"}
]`;

    console.log('Calling AI for food suggestions');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest foods for ${mealType || 'a meal'}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    let suggestions;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      suggestions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-food-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
