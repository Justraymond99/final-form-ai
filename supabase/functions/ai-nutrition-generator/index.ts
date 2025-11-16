import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
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
    
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { 
      goal, 
      dietaryPreferences, 
      allergies, 
      targetCalories, 
      cookingTime,
      budgetRange,
      additionalNotes,
      programLength
    } = await req.json();

    console.log('Request data:', { userId: user.id, goal, dietaryPreferences, targetCalories });

    if (!goal || !targetCalories) {
      throw new Error('Goal and target calories are required');
    }

    // Get user profile for personalization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Build prompt for nutrition plan generation
    const prompt = `Generate a personalized ${programLength}-week nutrition plan based on the following requirements:

User Profile:
- Age: ${profile?.age || 'Not specified'}
- Weight: ${profile?.weight_kg || 'Not specified'} kg
- Height: ${profile?.height_cm || 'Not specified'} cm  
- Activity Level: ${profile?.activity_level || 'moderate'}
- Primary Goal: ${goal || 'general health'}

Nutrition Requirements:
- Target Calories: ${targetCalories || 2000} per day
- Meals per Day: 3 main meals + 2 snacks
- Maximum Cooking Time: ${cookingTime || 30} minutes per meal
- Budget Level: ${budgetRange || 'moderate'}
- Dietary Preferences: ${dietaryPreferences?.join(', ') || 'None specified'}
- Allergies/Restrictions: ${allergies?.join(', ') || 'None'}
- Additional Notes: ${additionalNotes || 'None'}
- Program Duration: ${programLength} week(s)

CRITICAL INSTRUCTIONS FOR FOOD ITEMS:
- Use SPECIFIC, REAL food items with exact measurements (e.g., "8oz boneless skinless chicken breast", not "chicken")
- Include BRAND NAMES for packaged foods when relevant (e.g., "Fage Total 0% Greek Yogurt", "Nature Valley Granola Bar")
- Use REAL products that exist in grocery stores
- Specify exact cuts and types (e.g., "93% lean ground beef", "extra virgin olive oil", "baby spinach")
- For produce, use specific varieties (e.g., "Granny Smith apple", "Roma tomatoes", "yellow onion")
- Include specific preparations (e.g., "wild-caught salmon fillet", "organic free-range eggs")
- All quantities must be precise with proper units (oz, g, cups, tbsp, etc.)

Please generate a comprehensive ${programLength}-week nutrition plan with:
1. Weekly meal schedules for each week with progressive improvements
2. Daily meal plans with 5 meals per day (breakfast, lunch, dinner, 2 snacks)
3. Macro breakdown (protein, carbs, fats) for each meal
4. Shopping lists for each week with specific brands and products
5. Meal prep instructions with real ingredient names
6. Progressive nutrition tips for each week

Format the response as a structured JSON with the following structure:
{
  "weeks": [
    {
      "weekNumber": number,
      "theme": "Week theme/focus",
      "targetCalories": number,
      "targetProtein": number,
      "targetCarbs": number,
      "targetFat": number,
      "days": [
        {
          "dayNumber": number,
          "meals": [
            {
              "meal_type": "breakfast/lunch/dinner/snack_am/snack_pm",
              "name": "Specific meal name with real ingredients",
              "time": "HH:MM",
              "calories": number,
              "protein_g": number,
              "carbs_g": number,
              "fat_g": number,
              "items": [
                {
                  "name": "Specific food item with brand/type (e.g., 'Fage Total 0% Greek Yogurt')",
                  "quantity": "precise amount",
                  "unit": "oz/g/cup/tbsp/etc",
                  "calories": number,
                  "protein_g": number,
                  "carbs_g": number,
                  "fat_g": number
                }
              ],
              "instructions": "Brief cooking/prep instructions with specific ingredient names"
            }
          ]
        }
      ],
      "shoppingList": [
        {
          "category": "Proteins/Vegetables/Grains/Dairy/Snacks/etc",
          "items": [
            {
              "name": "Specific product name with brand when applicable",
              "quantity": "amount needed for the week",
              "estimatedCost": "$X.XX"
            }
          ]
        }
      ],
      "weeklyTips": [
        "Week-specific nutrition and prep advice"
      ]
    }
  ],
  "overallTips": [
    "General program guidance and tips"
  ]
}

Make sure all meals fit within the calorie target and dietary restrictions. Use only real, specific foods that people can actually purchase.`;

    console.log('Calling Lovable AI...');

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
            content: 'You are an expert nutritionist and meal planner. Generate practical, healthy, and personalized nutrition plans that are easy to follow and budget-friendly. Always respond with valid JSON format.'
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

    const data = await response.json();
    console.log('Lovable AI response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from AI API');
    }

    const generatedContent = data.choices[0].message.content;
    
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
    
    let nutritionPlan;
    try {
      const cleanedContent = extractJSON(generatedContent);
      nutritionPlan = JSON.parse(cleanedContent);
      console.log('Nutrition plan parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', generatedContent);
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