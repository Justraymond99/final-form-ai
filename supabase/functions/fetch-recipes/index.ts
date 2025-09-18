import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Recipe {
  id: string;
  title: string;
  category: string;
  area: string;
  instructions: string;
  image: string;
  ingredients: Array<{
    name: string;
    measure: string;
  }>;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, searchTerm, count = 12 } = await req.json();
    console.log('Fetching recipes with params:', { category, searchTerm, count });

    let recipes: Recipe[] = [];

    if (searchTerm) {
      // Search by name
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.meals) {
        recipes = data.meals.slice(0, count).map(transformMeal);
      }
    } else if (category) {
      // Get by category
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (data.meals) {
        // Get detailed info for each meal
        const detailedRecipes = await Promise.all(
          data.meals.slice(0, count).map(async (meal: any) => {
            const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            const detailData = await detailResponse.json();
            return detailData.meals ? transformMeal(detailData.meals[0]) : null;
          })
        );
        recipes = detailedRecipes.filter(Boolean);
      }
    } else {
      // Get random recipes
      const randomRecipes = await Promise.all(
        Array(count).fill(0).map(async () => {
          const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
          const data = await response.json();
          return data.meals ? transformMeal(data.meals[0]) : null;
        })
      );
      recipes = randomRecipes.filter(Boolean);
    }

    // Add estimated nutrition data (TheMealDB doesn't provide this)
    recipes = recipes.map(recipe => ({
      ...recipe,
      calories: estimateCalories(recipe),
      protein: estimateProtein(recipe),
      carbs: estimateCarbs(recipe),
      fat: estimateFat(recipe),
    }));

    console.log(`Successfully fetched ${recipes.length} recipes`);

    return new Response(JSON.stringify({ recipes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch recipes', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function transformMeal(meal: any): Recipe {
  const ingredients = [];
  
  // Extract ingredients and measurements
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || ''
      });
    }
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory || '',
    area: meal.strArea || '',
    instructions: meal.strInstructions || '',
    image: meal.strMealThumb || '',
    ingredients,
  };
}

// Simple estimation functions based on common ingredients
function estimateCalories(recipe: Recipe): number {
  const baseCalories = 300;
  const ingredientCount = recipe.ingredients.length;
  return Math.round(baseCalories + (ingredientCount * 25));
}

function estimateProtein(recipe: Recipe): number {
  let protein = 15; // base protein
  
  recipe.ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    if (name.includes('chicken') || name.includes('beef') || name.includes('fish') || name.includes('turkey')) {
      protein += 25;
    } else if (name.includes('egg') || name.includes('cheese') || name.includes('milk')) {
      protein += 8;
    } else if (name.includes('beans') || name.includes('lentils') || name.includes('nuts')) {
      protein += 10;
    }
  });
  
  return Math.round(protein);
}

function estimateCarbs(recipe: Recipe): number {
  let carbs = 20; // base carbs
  
  recipe.ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || name.includes('potato')) {
      carbs += 30;
    } else if (name.includes('flour') || name.includes('sugar')) {
      carbs += 20;
    } else if (name.includes('vegetable') || name.includes('fruit')) {
      carbs += 8;
    }
  });
  
  return Math.round(carbs);
}

function estimateFat(recipe: Recipe): number {
  let fat = 8; // base fat
  
  recipe.ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    if (name.includes('oil') || name.includes('butter') || name.includes('cream')) {
      fat += 15;
    } else if (name.includes('nuts') || name.includes('avocado')) {
      fat += 12;
    } else if (name.includes('cheese')) {
      fat += 8;
    }
  });
  
  return Math.round(fat);
}