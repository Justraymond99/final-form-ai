import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";

// Hook for optimistic updates on daily tracking
export const useOptimisticDailyTracking = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const updateWater = useCallback(async (newAmount: number) => {
    if (!user?.id) return;

    const queryKey = ["daily-tracking", user.id, today];
    
    // Get current data
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      water_intake_ml: newAmount,
    }));

    try {
      const { error } = await supabase
        .from("daily_tracking")
        .upsert({
          user_id: user.id,
          date: today,
          water_intake_ml: newAmount,
        }, { onConflict: "user_id,date" });

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to update water intake",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  const updateSteps = useCallback(async (newSteps: number) => {
    if (!user?.id) return;

    const queryKey = ["daily-tracking", user.id, today];
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      steps: newSteps,
    }));

    try {
      const { error } = await supabase
        .from("daily_tracking")
        .upsert({
          user_id: user.id,
          date: today,
          steps: newSteps,
        }, { onConflict: "user_id,date" });

      if (error) throw error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to update steps",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  const updateCalories = useCallback(async (newCalories: number) => {
    if (!user?.id) return;

    const queryKey = ["daily-tracking", user.id, today];
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      calories_consumed: newCalories,
    }));

    try {
      const { error } = await supabase
        .from("daily_tracking")
        .upsert({
          user_id: user.id,
          date: today,
          calories_consumed: newCalories,
        }, { onConflict: "user_id,date" });

      if (error) throw error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to update calories",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  const markWorkoutComplete = useCallback(async (completed: boolean) => {
    if (!user?.id) return;

    const queryKey = ["daily-tracking", user.id, today];
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      workout_completed: completed,
    }));

    try {
      const { error } = await supabase
        .from("daily_tracking")
        .upsert({
          user_id: user.id,
          date: today,
          workout_completed: completed,
        }, { onConflict: "user_id,date" });

      if (error) throw error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to update workout status",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  return {
    updateWater,
    updateSteps,
    updateCalories,
    markWorkoutComplete,
  };
};

// Hook for optimistic goal updates
export const useOptimisticGoals = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();
  const { toast } = useToast();

  const updateGoalProgress = useCallback(async (goalId: string, newValue: number) => {
    if (!user?.id) return;

    const queryKey = ["goals", user.id];
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, (old: any[]) =>
      old?.map((goal: any) =>
        goal.id === goalId ? { ...goal, current_value: newValue } : goal
      )
    );

    try {
      const { error } = await supabase
        .from("goals")
        .update({ current_value: newValue, updated_at: new Date().toISOString() })
        .eq("id", goalId);

      if (error) throw error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, toast]);

  const completeGoal = useCallback(async (goalId: string) => {
    if (!user?.id) return;

    const queryKey = ["goals", user.id];
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old: any[]) =>
      old?.map((goal: any) =>
        goal.id === goalId
          ? { ...goal, completed: true, completed_at: new Date().toISOString() }
          : goal
      )
    );

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", goalId);

      if (error) throw error;
      
      toast({
        title: "Goal completed!",
        description: "Congratulations on reaching your goal!",
      });
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to complete goal",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, toast]);

  return {
    updateGoalProgress,
    completeGoal,
  };
};

// Hook for optimistic food log updates
export const useOptimisticFoodLog = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const addFoodLog = useCallback(async (foodData: {
    food_name: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    meal_type: string;
    quantity: number;
    unit: string;
  }) => {
    if (!user?.id) return;

    const queryKey = ["food-logs", user.id, today];
    const tempId = `temp-${Date.now()}`;
    
    const optimisticLog = {
      id: tempId,
      user_id: user.id,
      logged_at: new Date().toISOString(),
      ...foodData,
    };

    // Optimistically add
    queryClient.setQueryData(queryKey, (old: any[]) => [optimisticLog, ...(old || [])]);

    try {
      const { data, error } = await supabase
        .from("food_logs")
        .insert({
          user_id: user.id,
          ...foodData,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp with real data
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.map((log: any) => (log.id === tempId ? data : log))
      );

      toast({
        title: "Food logged",
        description: `${foodData.food_name} added to ${foodData.meal_type}`,
      });
    } catch (error) {
      // Remove optimistic entry
      queryClient.setQueryData(queryKey, (old: any[]) =>
        old?.filter((log: any) => log.id !== tempId)
      );
      toast({
        title: "Error",
        description: "Failed to log food",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  const deleteFoodLog = useCallback(async (logId: string) => {
    if (!user?.id) return;

    const queryKey = ["food-logs", user.id, today];
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically remove
    queryClient.setQueryData(queryKey, (old: any[]) =>
      old?.filter((log: any) => log.id !== logId)
    );

    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", logId);

      if (error) throw error;
    } catch (error) {
      queryClient.setQueryData(queryKey, previousData);
      toast({
        title: "Error",
        description: "Failed to delete food log",
        variant: "destructive",
      });
    }
  }, [queryClient, user?.id, today, toast]);

  return {
    addFoodLog,
    deleteFoodLog,
  };
};
