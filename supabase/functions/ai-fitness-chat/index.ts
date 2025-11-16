import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    console.log('Processing AI fitness chat request for user:', userId);

    // Get user's fitness context
    const userContext = await getUserFitnessContext(userId);
    console.log('User fitness context retrieved:', userContext);

    // Create system prompt with user's fitness data
    const systemPrompt = createSystemPrompt(userContext);

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
            { 
              role: 'system', 
              content: `You are a helpful fitness assistant. Provide personalized advice based on:
- User Profile: Age ${userContext.profile?.age}, Weight ${userContext.profile?.weight_kg}kg, Height ${userContext.profile?.height_cm}cm
- Activity: ${userContext.profile?.activity_level || 'moderate'}
- Goals: ${userContext.profile?.fitness_goals?.join(', ') || 'general fitness'}
Keep responses short and practical.`
            },
            { 
              role: 'user', 
              content: message 
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        
        // Check if it's a quota error and provide fallback
        if (response.status === 429) {
          console.log('OpenAI quota exceeded, using fallback response');
          const fallbackResponse = getFallbackResponse(message, userContext);
          return new Response(JSON.stringify({ 
            response: fallbackResponse,
            context: userContext,
            fallback: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
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
    } catch (apiError) {
      console.error('OpenAI API failed, using fallback:', apiError);
      // Always provide a fallback response
      const fallbackResponse = getFallbackResponse(message, userContext);
      return new Response(JSON.stringify({ 
        response: fallbackResponse,
        context: userContext,
        fallback: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in ai-fitness-chat function:', error);
    
    // Always provide a helpful fallback response
    const fallbackResponse = getFallbackResponse(message || "Hello", userContext);
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      context: userContext,
      fallback: true
    }), {
      status: 200, // Return 200 instead of 500 to avoid client errors
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

function getFallbackResponse(message: string, userContext: any): string {
  const input = message.toLowerCase();
  const { profile, dailyTracking, recentWorkouts, workoutTemplates } = userContext;
  
  // Personalized responses based on user data
  if (input.includes('workout') || input.includes('exercise')) {
    if (workoutTemplates && workoutTemplates.length > 0) {
      return `Great question about workouts! I see you have ${workoutTemplates.length} workout templates available. Based on your templates, you could try "${workoutTemplates[0].name}" which is a ${workoutTemplates[0].difficulty} level ${workoutTemplates[0].type} workout. What type of workout are you interested in today?`;
    }
    return "Great question about workouts! I'd recommend starting with compound movements like squats, deadlifts, and push-ups. What's your current fitness level and what are your goals?";
  }
  
  if (input.includes('nutrition') || input.includes('diet') || input.includes('food')) {
    const caloriesConsumed = dailyTracking?.calories_consumed || 0;
    if (caloriesConsumed > 0) {
      return `Nutrition is key to your fitness goals! I see you've logged ${caloriesConsumed} calories today. Focus on whole foods, adequate protein (aim for 0.8-1g per lb of body weight), and staying hydrated. What specific nutrition goals are you working towards?`;
    }
    return "Nutrition is essential for reaching your fitness goals! Focus on whole foods, adequate protein, healthy fats, and complex carbs. Don't forget to stay hydrated! What are your specific nutrition goals?";
  }
  
  if (input.includes('progress') || input.includes('tracking')) {
    const streak = dailyTracking?.workout_streak || 0;
    const steps = dailyTracking?.steps || 0;
    return `Let's look at your progress! ${streak > 0 ? `You're on a ${streak}-day workout streak - fantastic!` : "You're just getting started - that's the hardest part!"} ${steps > 0 ? `You've taken ${steps.toLocaleString()} steps today.` : "Remember to track your daily activities."} Consistency is key to reaching your goals!`;
  }
  
  if (input.includes('goal') || input.includes('target')) {
    const userGoal = profile?.goal;
    if (userGoal) {
      return `I see your goal is "${userGoal}" - that's awesome! Setting clear, specific goals is crucial for success. Break it down into smaller, actionable steps and track your progress regularly. What specific aspect of your goal would you like help with?`;
    }
    return "Setting clear goals is fantastic! Whether it's weight loss, muscle gain, improved endurance, or overall health, I can help you create a plan. What's your main fitness goal?";
  }
  
  if (input.includes('water') || input.includes('hydration')) {
    const waterIntake = dailyTracking?.water_intake_ml || 0;
    const glasses = Math.round(waterIntake / 250);
    return `Hydration is so important! ${glasses > 0 ? `You've had ${glasses} glasses of water today.` : "You haven't logged any water yet today."} Aim for 8-10 glasses daily, more if you're active. Proper hydration helps with energy, recovery, and overall performance!`;
  }
  
  if (input.includes('motivation') || input.includes('help') || input.includes('support')) {
    const streak = dailyTracking?.workout_streak || 0;
    return `I'm here to support you on your fitness journey! ${streak > 0 ? `Your ${streak}-day streak shows you're already building great habits.` : "Remember, every expert was once a beginner."} Progress takes time, but every small step counts. What's one thing you can do today to move closer to your goals?`;
  }
  
  if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('test')) {
    const userName = profile?.display_name ? profile.display_name.split(' ')[0] : '';
    return `Hello${userName ? ` ${userName}` : ''}! 👋 I'm your AI fitness assistant. I can help you with workout planning, nutrition advice, goal setting, and motivation. ${dailyTracking?.workout_streak > 0 ? `Great job on your ${dailyTracking.workout_streak}-day workout streak!` : ''} What would you like to work on today?`;
  }
  
  // Default response with personalization
  const userName = profile?.display_name ? profile.display_name.split(' ')[0] : '';
  return `Thanks for reaching out${userName ? `, ${userName}` : ''}! I'm here to help with your fitness journey. I can assist with workout planning, nutrition guidance, goal setting, progress tracking, and motivation. What specific area would you like to focus on today?`;
}