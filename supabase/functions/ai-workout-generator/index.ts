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

// Structured logging
function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [ai-workout-generator] ${message}`, data ? JSON.stringify(data) : '');
}

// Log errors to database
async function logError(errorType: string, errorMessage: string, userId?: string, requestData?: unknown) {
  try {
    await supabase.from('error_logs').insert({
      user_id: userId,
      error_type: errorType,
      error_message: errorMessage,
      function_name: 'ai-workout-generator',
      request_data: requestData,
      severity: 'error'
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}

// Simple hash function for cache key
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Check cache for existing response
async function getCachedWorkout(cacheKey: string): Promise<unknown | null> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) return null;
    log('info', 'Cache hit', { cacheKey });
    return data.response;
  } catch {
    return null;
  }
}

// Cache a response
async function cacheWorkout(cacheKey: string, response: unknown, ttlHours: number = 24) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    await supabase.from('ai_response_cache').upsert({
      cache_key: cacheKey,
      prompt_hash: cacheKey,
      response,
      model: 'google/gemini-2.5-flash',
      expires_at: expiresAt.toISOString()
    });
  } catch (e) {
    console.error('Failed to cache response:', e);
  }
}

// Fallback workout when AI fails
const fallbackWorkouts = {
  beginner: {
    name: "Beginner Full Body Workout",
    description: "A balanced workout for beginners targeting all major muscle groups.",
    type: "strength",
    difficulty: "beginner",
    estimated_duration: 30,
    target_muscles: ["chest", "back", "legs", "core"],
    equipment_needed: ["bodyweight"],
    warm_up: [
      { exercise: "Arm Circles", duration_seconds: 30, instructions: "Circle arms forward then backward", tips: "Keep movements controlled" },
      { exercise: "Marching in Place", duration_seconds: 60, instructions: "Lift knees high, pump arms", tips: "Engage your core" }
    ],
    main_exercises: [
      { exercise: "Push-ups (Knee)", sets: 3, reps: "8-10", rest_seconds: 60, instructions: "Lower chest to floor, push back up", modifications: "Wall push-ups for easier", target_muscles: ["chest", "triceps"] },
      { exercise: "Bodyweight Squats", sets: 3, reps: "12-15", rest_seconds: 60, instructions: "Sit back, keep chest up", modifications: "Use a chair for support", target_muscles: ["quads", "glutes"] },
      { exercise: "Plank", sets: 3, reps: "20-30 sec", rest_seconds: 45, instructions: "Keep body straight, engage core", modifications: "Knee plank for easier", target_muscles: ["core"] },
      { exercise: "Glute Bridges", sets: 3, reps: "12-15", rest_seconds: 45, instructions: "Squeeze glutes at top", modifications: "Single leg for harder", target_muscles: ["glutes", "hamstrings"] }
    ],
    cool_down: [
      { exercise: "Child's Pose", duration_seconds: 30, instructions: "Sit back on heels, arms extended", benefits: "Stretches back and hips" },
      { exercise: "Standing Quad Stretch", duration_seconds: 30, instructions: "Hold each leg 15 seconds", benefits: "Releases quad tension" }
    ],
    notes: "Focus on form over speed. Rest as needed.",
    progression_tips: "Add reps or hold positions longer as you get stronger."
  },
  intermediate: {
    name: "Intermediate Strength Builder",
    description: "Challenging compound movements for muscle building.",
    type: "strength",
    difficulty: "intermediate",
    estimated_duration: 45,
    target_muscles: ["chest", "back", "legs", "shoulders"],
    equipment_needed: ["dumbbells", "bodyweight"],
    warm_up: [
      { exercise: "Jumping Jacks", duration_seconds: 45, instructions: "Full range of motion", tips: "Land softly" },
      { exercise: "Dynamic Stretches", duration_seconds: 60, instructions: "Leg swings, arm circles", tips: "Move through full range" }
    ],
    main_exercises: [
      { exercise: "Dumbbell Goblet Squats", sets: 4, reps: "10-12", rest_seconds: 90, instructions: "Hold weight at chest, squat deep", modifications: "Bodyweight for easier", target_muscles: ["quads", "glutes"] },
      { exercise: "Push-ups", sets: 4, reps: "12-15", rest_seconds: 60, instructions: "Full range, chest to floor", modifications: "Incline for easier", target_muscles: ["chest", "triceps"] },
      { exercise: "Dumbbell Rows", sets: 4, reps: "10-12 each", rest_seconds: 60, instructions: "Pull to hip, squeeze back", modifications: "Lighter weight for form", target_muscles: ["back", "biceps"] },
      { exercise: "Lunges", sets: 3, reps: "10 each leg", rest_seconds: 60, instructions: "Step forward, knee to 90°", modifications: "Static lunges for balance", target_muscles: ["quads", "glutes"] },
      { exercise: "Plank to Push-up", sets: 3, reps: "8-10", rest_seconds: 60, instructions: "Alternate arms up and down", modifications: "Knee version for easier", target_muscles: ["core", "shoulders"] }
    ],
    cool_down: [
      { exercise: "Pigeon Pose", duration_seconds: 60, instructions: "30 seconds each side", benefits: "Opens hips" },
      { exercise: "Cat-Cow Stretch", duration_seconds: 30, instructions: "Flow between positions", benefits: "Releases spine tension" }
    ],
    notes: "Control the weight, don't let it control you.",
    progression_tips: "Increase weight by 5% when you can complete all reps with good form."
  }
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
    log('info', 'Processing request...');
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      log('warn', 'Auth failed', { error: authError?.message });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: WorkoutRequest = await req.json();
    log('info', 'Request data', { difficulty: requestData.difficulty, type: requestData.workoutType });

    // Generate cache key from request parameters
    const cacheKey = `workout_${hashString(JSON.stringify({
      type: requestData.workoutType,
      duration: requestData.duration,
      difficulty: requestData.difficulty,
      muscles: requestData.targetMuscles?.sort(),
      equipment: requestData.equipment?.sort()
    }))}`;

    // Check cache first (for generic workouts without user-specific data)
    if (!requestData.preferences && !requestData.injuries?.length) {
      const cached = await getCachedWorkout(cacheKey);
      if (cached) {
        return new Response(JSON.stringify({
          workout: cached,
          cached: true,
          message: 'AI workout retrieved from cache!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch user context in parallel
    const [profileResult, workoutsResult, goalsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('workout_sessions')
        .select('name, exercises_data, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase.from('goals')
        .select('goal_type, title, target_value, current_value, unit')
        .eq('user_id', user.id)
        .eq('completed', false)
    ]);

    const profile = profileResult.data;
    const recentWorkouts = workoutsResult.data || [];
    const goals = goalsResult.data || [];

    // Create AI prompt
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

Return ONLY a valid JSON object with this structure:
{
  "name": "Descriptive workout name",
  "description": "Brief description of workout benefits and focus",
  "type": "strength/cardio/hiit/yoga/etc",
  "difficulty": "beginner/intermediate/advanced",
  "estimated_duration": number_in_minutes,
  "target_muscles": ["muscle1", "muscle2"],
  "equipment_needed": ["equipment1", "equipment2"],
  "warm_up": [{"exercise": "name", "duration_seconds": 30, "instructions": "how to", "tips": "tips"}],
  "main_exercises": [{"exercise": "name", "sets": 3, "reps": "8-12", "rest_seconds": 60, "instructions": "how to", "modifications": "easier/harder", "target_muscles": ["muscle"]}],
  "cool_down": [{"exercise": "name", "duration_seconds": 30, "instructions": "how to", "benefits": "why"}],
  "notes": "safety notes",
  "progression_tips": "how to progress"
}`;

    log('info', 'Calling AI gateway...');
    
    let workoutPlan;
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an expert AI fitness trainer. Return only valid JSON responses.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('error', 'AI gateway error', { status: response.status, error: errorText });
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      workoutPlan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      log('info', 'Workout plan parsed successfully');

      // Cache the response for future similar requests
      await cacheWorkout(cacheKey, workoutPlan);

    } catch (aiError) {
      log('error', 'AI generation failed, using fallback', { error: aiError.message });
      await logError('ai_generation_failed', aiError.message, user.id, requestData);
      
      // Use fallback workout
      const difficulty = requestData.difficulty?.toLowerCase() || 'beginner';
      workoutPlan = fallbackWorkouts[difficulty as keyof typeof fallbackWorkouts] || fallbackWorkouts.beginner;
    }

    // Save the workout as a template
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
      log('warn', 'Failed to save workout template', { error: saveError.message });
    }

    log('info', 'Workout generated successfully');

    return new Response(JSON.stringify({
      workout: workoutPlan,
      savedTemplateId: savedWorkout?.id,
      message: 'AI workout generated successfully!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Unhandled error', { error: error.message });
    await logError('unhandled_error', error.message);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to generate workout',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
