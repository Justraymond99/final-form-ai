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
    const { query, page = 0 } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Search USDA FoodData Central (completely free, no API key needed)
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=20&pageNumber=${page}&dataType=Foundation,SR Legacy,Survey (FNDDS)`;
    
    console.log('Searching USDA FoodData Central for:', query);
    
    const response = await fetch(usdaUrl);
    
    if (!response.ok) {
      console.error('USDA API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to search food database' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    // Transform USDA data to our format
    const foods = data.foods?.map((food: any) => {
      const nutrients = food.foodNutrients || [];
      
      // Helper to find nutrient by ID
      const findNutrient = (nutrientId: number) => {
        const nutrient = nutrients.find((n: any) => n.nutrientId === nutrientId);
        return nutrient ? nutrient.value || 0 : 0;
      };
      
      return {
        foodId: food.fdcId.toString(),
        label: food.description,
        brand: food.brandOwner || food.brandName || null,
        category: food.foodCategory || 'Generic',
        image: null,
        nutrients: {
          calories: Math.round(findNutrient(1008)), // Energy (kcal)
          protein: Math.round(findNutrient(1003) * 10) / 10, // Protein
          carbs: Math.round(findNutrient(1005) * 10) / 10, // Carbs
          fat: Math.round(findNutrient(1004) * 10) / 10, // Total fat
          fiber: Math.round(findNutrient(1079) * 10) / 10, // Fiber
          sodium: Math.round(findNutrient(1093) * 10) / 10, // Sodium (mg)
        },
        measures: [
          { label: '100g', weight: 100 },
          { label: '1 serving', weight: 100 }
        ]
      };
    }) || [];

    return new Response(
      JSON.stringify({
        foods,
        totalPages: Math.ceil((data.totalHits || 0) / 20),
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