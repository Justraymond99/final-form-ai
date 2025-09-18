import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface MultiWeekWorkoutPlan {
  id: string;
  name: string;
  description: string;
  weeks: number;
  difficulty: string;
  weekly_plans: {
    week_number: number;
    focus: string;
    workouts: Array<{
      day: string;
      workout_name: string;
      type: string;
      duration: number;
      exercises: any[];
    }>;
  }[];
  created_at: string;
}

interface MultiWeekNutritionPlan {
  id: string;
  name: string;
  description: string;
  weeks: number;
  goal: string;
  weekly_plans: {
    week_number: number;
    focus: string;
    daily_calories: number;
    meal_plans: Array<{
      day: string;
      meals: any[];
      shopping_list: any[];
    }>;
  }[];
  created_at: string;
}

export const useMultiWeekPlans = () => {
  const { user } = useSecureAuth();
  const [workoutPlans, setWorkoutPlans] = useState<MultiWeekWorkoutPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<MultiWeekNutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkoutPlans([]);
      setNutritionPlans([]);
      setLoading(false);
      return;
    }

    fetchMultiWeekPlans();
  }, [user]);

  const fetchMultiWeekPlans = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch multi-week workout plans
      const { data: workoutData, error: workoutError } = await supabase
        .from('multi_week_workout_plans' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (workoutError) throw workoutError;

      // Fetch multi-week nutrition plans  
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('multi_week_nutrition_plans' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (nutritionError) throw nutritionError;

      setWorkoutPlans((workoutData || []) as unknown as MultiWeekWorkoutPlan[]);
      setNutritionPlans((nutritionData || []) as unknown as MultiWeekNutritionPlan[]);
    } catch (error) {
      console.error('Error fetching multi-week plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMultiWeekWorkoutPlan = async (plan: Omit<MultiWeekWorkoutPlan, 'id' | 'created_at'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('multi_week_workout_plans' as any)
        .insert({
          user_id: user.id,
          ...plan
        })
        .select()
        .single();

      if (error) throw error;

      setWorkoutPlans(prev => [data as unknown as MultiWeekWorkoutPlan, ...prev]);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error saving multi-week workout plan:', error);
      return { success: false, error: error.message };
    }
  };

  const saveMultiWeekNutritionPlan = async (plan: Omit<MultiWeekNutritionPlan, 'id' | 'created_at'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('multi_week_nutrition_plans' as any)
        .insert({
          user_id: user.id,
          ...plan
        })
        .select()
        .single();

      if (error) throw error;

      setNutritionPlans(prev => [data as unknown as MultiWeekNutritionPlan, ...prev]);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error saving multi-week nutrition plan:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteMultiWeekPlan = async (planId: string, type: 'workout' | 'nutrition') => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const table = type === 'workout' ? 'multi_week_workout_plans' : 'multi_week_nutrition_plans';
      
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (type === 'workout') {
        setWorkoutPlans(prev => prev.filter(plan => plan.id !== planId));
      } else {
        setNutritionPlans(prev => prev.filter(plan => plan.id !== planId));
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting multi-week plan:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    workoutPlans,
    nutritionPlans,
    loading,
    fetchMultiWeekPlans,
    saveMultiWeekWorkoutPlan,
    saveMultiWeekNutritionPlan,
    deleteMultiWeekPlan,
  };
};