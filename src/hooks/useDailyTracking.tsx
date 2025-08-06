import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DailyTrackingData {
  id?: string;
  user_id: string;
  date: string;
  calories_consumed: number;
  water_intake_ml: number;
  workout_completed: boolean;
  workout_streak: number;
  steps: number;
  meditation_minutes: number;
}

export const useDailyTracking = (selectedDate?: string) => {
  const { user } = useAuth();
  const [data, setData] = useState<DailyTrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = selectedDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchDailyData = async () => {
      try {
        const { data: trackingData, error } = await supabase
          .from('daily_tracking')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', currentDate)
          .maybeSingle();

        if (error) throw error;

        if (!trackingData) {
          // Create new record for today
          const { data: newData, error: insertError } = await supabase
            .from('daily_tracking')
            .insert({
              user_id: user.id,
              date: currentDate,
              calories_consumed: 0,
              water_intake_ml: 0,
              workout_completed: false,
              workout_streak: 0,
              steps: 0,
              meditation_minutes: 0
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setData(newData);
        } else {
          setData(trackingData);
        }
      } catch (error) {
        console.error('Error fetching daily tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [user, currentDate]);

  const updateTracking = async (updates: Partial<DailyTrackingData>) => {
    if (!user || !data) return;

    try {
      const { error } = await supabase
        .from('daily_tracking')
        .update(updates)
        .eq('user_id', user.id)
        .eq('date', currentDate);

      if (error) throw error;
      
      setData({ ...data, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Error updating tracking:', error);
      return { success: false, error };
    }
  };

  const logWater = async (amountMl: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('water_logs')
        .insert({
          user_id: user.id,
          amount_ml: amountMl,
          date: currentDate
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging water:', error);
      return { success: false, error };
    }
  };

  return { data, loading, updateTracking, logWater };
};