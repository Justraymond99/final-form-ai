import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Verify authentication and return authenticated user ID
async function verifyAuth(req: Request): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { userId: null, error: 'Missing authorization header' };
  }

  try {
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error } = await authClient.auth.getUser();
    if (error || !user) {
      return { userId: null, error: 'Invalid or expired token' };
    }

    return { userId: user.id, error: null };
  } catch (error) {
    console.error('Auth verification failed');
    return { userId: null, error: 'Authentication failed' };
  }
}

// Create service client for database queries
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication first
    const { userId: authenticatedUserId, error: authError } = await verifyAuth(req);
    if (authError || !authenticatedUserId) {
      console.warn('Unauthorized ai-fitness-chat request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, userId, stream = true } = await req.json();

    // CRITICAL: Ensure the requested userId matches the authenticated user
    // This prevents users from accessing other users' fitness data
    if (userId && userId !== authenticatedUserId) {
      console.warn('User attempted unauthorized data access');
      return new Response(
        JSON.stringify({ error: 'Access denied: Cannot access other users\' data' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Use the authenticated user ID for all operations
    const targetUserId = authenticatedUserId;

    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    console.log('Processing AI fitness chat request, stream:', stream);

    // Get user's fitness context using the authenticated user ID
    const userContext = await getUserFitnessContext(targetUserId);
    console.log('User context retrieved');

    // If streaming is requested
    if (stream) {
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
              content: createSystemPrompt(userContext)
            },
            { 
              role: 'user', 
              content: message 
            }
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorStatus = response.status;
        console.error('AI gateway error:', errorStatus);
        
        if (response.status === 429 || response.status === 402) {
          const fallbackResponse = getFallbackResponse(message, userContext);
          return new Response(JSON.stringify({ 
            response: fallbackResponse,
            fallback: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`AI gateway error: ${response.status}`);
      }

      // Stream the response back
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming fallback
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
            content: createSystemPrompt(userContext)
          },
          { 
            role: 'user', 
            content: message 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorStatus = response.status;
      console.error('AI API error:', errorStatus);
      
      if (response.status === 429 || response.status === 402) {
        const fallbackResponse = getFallbackResponse(message, userContext);
        return new Response(JSON.stringify({ 
          response: fallbackResponse,
          context: userContext,
          fallback: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: userContext 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-fitness-chat function');
    
    const fallbackResponse = getFallbackResponse("Hello", {});
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      fallback: true
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserFitnessContext(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: dailyTracking } = await supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    const { data: workoutTemplates } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentFoodLogs } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', yesterday.toISOString())
      .order('logged_at', { ascending: false })
      .limit(10);

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
      achievements: achievements || []
    };
  } catch (error) {
    console.error('Error getting user fitness context');
    return {};
  }
}

function createSystemPrompt(userContext: any): string {
  const { profile, dailyTracking, recentWorkouts, workoutTemplates } = userContext;

  let prompt = `You are Athena, an intelligent AI fitness assistant. Be encouraging, specific, and use the user's data for personalized advice. Keep responses concise (2-3 paragraphs max).

USER PROFILE:`;

  if (profile) {
    prompt += `
- Name: ${profile.display_name || 'Not set'}
- Age: ${profile.age || 'Not set'}
- Weight: ${profile.weight_kg ? `${profile.weight_kg}kg` : 'Not set'}
- Goal: ${profile.goal || 'Not set'}
- Fitness Goals: ${profile.fitness_goals ? profile.fitness_goals.join(', ') : 'Not set'}`;
  }

  if (dailyTracking) {
    prompt += `

TODAY'S PROGRESS:
- Calories: ${dailyTracking.calories_consumed || 0}
- Water: ${dailyTracking.water_intake_ml || 0}ml
- Steps: ${dailyTracking.steps || 0}
- Workout: ${dailyTracking.workout_completed ? 'Done' : 'Pending'}
- Streak: ${dailyTracking.workout_streak || 0} days`;
  }

  if (recentWorkouts && recentWorkouts.length > 0) {
    prompt += `

RECENT WORKOUTS: ${recentWorkouts.slice(0, 3).map((w: any) => w.name).join(', ')}`;
  }

  if (workoutTemplates && workoutTemplates.length > 0) {
    prompt += `

AVAILABLE TEMPLATES: ${workoutTemplates.map((t: any) => t.name).join(', ')}`;
  }

  prompt += `

Be conversational, motivational, and reference their specific data when giving advice.`;

  return prompt;
}

function getFallbackResponse(message: string, userContext: any): string {
  const input = message.toLowerCase();
  const { profile, dailyTracking, workoutTemplates } = userContext;
  
  if (input.includes('workout') || input.includes('exercise')) {
    if (workoutTemplates && workoutTemplates.length > 0) {
      return `Great question about workouts! You have ${workoutTemplates.length} workout templates available. Try "${workoutTemplates[0].name}" - it's a great option! What type of workout interests you today?`;
    }
    return "Great question about workouts! I'd recommend starting with compound movements like squats, deadlifts, and push-ups. What's your current fitness level?";
  }
  
  if (input.includes('nutrition') || input.includes('diet') || input.includes('food')) {
    const caloriesConsumed = dailyTracking?.calories_consumed || 0;
    if (caloriesConsumed > 0) {
      return `I see you've logged ${caloriesConsumed} calories today. Focus on whole foods and adequate protein. What specific nutrition goals are you working towards?`;
    }
    return "Nutrition is essential! Focus on whole foods, adequate protein, healthy fats, and complex carbs. What are your specific nutrition goals?";
  }
  
  if (input.includes('progress') || input.includes('tracking')) {
    const streak = dailyTracking?.workout_streak || 0;
    return `Let's look at your progress! ${streak > 0 ? `You're on a ${streak}-day workout streak - fantastic!` : "You're just getting started - that's the hardest part!"} Consistency is key!`;
  }
  
  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    const userName = profile?.display_name ? profile.display_name.split(' ')[0] : '';
    return `Hello${userName ? ` ${userName}` : ''}! 👋 I'm Athena, your AI fitness assistant. I can help with workout planning, nutrition advice, and motivation. What would you like to work on today?`;
  }
  
  const userName = profile?.display_name ? profile.display_name.split(' ')[0] : '';
  return `Thanks for reaching out${userName ? `, ${userName}` : ''}! I can help with workouts, nutrition, goals, and motivation. What would you like to focus on?`;
}
