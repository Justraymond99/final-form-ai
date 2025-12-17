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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    const userId = userData.user.id;
    console.log('Generating insights for user:', userId);

    // Fetch user's recent data for context
    const [workoutsResult, nutritionResult, trackingResult] = await Promise.all([
      supabaseClient
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabaseClient
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(20),
      supabaseClient
        .from('daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7)
    ]);

    const workouts = workoutsResult.data || [];
    const nutrition = nutritionResult.data || [];
    const tracking = trackingResult.data || [];

    const completedWorkouts = workouts.filter(w => w.completed_at).length;
    const totalCalories = nutrition.reduce((sum, n) => sum + (n.calories || 0), 0);
    const avgWater = tracking.length > 0 
      ? Math.round(tracking.reduce((sum, t) => sum + (t.water_intake_ml || 0), 0) / tracking.length)
      : 0;

    const contextPrompt = `
Based on the user's fitness data:
- Completed ${completedWorkouts} workouts recently
- Logged ${nutrition.length} meals with ${totalCalories} total calories
- Average daily water intake: ${avgWater}ml
- ${tracking.length} days of tracking data

Generate personalized fitness insights including:
1. A weekly summary with key achievements
2. Areas for improvement
3. Motivational message
4. Specific action items for next week

Return as JSON with: 
{
  "summary": "string",
  "achievements": ["string"],
  "improvements": ["string"],
  "motivation": "string",
  "actionItems": ["string"],
  "stats": {
    "workoutsCompleted": number,
    "caloriesLogged": number,
    "waterAverage": number,
    "consistencyScore": number
  }
}`;

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
            content: 'You are an encouraging fitness coach AI. Provide personalized, actionable insights based on user data. Be positive but realistic. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: contextPrompt
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
    
    console.log('AI insights generated successfully');

    // Parse the JSON response
    let insights;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      // Provide fallback insights
      insights = {
        summary: "Keep up the great work! You're building healthy habits.",
        achievements: [
          `Completed ${completedWorkouts} workouts`,
          `Logged ${nutrition.length} meals`,
          "Maintained tracking consistency"
        ],
        improvements: [
          "Try to increase workout frequency",
          "Focus on hydration",
          "Add more variety to meals"
        ],
        motivation: "Every step forward is progress. You've got this!",
        actionItems: [
          "Schedule 3 workouts for next week",
          "Drink 8 glasses of water daily",
          "Log all meals consistently"
        ],
        stats: {
          workoutsCompleted: completedWorkouts,
          caloriesLogged: totalCalories,
          waterAverage: avgWater,
          consistencyScore: Math.min(100, tracking.length * 14)
        }
      };
    }

    return new Response(JSON.stringify({
      success: true,
      insights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights-generator:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});