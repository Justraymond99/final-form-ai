import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CustomGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  goal_type: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<CustomGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGoals(data || []);
      } catch (error) {
        console.error('Error fetching custom goals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  const createGoal = async (goalData: Omit<CustomGoal, 'id' | 'user_id' | 'current_value' | 'completed' | 'completed_at' | 'created_at' | 'updated_at'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('custom_goals')
        .insert({
          user_id: user.id,
          ...goalData,
          current_value: 0,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { success: false, error };
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<CustomGoal>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('custom_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setGoals(prev => prev.map(goal => goal.id === goalId ? data : goal));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error };
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('custom_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error };
    }
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal
  };
};