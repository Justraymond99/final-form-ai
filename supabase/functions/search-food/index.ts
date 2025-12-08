import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Verify authentication
async function verifyAuth(req: Request): Promise<{ userId: string | null; error: string | null }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { userId: null, error: 'Missing authorization header' };
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      return { userId: null, error: 'Invalid or expired token' };
    }

    return { userId: user.id, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { userId: null, error: 'Authentication failed' };
  }
}

// Search USDA FoodData Central
async function searchUSDA(query: string, page: number) {
  const apiKey = Deno.env.get('USDA_API_KEY');
  if (!apiKey) {
    console.error('USDA_API_KEY not found');
    return null;
  }

  const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=10&pageNumber=${page}&dataType=Branded,Foundation,SR Legacy`;
  
  const response = await fetch(usdaUrl);
  if (!response.ok) {
    console.error('USDA API error:', response.status);
    return null;
  }

  const data = await response.json();
  
  return data.foods?.map((food: any) => {
    const nutrients = food.foodNutrients || [];
    
    const findNutrient = (nutrientId: number) => {
      const nutrient = nutrients.find((n: any) => n.nutrientId === nutrientId);
      return nutrient ? nutrient.value || 0 : 0;
    };
    
    return {
      foodId: `usda_${food.fdcId}`,
      label: food.description,
      brand: food.brandOwner || food.brandName || null,
      category: food.foodCategory || 'Generic',
      image: null,
      source: 'USDA',
      nutrients: {
        calories: Math.round(findNutrient(1008)),
        protein: Math.round(findNutrient(1003) * 10) / 10,
        carbs: Math.round(findNutrient(1005) * 10) / 10,
        fat: Math.round(findNutrient(1004) * 10) / 10,
        fiber: Math.round(findNutrient(1079) * 10) / 10,
        sodium: Math.round(findNutrient(1093) * 10) / 10,
      },
      measures: [
        { label: '100g', weight: 100 },
        { label: '1 serving', weight: food.servingSize || 100 }
      ]
    };
  }) || [];
}

// Search OpenFoodFacts for branded items
async function searchOpenFoodFacts(query: string, page: number) {
  const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page=${page + 1}&page_size=10&json=1&fields=product_name,brands,image_url,nutriments,serving_size`;
  
  const response = await fetch(offUrl);
  if (!response.ok) {
    console.error('OpenFoodFacts API error:', response.status);
    return null;
  }

  const data = await response.json();
  
  return data.products?.map((product: any) => {
    const n = product.nutriments || {};
    
    return {
      foodId: `off_${product.code || Math.random().toString(36).substr(2, 9)}`,
      label: product.product_name || 'Unknown Product',
      brand: product.brands || null,
      category: 'Branded Food',
      image: product.image_url || null,
      source: 'OpenFoodFacts',
      nutrients: {
        calories: Math.round(n.energy_value || n['energy-kcal_100g'] || 0),
        protein: Math.round((n.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((n.fat_100g || 0) * 10) / 10,
        fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
        sodium: Math.round((n.sodium_100g || 0) * 1000 * 10) / 10, // Convert g to mg
      },
      measures: [
        { label: '100g', weight: 100 },
        { label: '1 serving', weight: parseFloat(product.serving_size) || 100 }
      ]
    };
  }).filter((item: any) => item.nutrients.calories > 0) || [];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const { userId, error: authError } = await verifyAuth(req);
    if (authError || !userId) {
      console.warn('Unauthorized search-food request:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

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

    console.log(`User ${userId} searching for:`, query);

    // Search both USDA and OpenFoodFacts in parallel
    const [usdaResults, offResults] = await Promise.allSettled([
      searchUSDA(query, page),
      searchOpenFoodFacts(query, page)
    ]);

    let allFoods: any[] = [];

    // Add OpenFoodFacts results (branded items) first
    if (offResults.status === 'fulfilled' && offResults.value) {
      allFoods.push(...offResults.value);
      console.log(`Found ${offResults.value.length} items from OpenFoodFacts`);
    }

    // Add USDA results (generic items)
    if (usdaResults.status === 'fulfilled' && usdaResults.value) {
      allFoods.push(...usdaResults.value);
      console.log(`Found ${usdaResults.value.length} items from USDA`);
    }

    // If both failed, return error
    if (allFoods.length === 0) {
      console.error('Both food databases failed');
      return new Response(
        JSON.stringify({ error: 'Failed to search food database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        foods: allFoods.slice(0, 20), // Limit to 20 total results
        totalPages: Math.ceil(allFoods.length / 20),
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
