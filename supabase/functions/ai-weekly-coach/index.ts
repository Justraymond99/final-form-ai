import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limiter.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
  // Redact sensitive data from logs
  const safeData = data && typeof data === 'object' ? '[Object]' : data;
  console.log(`[ai-weekly-coach] ${level.toUpperCase()}: ${message}`, safeData || '');
}

// Calculate weekly stats
function calculateWeeklyStats(workouts: any[], foodLogs: any[], waterLogs: any[], tracking: any[]) {
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCaloriesLogged = foodLogs.reduce((sum, f) => sum + (f.calories || 0), 0);
  const avgDailyCalories = foodLogs.length > 0 ? Math.round(totalCaloriesLogged / 7) : 0;
  const totalWater = waterLogs.reduce((sum, w) => sum + (w.amount_ml || 0), 0);
  const avgDailyWater = Math.round(totalWater / 7);
  
  // Calculate workout consistency (days with workouts / 7)
  const workoutDays = new Set(workouts.map(w => new Date(w.completed_at).toDateString())).size;
  const consistency = Math.round((workoutDays / 7) * 100);

  // Estimate total calories burned
  const totalCaloriesBurned = workouts.reduce((sum, w) => {
    const duration = w.duration_minutes || 30;
    const intensity = w.exercises_data?.length > 5 ? 1.2 : 1;
    return sum + Math.round(duration * 7 * intensity); // ~7 cal/min average
  }, 0);

  return {
    totalWorkouts,
    totalDuration,
    totalCaloriesLogged,
    avgDailyCalories,
    totalWater,
    avgDailyWater,
    consistency,
    totalCaloriesBurned,
    workoutDays
  };
}

