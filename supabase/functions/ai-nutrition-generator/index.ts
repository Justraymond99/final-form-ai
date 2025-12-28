import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { checkRateLimit, rateLimitResponse } from '../_shared/rate-limiter.ts';

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

    // Check rate limit
    const rateLimitResult = await checkRateLimit(user.id, 'ai-nutrition-generator');
    if (!rateLimitResult.allowed) {
      console.log('Rate limit exceeded');
      return rateLimitResponse(rateLimitResult, corsHeaders);
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

    console.log('Request received:', { goal, targetCalories });

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

    // Build the prompt with explicit weekly variations requirement
    const weeksCount = parseInt(programLength) || 1;
    const weeklyVariationsExample = Array.from({ length: Math.min(weeksCount, 12) }, (_, i) => 
      `{ "week": ${i + 1}, "focus": "string", "tip": "string", "calorieAdjustment": number }`
    ).join(',\n      ');

    const prompt = `Generate a ${programLength}-week nutrition plan summary.

User Info:
- Goal: ${goal}
- Target Calories: ${targetCalories}/day
- Dietary Preferences: ${dietaryPreferences?.join(', ') || 'None'}
- Allergies: ${allergies?.join(', ') || 'None'}
- Max Cooking Time: ${cookingTime} min
- Budget: ${budgetRange}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "weeks": ${programLength},
  "dailyCalories": ${targetCalories},
  "goal": "${goal}",
  "macros": { "protein": number, "carbs": number, "fat": number },
  "sampleDay": {
    "breakfast": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "items": ["item1", "item2"] },
    "lunch": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "items": ["item1", "item2"] },
    "dinner": { "name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "items": ["item1", "item2"] },
    "snacks": [{ "name": "string", "calories": number }]
  },
  "weeklyVariations": [
    YOU MUST include an entry for EVERY week from 1 to ${programLength}. Example format:
    ${weeklyVariationsExample}
  ],
  "shoppingList": ["item1", "item2", "item3", ... include at least 15-20 items],
  "tips": ["tip1", "tip2", "tip3"]
}

IMPORTANT:
- weeklyVariations MUST have exactly ${programLength} entries, one for each week
- Each week should have progressive focus (e.g., Week 1: "Foundation", Week 2: "Building habits", etc.)
- calorieAdjustment should show gradual changes based on the goal (e.g., -50 for weight loss, +100 for muscle building)
- shoppingList should include all ingredients from the sample day meals plus pantry staples
- Use real, specific foods with accurate nutritional values
- Keep response concise but complete.`;

    console.log('Calling Lovable AI...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

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
              content: 'You are a nutritionist. Return ONLY valid JSON, no markdown or explanation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
        const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (codeBlockMatch) return codeBlockMatch[1];
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return jsonMatch[0];
        return text;
      };
      
      let nutritionPlan;
      try {
        const cleanedContent = extractJSON(generatedContent);
        nutritionPlan = JSON.parse(cleanedContent);
        console.log('Nutrition plan parsed successfully');
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        nutritionPlan = {
          weeks: parseInt(programLength),
          dailyCalories: parseInt(targetCalories),
          macros: { protein: 150, carbs: 200, fat: 65 },
          sampleDay: {
            breakfast: { name: "Oatmeal with fruit", calories: 400, protein: 15, carbs: 60, fat: 10, items: ["Oats", "Banana", "Honey"] },
            lunch: { name: "Grilled chicken salad", calories: 500, protein: 40, carbs: 30, fat: 20, items: ["Chicken breast", "Mixed greens", "Olive oil"] },
            dinner: { name: "Salmon with vegetables", calories: 600, protein: 45, carbs: 35, fat: 25, items: ["Salmon fillet", "Broccoli", "Brown rice"] },
            snacks: [{ name: "Greek yogurt", calories: 150 }, { name: "Almonds", calories: 150 }]
          },
          tips: ["Stay hydrated", "Eat protein with every meal", "Prep meals on Sunday"]
        };
      }

      console.log('Nutrition plan generated successfully');

      return new Response(JSON.stringify({
        success: true,
        nutritionPlan
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return new Response(JSON.stringify({
          success: false,
          error: 'Request timed out. Please try again.'
        }), {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw fetchError;
    }

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