import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Nutrition Generator function called');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { 
      userId, 
      goal, 
      dietaryPreferences, 
      allergies, 
      targetCalories, 
      mealsPerDay,
      cookingTime,
      budget 
    } = await req.json();

    console.log('Request data:', { userId, goal, dietaryPreferences, targetCalories });

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Build prompt for nutrition plan generation
    const prompt = `Generate a personalized nutrition plan based on the following requirements:

User Profile:
- Age: ${profile?.age || 'Not specified'}
- Weight: ${profile?.weight_kg || 'Not specified'} kg
- Height: ${profile?.height_cm || 'Not specified'} cm  
- Activity Level: ${profile?.activity_level || 'moderate'}
- Primary Goal: ${goal || 'general health'}

Nutrition Requirements:
- Target Calories: ${targetCalories || 2000} per day
- Meals per Day: ${mealsPerDay || 3}
- Maximum Cooking Time: ${cookingTime || 30} minutes
- Budget Level: ${budget || 'moderate'}
- Dietary Preferences: ${dietaryPreferences?.join(', ') || 'None specified'}
- Allergies/Restrictions: ${allergies?.join(', ') || 'None'}

Please generate a comprehensive nutrition plan with:
1. Daily meal schedule with specific meal suggestions
2. Macro breakdown (protein, carbs, fats) for each meal
3. Shopping list with estimated quantities
4. Meal prep instructions
5. Nutritional tips specific to their goal

Format the response as a structured JSON with the following structure:
{
  "dailyPlan": {
    "targetCalories": number,
    "targetProtein": number,
    "targetCarbs": number,
    "targetFat": number,
    "meals": [
      {
        "name": "Breakfast/Lunch/Dinner/Snack",
        "time": "HH:MM",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "foods": [
          {
            "name": "Food item",
            "quantity": "amount with unit",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        ],
        "instructions": "Brief cooking/prep instructions"
      }
    ]
  },
  "shoppingList": [
    {
      "category": "Proteins/Vegetables/Grains/etc",
      "items": [
        {
          "name": "Item name",
          "quantity": "amount needed",
          "estimatedCost": "$X.XX"
        }
      ]
    }
  ],
  "mealPrepTips": [
    "Practical meal prep advice"
  ],
  "nutritionTips": [
    "Goal-specific nutrition advice"
  ]
}

Make sure all meals fit within the calorie target and dietary restrictions.`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert nutritionist and meal planner. Generate practical, healthy, and personalized nutrition plans that are easy to follow and budget-friendly. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;
    
    let nutritionPlan;
    try {
      nutritionPlan = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback to text response if JSON parsing fails
      nutritionPlan = {
        textPlan: generatedContent,
        error: 'Could not parse structured plan'
      };
    }

    console.log('Nutrition plan generated successfully');

    return new Response(JSON.stringify({
      success: true,
      nutritionPlan
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-nutrition-generator function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});