// Fallback weekly insights
const fallbackInsights = {
  summary: "Good progress this week! Keep building momentum.",
  grade: "B",
  highlights: [
    { type: "positive", text: "You showed up and put in the work" },
    { type: "improvement", text: "Try to increase workout frequency" }
  ],
  weeklyGoals: [
    { goal: "Complete 3-4 workouts", priority: "high" },
    { goal: "Stay hydrated (2L+ daily)", priority: "medium" },
    { goal: "Get 7-8 hours of sleep", priority: "high" }
  ],
  focusAreas: [
    { area: "Consistency", tip: "Schedule your workouts like appointments" },
    { area: "Recovery", tip: "Don't skip rest days - they're when you get stronger" }
  ],
  motivationalQuote: "Progress, not perfection. Every workout counts!"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log('info', 'Processing weekly coach request');

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
    const rateLimitResult = await checkRateLimit(user.id, 'ai-weekly-coach');
    if (!rateLimitResult.allowed) {
      log('warn', 'Rate limit exceeded');
      return rateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Get date range for this week
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Fetch all weekly data
    const [workoutsResult, foodResult, waterResult, trackingResult, profileResult, goalsResult] = await Promise.all([
      supabase.from('workout_sessions')
        .select('name, exercises_data, completed_at, duration_minutes')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', weekStartStr)
        .order('completed_at', { ascending: false }),
      supabase.from('food_logs')
        .select('food_name, calories, protein_g, carbs_g, fat_g, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', weekStartStr),
      supabase.from('water_logs')
        .select('amount_ml, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', weekStartStr),
      supabase.from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .order('date', { ascending: false }),
      supabase.from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
    ]);

    const workouts = workoutsResult.data || [];
    const foodLogs = foodResult.data || [];
    const waterLogs = waterResult.data || [];
    const tracking = trackingResult.data || [];
    const profile = profileResult.data;
    const goals = goalsResult.data || [];

    const stats = calculateWeeklyStats(workouts, foodLogs, waterLogs, tracking);

    // Build AI prompt
    const prompt = `You are an elite AI fitness coach providing a personalized weekly performance review. Be encouraging but honest.

**ATHLETE PROFILE:**
- Name: ${profile?.display_name || 'Athlete'}
- Age: ${profile?.age || 'Unknown'}
- Goals: ${profile?.fitness_goals?.join(', ') || 'General fitness'}
- Daily Calorie Target: ${profile?.daily_calorie_goal || 2000}

**THIS WEEK'S STATS:**
- Workouts Completed: ${stats.totalWorkouts}
- Total Training Time: ${stats.totalDuration} minutes
- Workout Consistency: ${stats.consistency}%
- Est. Calories Burned: ${stats.totalCaloriesBurned}
- Avg Daily Calories Consumed: ${stats.avgDailyCalories}
- Avg Daily Water: ${stats.avgDailyWater}ml

**WORKOUTS THIS WEEK:**
${workouts.map(w => `- ${w.name} (${w.duration_minutes}min)`).join('\n') || 'No workouts logged'}

**ACTIVE GOALS:**
${goals.map(g => `- ${g.title}: ${g.current_value}/${g.target_value} ${g.unit}`).join('\n') || 'No active goals'}

Provide a comprehensive weekly review. Return ONLY valid JSON:
{
  "summary": "2-3 sentence personalized summary of the week",
  "grade": "A+/A/B/C/D based on effort and consistency",
  "highlights": [
    {"type": "positive|improvement|warning", "text": "specific observation"}
  ],
  "stats": {
    "workoutsCompleted": number,
    "totalMinutes": number,
    "caloriesBurned": number,
    "consistency": "percentage string",
    "comparedToLastWeek": "better|same|worse"
  },
  "weeklyGoals": [
    {"goal": "specific actionable goal", "priority": "high|medium|low", "reason": "why this matters"}
  ],
  "focusAreas": [
    {"area": "category", "tip": "specific actionable advice", "impact": "what improvement to expect"}
  ],
  "nutritionTips": ["specific nutrition advice based on their data"],
  "recoveryTips": ["recovery recommendations"],
  "motivationalQuote": "Personalized encouraging message",
  "nextWeekPlan": {
    "recommendedWorkouts": number,
    "focusMuscleGroups": ["muscles to prioritize"],
    "restDays": number,
    "keyPriority": "main focus for next week"
  }
}`;

    let weeklyInsights;
    
    // Check if API key is available before attempting AI call
    if (!geminiApiKey || geminiApiKey.length === 0) {
      log('warn', 'GEMINI_API_KEY not configured, using fallback insights');
      weeklyInsights = {
        ...fallbackInsights,
        summary: `You completed ${stats.totalWorkouts} workout${stats.totalWorkouts !== 1 ? 's' : ''} this week with ${stats.consistency}% consistency. ${stats.totalWorkouts > 0 ? 'Great job showing up!' : 'Time to get moving!'}`,
        stats: {
          workoutsCompleted: stats.totalWorkouts,
          totalMinutes: stats.totalDuration,
          caloriesBurned: stats.totalCaloriesBurned,
          consistency: `${stats.consistency}%`,
          comparedToLastWeek: "same"
        }
      };
    } else {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${geminiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an elite fitness coach known for motivating athletes while providing data-driven insights.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          log('error', 'AI API error', { status: response.status, body: errorBody });
          if (response.status === 429 || response.status === 402) {
            throw new Error('AI rate limited');
          }
          throw new Error(`AI error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const content = aiResponse.choices[0].message.content;
        
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found');
        
        weeklyInsights = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        log('info', 'Weekly insights generated successfully');

      } catch (aiError) {
        log('warn', 'AI failed, using fallback', { error: aiError.message });
        weeklyInsights = {
          ...fallbackInsights,
          summary: `You completed ${stats.totalWorkouts} workout${stats.totalWorkouts !== 1 ? 's' : ''} this week. Keep pushing forward!`,
          stats: {
            workoutsCompleted: stats.totalWorkouts,
            totalMinutes: stats.totalDuration,
            caloriesBurned: stats.totalCaloriesBurned,
            consistency: `${stats.consistency}%`,
            comparedToLastWeek: "same"
          }
        };
      }
    }

    return new Response(JSON.stringify({
      insights: weeklyInsights,
      rawStats: stats,
      weekStart: weekStartStr,
      message: 'Weekly coach insights ready'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('error', 'Error in weekly coach', { error: error.message });
    return new Response(JSON.stringify({ error: 'Failed to generate weekly insights' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
