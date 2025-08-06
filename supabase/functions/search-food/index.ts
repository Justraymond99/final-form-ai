import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 1 } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const API_KEY = Deno.env.get('EDAMAM_APP_KEY');
    const APP_ID = Deno.env.get('EDAMAM_APP_ID');

    if (!API_KEY || !APP_ID) {
      console.error('Missing Edamam API credentials');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Search Edamam Food Database
    const edamamUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${API_KEY}&ingr=${encodeURIComponent(query)}&page=${page}`;
    
    console.log('Searching Edamam for:', query);
    
    const response = await fetch(edamamUrl);
    
    if (!response.ok) {
      console.error('Edamam API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to search food database' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    // Transform Edamam data to our format
    const foods = data.hints?.map((hint: any) => {
      const food = hint.food;
      const nutrients = food.nutrients;
      
      return {
        foodId: food.foodId,
        label: food.label,
        brand: food.brand || null,
        category: food.category || 'Generic',
        image: food.image || null,
        nutrients: {
          calories: Math.round(nutrients.ENERC_KCAL || 0),
          protein: Math.round((nutrients.PROCNT || 0) * 10) / 10,
          carbs: Math.round((nutrients.CHOCDF || 0) * 10) / 10,
          fat: Math.round((nutrients.FAT || 0) * 10) / 10,
          fiber: Math.round((nutrients.FIBTG || 0) * 10) / 10,
          sodium: Math.round((nutrients.NA || 0) * 10) / 10,
        },
        measures: hint.measures || []
      };
    }) || [];

    return new Response(
      JSON.stringify({
        foods,
        totalPages: Math.ceil((data.parsed?.length + data.hints?.length) / 20) || 1,
        currentPage: page
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in search-food function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});