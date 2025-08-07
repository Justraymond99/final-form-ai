import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing AI fitness chat request for user:', userId);

    // Get user's fitness context
    const userContext = await getUserFitnessContext(userId);
    console.log('User fitness context retrieved:', userContext);

    // Create system prompt with user's fitness data
    const systemPrompt = createSystemPrompt(userContext);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: userContext 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-fitness-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      response: "I'm having trouble processing your request right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserFitnessContext(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get today's tracking data
    const { data: dailyTracking } = await supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get recent workout sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Get workout templates
    const { data: workoutTemplates } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent food logs (today and yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentFoodLogs } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', yesterday.toISOString())
      .order('logged_at', { ascending: false })
      .limit(10);

    // Get goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get custom goals
    const { data: customGoals } = await supabase
      .from('custom_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(5);

    return {
      profile,
      dailyTracking,
      recentWorkouts: recentWorkouts || [],
      workoutTemplates: workoutTemplates || [],
      recentFoodLogs: recentFoodLogs || [],
      goals: goals || [],
      customGoals: customGoals || [],
      achievements: achievements || []
    };
  } catch (error) {
    console.error('Error getting user fitness context:', error);
    return {};
  }
}

function createSystemPrompt(userContext: any): string {
  const { 
    profile, 
    dailyTracking, 
    recentWorkouts, 
    workoutTemplates, 
    recentFoodLogs, 
    goals, 
    customGoals, 
    achievements 
  } = userContext;

  let prompt = `You are an intelligent AI fitness assistant integrated into a comprehensive fitness tracking app. You have access to the user's complete fitness profile and can provide personalized advice, motivation, and insights.

PERSONALITY & APPROACH:
- Be encouraging, knowledgeable, and supportive
- Provide actionable, specific advice
- Use the user's data to give personalized recommendations
- Be motivational but realistic
- Ask follow-up questions when helpful
- Celebrate achievements and progress

USER PROFILE:`;

  if (profile) {
    prompt += `
- Name: ${profile.display_name || 'Not set'}
- Age: ${profile.age || 'Not set'}
- Height: ${profile.height_cm ? `${profile.height_cm}cm` : 'Not set'}
- Weight: ${profile.weight_kg ? `${profile.weight_kg}kg` : 'Not set'}
- Goal: ${profile.goal || 'Not set'}
- Activity Level: ${profile.activity_level || 'Not set'}
- Fitness Goals: ${profile.fitness_goals ? profile.fitness_goals.join(', ') : 'Not set'}`;
  }

  if (dailyTracking) {
    prompt += `

TODAY'S PROGRESS:
- Calories consumed: ${dailyTracking.calories_consumed || 0}
- Water intake: ${dailyTracking.water_intake_ml || 0}ml
- Steps: ${dailyTracking.steps || 0}
- Meditation: ${dailyTracking.meditation_minutes || 0} minutes
- Workout completed: ${dailyTracking.workout_completed ? 'Yes' : 'No'}
- Current workout streak: ${dailyTracking.workout_streak || 0} days`;
  }

  if (recentWorkouts && recentWorkouts.length > 0) {
    prompt += `

RECENT WORKOUTS (Last 7 days):`;
    recentWorkouts.slice(0, 3).forEach((workout: any, index: number) => {
      prompt += `
${index + 1}. ${workout.name} - ${workout.duration_minutes || 'Unknown'}min (${new Date(workout.started_at).toLocaleDateString()})`;
    });
  }

  if (workoutTemplates && workoutTemplates.length > 0) {
    prompt += `

AVAILABLE WORKOUT TEMPLATES:`;
    workoutTemplates.forEach((template: any, index: number) => {
      prompt += `
${index + 1}. ${template.name} - ${template.type}, ${template.difficulty}, ${template.estimated_duration}min`;
    });
  }

  if (recentFoodLogs && recentFoodLogs.length > 0) {
    prompt += `

RECENT FOOD INTAKE:`;
    const todaysFoods = recentFoodLogs.filter((log: any) => 
      new Date(log.logged_at).toDateString() === new Date().toDateString()
    );
    if (todaysFoods.length > 0) {
      prompt += `\nToday: ${todaysFoods.map((log: any) => `${log.food_name} (${log.calories}cal)`).join(', ')}`;
    }
  }

  if (goals && goals.length > 0) {
    prompt += `

CURRENT GOALS:`;
    goals.forEach((goal: any, index: number) => {
      prompt += `
${index + 1}. ${goal.title} - ${goal.current_value}/${goal.target_value} ${goal.unit}`;
    });
  }

  if (customGoals && customGoals.length > 0) {
    prompt += `

CUSTOM GOALS:`;
    customGoals.forEach((goal: any, index: number) => {
      prompt += `
${index + 1}. ${goal.title} - ${goal.current_value}/${goal.target_value} ${goal.unit}`;
    });
  }

  if (achievements && achievements.length > 0) {
    prompt += `

RECENT ACHIEVEMENTS:`;
    achievements.forEach((achievement: any, index: number) => {
      prompt += `
${index + 1}. ${achievement.title} - ${achievement.description}`;
    });
  }

  prompt += `

CAPABILITIES:
You can help with:
- Workout planning and modifications
- Nutrition advice and meal planning
- Goal setting and progress tracking
- Motivation and accountability
- Exercise form and technique tips
- Recovery and rest day planning
- Habit formation strategies
- Progress analysis and insights

Always reference the user's specific data when giving advice. Be conversational and helpful!`;

  return prompt;
}