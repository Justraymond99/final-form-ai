import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limiter.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
  // Redact sensitive data from logs
  const safeData = data && typeof data === 'object' ? '[Object]' : data;
  console.log(`[ai-recovery-coach] ${level.toUpperCase()}: ${message}`, safeData || '');
}

interface WorkoutSession {
  name: string;
  exercises_data: any;
  completed_at: string;
  duration_minutes: number;
}

// Calculate muscle fatigue based on recent workouts
function analyzeMuscleGroups(workouts: WorkoutSession[]): Record<string, number> {
  const muscleFatigue: Record<string, number> = {};
  const now = new Date();

  workouts.forEach(workout => {
    const daysAgo = Math.floor((now.getTime() - new Date(workout.completed_at).getTime()) / (1000 * 60 * 60 * 24));
    const fatigueMultiplier = Math.max(0, 1 - (daysAgo * 0.2)); // Decay over 5 days

    const exercises = workout.exercises_data || [];
    exercises.forEach((ex: any) => {
      const muscles = ex.target_muscles || ex.targetMuscles || [];
      muscles.forEach((muscle: string) => {
        const normalizedMuscle = muscle.toLowerCase();
        muscleFatigue[normalizedMuscle] = (muscleFatigue[normalizedMuscle] || 0) + fatigueMultiplier;
      });
    });
  });

  return muscleFatigue;
}

// Determine if rest day is recommended
function shouldRecommendRestDay(workouts: WorkoutSession[], streak: number): { recommend: boolean; reason: string } {
  const recentDays = 7;
  const now = new Date();
  const recentWorkouts = workouts.filter(w => {
    const daysAgo = Math.floor((now.getTime() - new Date(w.completed_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= recentDays;
  });

  // Check consecutive workout days
  const workoutDates = new Set(recentWorkouts.map(w => new Date(w.completed_at).toDateString()));
  
  // 4+ workouts in last 7 days without a rest day
  if (recentWorkouts.length >= 4) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(now);
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    if (workoutDates.has(yesterday.toDateString()) && workoutDates.has(dayBefore.toDateString())) {
      return { recommend: true, reason: "You've worked out multiple days in a row. Your muscles need recovery time to grow stronger." };
    }
  }

  // High volume recently
  const totalDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  if (totalDuration > 300 && recentWorkouts.length >= 5) { // 5+ hours in 7 days
    return { recommend: true, reason: "High training volume this week. A rest day will prevent overtraining and optimize gains." };
  }

  // Streak protection
  if (streak >= 7 && recentWorkouts.length >= 6) {
    return { recommend: true, reason: "Great 7-day streak! One planned rest day won't break your momentum and will boost performance." };
  }

  return { recommend: false, reason: "" };
}

// Fallback recovery recommendations
const fallbackRecovery = {
  restDayRecommended: false,
  recoveryScore: 75,
  muscleRecovery: {
    fullyRecovered: ["arms", "shoulders"],
    recovering: ["chest", "back"],
    fatigued: []
  },
  recommendations: [
    {
      type: "active_recovery",
      title: "Light Movement",
      description: "20-30 minutes of walking or light stretching to promote blood flow",
      priority: "medium"
    },
    {
      type: "nutrition",
      title: "Protein Intake",
      description: "Ensure adequate protein (1.6-2.2g/kg bodyweight) for muscle repair",
      priority: "high"
    },
    {
      type: "sleep",
      title: "Quality Sleep",
      description: "Aim for 7-9 hours of sleep for optimal recovery and hormone balance",
      priority: "high"
    }
  ],
  nextWorkoutSuggestion: {
    muscleGroups: ["legs", "core"],
    intensity: "moderate",
    focusAreas: ["Lower body strength", "Core stability"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log('info', 'Processing recovery analysis request');

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, 'ai-recovery-coach');
    if (!rateLimitResult.allowed) {
      log('warn', 'Rate limit exceeded');
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Fetch user data
    const [workoutsResult, trackingResult, profileResult] = await Promise.all([
      supabase.from('workout_sessions')
        .select('name, exercises_data, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(14),
      supabase.from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7),
      supabase.from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    const workouts = workoutsResult.data || [];
    const tracking = trackingResult.data || [];
    const profile = profileResult.data;
    const currentStreak = tracking[0]?.workout_streak || 0;

    // Analyze muscle fatigue
    const muscleFatigue = analyzeMuscleGroups(workouts);
    const restDayAnalysis = shouldRecommendRestDay(workouts, currentStreak);

    // Build AI prompt
    const prompt = `You are an expert sports recovery coach. Analyze this athlete's recent activity and provide personalized recovery recommendations.

**ATHLETE PROFILE:**
- Age: ${profile?.age || 'Unknown'}
- Activity Level: ${profile?.activity_level || 'Unknown'}
- Current Streak: ${currentStreak} days
- Goals: ${profile?.fitness_goals?.join(', ') || 'General fitness'}

**RECENT WORKOUTS (Last 14 days):**
${workouts.map(w => `- ${w.name} (${w.duration_minutes || 0}min) on ${new Date(w.completed_at).toLocaleDateString()}`).join('\n') || 'No recent workouts'}

**MUSCLE FATIGUE ANALYSIS:**
${Object.entries(muscleFatigue).map(([muscle, fatigue]) => `- ${muscle}: ${fatigue.toFixed(1)} fatigue score`).join('\n') || 'No data'}

**REST DAY ANALYSIS:**
${restDayAnalysis.recommend ? `REST RECOMMENDED: ${restDayAnalysis.reason}` : 'No immediate rest needed'}

Return ONLY valid JSON:
{
  "restDayRecommended": boolean,
  "recoveryScore": 0-100 (100 = fully recovered),
  "muscleRecovery": {
    "fullyRecovered": ["muscle names"],
    "recovering": ["muscle names"],
    "fatigued": ["muscle names"]
  },
  "recommendations": [
    {
      "type": "active_recovery|nutrition|sleep|stretching|hydration|mental",
      "title": "Short title",
      "description": "Specific actionable advice",
      "priority": "high|medium|low"
    }
  ],
  "nextWorkoutSuggestion": {
    "muscleGroups": ["least fatigued muscles to train"],
    "intensity": "light|moderate|high",
    "focusAreas": ["specific areas to focus on"],
    "avoidMuscles": ["muscles that need rest"]
  },
  "motivationalMessage": "Encouraging message for the athlete"
}`;

    let recoveryPlan;
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
            { role: 'system', content: 'You are an expert sports recovery and performance coach. Provide evidence-based recovery advice.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          throw new Error('AI rate limited');
        }
        throw new Error(`AI error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      recoveryPlan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      log('info', 'Recovery plan generated successfully');

    } catch (aiError) {
      log('warn', 'AI failed, using fallback', { error: aiError.message });
      recoveryPlan = {
        ...fallbackRecovery,
        restDayRecommended: restDayAnalysis.recommend,
        motivationalMessage: restDayAnalysis.recommend 
          ? "Rest is when your body gets stronger. Take this time to recover and come back better!"
          : "You're doing great! Keep up the consistent effort."
      };
    }

    return new Response(JSON.stringify({
      recovery: recoveryPlan,
      currentStreak,
      recentWorkoutCount: workouts.length,
      message: 'Recovery analysis complete'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Error in recovery coach', { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to analyze recovery' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
