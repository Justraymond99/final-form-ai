import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecoveryRequest {
  userId: string;
  workoutIntensity?: string;
  musclesWorked?: string[];
  fatigueLevel?: number; // 1-10 scale
  sleepQuality?: number; // 1-10 scale
  stressLevel?: number; // 1-10 scale
  availableTime?: number; // minutes
  preferences?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Recovery Planner: Processing request...');
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: RecoveryRequest = await req.json();
    console.log('Recovery request data:', requestData);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Get recent workout sessions for recovery analysis
    const { data: recentWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('name, exercises_data, completed_at, duration_minutes')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('completed_at', { ascending: false });

    if (workoutsError) {
      console.error('Workouts error:', workoutsError);
    }

    // Calculate workout frequency and intensity patterns
    const workoutFrequency = recentWorkouts?.length || 0;
    const avgDuration = recentWorkouts?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / (workoutFrequency || 1);

    // Create AI prompt for recovery planning
    const prompt = `You are an expert sports science and recovery specialist. Create a personalized recovery plan based on the following information:

**USER PROFILE:**
- Age: ${profile?.age || 'Not specified'}
- Height: ${profile?.height_cm || 'Not specified'}cm
- Weight: ${profile?.weight_kg || 'Not specified'}kg
- Activity Level: ${profile?.activity_level || 'Not specified'}
- Fitness Goals: ${profile?.fitness_goals?.join(', ') || 'General fitness'}

**CURRENT RECOVERY NEEDS:**
- Last Workout Intensity: ${requestData.workoutIntensity || 'Moderate'}
- Muscles Worked: ${requestData.musclesWorked?.join(', ') || 'Full body'}
- Current Fatigue Level: ${requestData.fatigueLevel || 5}/10
- Sleep Quality: ${requestData.sleepQuality || 7}/10
- Stress Level: ${requestData.stressLevel || 5}/10
- Available Recovery Time: ${requestData.availableTime || 30} minutes
- Preferences: ${requestData.preferences || 'None specified'}

**RECENT WORKOUT PATTERN:**
- Workouts in last 7 days: ${workoutFrequency}
- Average workout duration: ${Math.round(avgDuration)} minutes
- Recent workouts: ${recentWorkouts?.slice(0, 3).map(w => `${w.name} (${new Date(w.completed_at).toLocaleDateString()})`).join(', ') || 'None'}

Create a comprehensive recovery plan that includes:
1. Active recovery activities appropriate for current fatigue level
2. Stretching/mobility work for muscles worked
3. Recovery techniques based on available time
4. Nutrition and hydration recommendations
5. Sleep optimization tips
6. Stress management techniques

Return ONLY a valid JSON object with this structure:
{
  "plan_name": "Personalized recovery plan title",
  "overall_assessment": "Brief assessment of recovery needs",
  "recovery_priority": "high/medium/low",
  "recommended_rest_hours": number,
  "active_recovery": [
    {
      "activity": "Activity name",
      "duration_minutes": number,
      "intensity": "light/moderate",
      "instructions": "How to perform",
      "benefits": "Why this helps recovery"
    }
  ],
  "stretching_routine": [
    {
      "stretch": "Stretch name",
      "target_muscles": ["muscle1", "muscle2"],
      "duration_seconds": number,
      "instructions": "Detailed instructions",
      "frequency": "Number of times to repeat"
    }
  ],
  "recovery_techniques": [
    {
      "technique": "Technique name",
      "duration_minutes": number,
      "equipment_needed": "Equipment or 'none'",
      "instructions": "How to perform",
      "when_to_use": "Timing recommendations"
    }
  ],
  "nutrition_recommendations": [
    {
      "category": "Hydration/Protein/Carbs/etc",
      "recommendation": "Specific advice",
      "timing": "When to consume",
      "reasoning": "Why this helps"
    }
  ],
  "sleep_optimization": [
    {
      "tip": "Sleep tip",
      "implementation": "How to do it",
      "benefit": "Why it helps recovery"
    }
  ],
  "stress_management": [
    {
      "technique": "Technique name",
      "duration_minutes": number,
      "instructions": "How to perform",
      "benefit": "How it aids recovery"
    }
  ],
  "next_workout_readiness": {
    "estimated_hours": number,
    "readiness_indicators": ["What to look for"],
    "warning_signs": ["Signs to rest more"]
  },
  "personalized_notes": "Additional advice specific to this user's situation"
}`;

    console.log('Sending request to Lovable AI for recovery planning...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sports scientist and recovery specialist with deep knowledge of exercise physiology, nutrition, and recovery optimization. Always prioritize user health and safe recovery practices. Return only valid JSON responses.'
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
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('Lovable AI recovery response received');

    // Extract JSON from markdown code blocks if present
    const extractJSON = (text: string) => {
      // Try to find JSON within markdown code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch) {
        return codeBlockMatch[1];
      }
      // Try to find raw JSON object
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return jsonMatch[0];
      }
      return text;
    };

    let recoveryPlan;
    try {
      const content = aiResponse.choices[0].message.content;
      const cleanedContent = extractJSON(content);
      recoveryPlan = JSON.parse(cleanedContent);
      console.log('Recovery plan parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', aiResponse.choices[0].message.content);
      throw new Error('Invalid AI response format - could not parse JSON');
    }

    console.log('Recovery plan generated successfully');

    return new Response(JSON.stringify({
      recovery_plan: recoveryPlan,
      generated_at: new Date().toISOString(),
      message: 'AI recovery plan generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI recovery planner:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate recovery plan',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});