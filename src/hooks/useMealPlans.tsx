import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  dietary_preferences: Json;
  plan_data: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  instructions: string | null;
  created_at: string;
}

export const useMealPlans = () => {
  const { user } = useSecureAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMealPlans([]);
      setLoading(false);
      return;
    }

    const fetchMealPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMealPlans(data || []);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [user]);

  const saveMealPlan = async (mealPlan: any, name: string, description?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Save the main meal plan
      const { data: savedPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name,
          description,
          goal: mealPlan.goal || null,
          target_calories: mealPlan.dailyPlan?.targetCalories || null,
          target_protein: mealPlan.dailyPlan?.targetProtein || null,
          target_carbs: mealPlan.dailyPlan?.targetCarbs || null,
          target_fat: mealPlan.dailyPlan?.targetFat || null,
          dietary_preferences: mealPlan.dietaryPreferences || [],
          plan_data: mealPlan,
          is_active: false
        })
        .select()
        .single();

      if (planError) throw planError;

      // Save individual meal items for easy access
      if (mealPlan.dailyPlan?.meals) {
        const mealItems = mealPlan.dailyPlan.meals.flatMap((meal: any) =>
          meal.foods.map((food: any) => ({
            meal_plan_id: savedPlan.id,
            user_id: user.id,
            meal_type: meal.name.toLowerCase().replace(/\s+/g, '_'),
            food_name: food.name,
            quantity: parseFloat(food.quantity.split(' ')[0]) || 1,
            unit: food.quantity.split(' ').slice(1).join(' ') || 'serving',
            calories: food.calories,
            protein_g: food.protein,
            carbs_g: food.carbs,
            fat_g: food.fat,
            fiber_g: null,
            sugar_g: null,
            sodium_mg: null,
            instructions: meal.instructions
          }))
        );

        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(mealItems);

        if (itemsError) throw itemsError;
      }

      // Refresh meal plans
      const { data: updatedPlans } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setMealPlans(updatedPlans || []);

      return { success: true, plan: savedPlan };
    } catch (error) {
      console.error('Error saving meal plan:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const addMealToFoodLog = async (mealPlanId: string, mealType: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Get meal items for this meal type
      const { data: mealItems, error } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', mealPlanId)
        .eq('user_id', user.id)
        .eq('meal_type', mealType);

      if (error) throw error;

      if (!mealItems || mealItems.length === 0) {
        return { success: false, error: 'No items found for this meal' };
      }

      // Add each item to food log
      const foodLogEntries = mealItems.map(item => ({
        user_id: user.id,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        meal_type: item.meal_type,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        sugar_g: item.sugar_g,
        sodium_mg: item.sodium_mg,
        logged_at: new Date().toISOString()
      }));

      const { error: logError } = await supabase
        .from('food_logs')
        .insert(foodLogEntries);

      if (logError) throw logError;

      return { success: true };
    } catch (error) {
      console.error('Error adding meal to food log:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteMealPlan = async (planId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh meal plans
      setMealPlans(plans => plans.filter(plan => plan.id !== planId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    mealPlans,
    loading,
    saveMealPlan,
    addMealToFoodLog,
    deleteMealPlan
  };
};