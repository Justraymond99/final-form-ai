import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, mealType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from user profile
    const profileContext = [];
    if (userProfile?.goal) profileContext.push(`Goal: ${userProfile.goal}`);
    if (userProfile?.dietary_preferences?.length) {
      profileContext.push(`Dietary preferences: ${userProfile.dietary_preferences.join(', ')}`);
    }
    if (userProfile?.allergies?.length) {
      profileContext.push(`Allergies: ${userProfile.allergies.join(', ')}`);
    }
    if (userProfile?.target_calories_per_day) {
      profileContext.push(`Target calories: ${userProfile.target_calories_per_day}/day`);
    }

    const systemPrompt = `You are a nutrition AI assistant. Suggest 5 specific, real food items that would be good for ${mealType || 'a meal'}.

${profileContext.length > 0 ? 'User context:\n' + profileContext.join('\n') : ''}

Return ONLY a JSON array of food suggestions. Each suggestion should have:
- name: specific food item name (e.g., "Fage Total 0% Greek Yogurt", "Grilled Chicken Breast")
- brand: brand name if applicable (e.g., "Fage", "Perdue") or null for generic items
- reason: brief reason why it's good (max 50 chars)

Example format:
[
  {"name": "Fage Total 0% Greek Yogurt", "brand": "Fage", "reason": "High protein, low sugar"},
  {"name": "Grilled Chicken Breast", "brand": null, "reason": "Lean protein for muscle"}
]`;

    console.log('Calling AI for food suggestions...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest foods for ${mealType || 'a meal'}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    let suggestions;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      suggestions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-food-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
