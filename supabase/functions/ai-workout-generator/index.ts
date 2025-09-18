import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkoutRequest {
  userId: string;
  workoutType?: string;
  duration?: number;
  difficulty?: string;
  targetMuscles?: string[];
  equipment?: string[];
  goals?: string[];
  injuries?: string[];
  preferences?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Workout Generator: Processing request...');
    
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

    const requestData: WorkoutRequest = await req.json();
    console.log('Request data:', requestData);

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Get user's recent workouts for context
    const { data: recentWorkouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('name, exercises_data, completed_at, duration_minutes')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (workoutsError) {
      console.error('Workouts error:', workoutsError);
    }

    // Get user's goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('goal_type, title, target_value, current_value, unit')
      .eq('user_id', user.id)
      .eq('completed', false);

    if (goalsError) {
      console.error('Goals error:', goalsError);
    }

    // Create AI prompt for workout generation
    const userContext = {
      profile: profile || {},
      recentWorkouts: recentWorkouts || [],
      goals: goals || [],
      preferences: requestData
    };

    const prompt = `You are an expert AI fitness trainer creating a personalized workout plan. Generate a detailed, safe, and effective workout based on the following user information:

**USER PROFILE:**
- Age: ${profile?.age || 'Not specified'}
- Height: ${profile?.height_cm || 'Not specified'}cm
- Weight: ${profile?.weight_kg || 'Not specified'}kg
- Fitness Level: ${profile?.activity_level || 'Not specified'}
- Fitness Goals: ${profile?.fitness_goals?.join(', ') || 'General fitness'}

**WORKOUT PREFERENCES:**
- Type: ${requestData.workoutType || 'Mixed'}
- Duration: ${requestData.duration || 30} minutes
- Difficulty: ${requestData.difficulty || 'Intermediate'}
- Target Muscles: ${requestData.targetMuscles?.join(', ') || 'Full body'}
- Available Equipment: ${requestData.equipment?.join(', ') || 'Bodyweight only'}
- Injuries/Limitations: ${requestData.injuries?.join(', ') || 'None specified'}
- Additional Preferences: ${requestData.preferences || 'None'}

**USER GOALS:**
${goals?.map(g => `- ${g.title}: ${g.current_value}/${g.target_value} ${g.unit}`).join('\n') || 'No specific goals set'}

**RECENT WORKOUT HISTORY:**
${recentWorkouts?.slice(0, 3).map(w => `- ${w.name} (${w.duration_minutes}min) - ${new Date(w.completed_at).toLocaleDateString()}`).join('\n') || 'No recent workouts'}

Create a workout that:
1. Is appropriate for their fitness level and goals
2. Considers their recent workout history to ensure proper progression/variation
3. Respects any injuries or limitations
4. Uses available equipment effectively
5. Fits the specified duration and difficulty
6. Includes proper warm-up and cool-down

Return ONLY a valid JSON object with this structure:
{
  "name": "Descriptive workout name",
  "description": "Brief description of workout benefits and focus",
  "type": "strength/cardio/hiit/yoga/etc",
  "difficulty": "beginner/intermediate/advanced",
  "estimated_duration": number_in_minutes,
  "target_muscles": ["muscle1", "muscle2"],
  "equipment_needed": ["equipment1", "equipment2"],
  "warm_up": [
    {
      "exercise": "Exercise name",
      "duration_seconds": 30,
      "instructions": "How to perform",
      "tips": "Important form tips"
    }
  ],
  "main_exercises": [
    {
      "exercise": "Exercise name",
      "sets": number,
      "reps": "8-12" or number,
      "rest_seconds": number,
      "instructions": "Detailed instructions",
      "modifications": "Easier/harder variations",
      "target_muscles": ["muscle1", "muscle2"]
    }
  ],
  "cool_down": [
    {
      "exercise": "Stretch name",
      "duration_seconds": 30,
      "instructions": "How to stretch",
      "benefits": "What this helps with"
    }
  ],
  "notes": "Important safety notes and tips for the user",
  "progression_tips": "How to make this workout harder next time"
}`;

    console.log('Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI fitness trainer with knowledge of exercise science, anatomy, and safe workout programming. Always prioritize user safety and proper form. Return only valid JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received');

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Save the generated workout as a template
    const { data: savedWorkout, error: saveError } = await supabase
      .from('workout_templates')
      .insert({
        user_id: user.id,
        name: workoutPlan.name,
        description: workoutPlan.description,
        type: workoutPlan.type,
        difficulty: workoutPlan.difficulty,
        estimated_duration: workoutPlan.estimated_duration,
        exercises: {
          warm_up: workoutPlan.warm_up,
          main_exercises: workoutPlan.main_exercises,
          cool_down: workoutPlan.cool_down,
          equipment_needed: workoutPlan.equipment_needed,
          target_muscles: workoutPlan.target_muscles
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving workout:', saveError);
      // Continue even if save fails
    }

    console.log('Workout generated successfully');

    return new Response(JSON.stringify({
      workout: workoutPlan,
      savedTemplateId: savedWorkout?.id,
      message: 'AI workout generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI workout generator:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate workout',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});