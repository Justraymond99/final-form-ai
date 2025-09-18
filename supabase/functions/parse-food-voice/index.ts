import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    
    if (!description) {
      throw new Error('No description provided');
    }

    console.log('Parsing food description:', description);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use OpenAI to parse the food description
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
            content: `You are a nutrition expert. Parse food descriptions and return JSON with food details. 
            Always respond with valid JSON in this exact format:
            {
              "name": "food name",
              "quantity": number,
              "unit": "serving unit",
              "calories": estimated_calories,
              "protein": grams,
              "carbs": grams,
              "fat": grams,
              "fiber": grams,
              "sugar": grams,
              "sodium": milligrams,
              "meal_type": "breakfast|lunch|dinner|snacks"
            }
            
            If you can't determine exact values, provide reasonable estimates based on typical portions.
            Infer meal type from context or time-related clues, default to "snacks" if unclear.`
          },
          {
            role: 'user',
            content: description
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    const foodText = result.choices[0]?.message?.content;

    if (!foodText) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI response:', foodText);

    // Parse the JSON response
    let foodData;
    try {
      foodData = JSON.parse(foodText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', foodText);
      // Try to extract JSON from the response
      const jsonMatch = foodText.match(/\{.*\}/s);
      if (jsonMatch) {
        foodData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    console.log('Parsed food data:', foodData);

    return new Response(
      JSON.stringify({ food: foodData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Food parsing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});