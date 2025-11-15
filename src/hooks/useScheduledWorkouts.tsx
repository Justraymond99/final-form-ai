import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { useToast } from "./use-toast";

interface ScheduledWorkout {
  id: string;
  user_id: string;
  workout_template_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  completed: boolean;
  completed_session_id?: string;
  notes?: string;
}

export const useScheduledWorkouts = () => {
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSecureAuth();
  const { toast } = useToast();

  const fetchScheduledWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("scheduled_workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setScheduledWorkouts(data || []);
    } catch (error: any) {
      console.error("Error fetching scheduled workouts:", error);
      toast({
        title: "Error loading scheduled workouts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleWorkout = async (templateId: string, date: Date, time?: string) => {
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const { error } = await supabase.from("scheduled_workouts").insert({
        user_id: user.id,
        workout_template_id: templateId,
        scheduled_date: date.toISOString().split("T")[0],
        scheduled_time: time,
      });

      if (error) throw error;
      await fetchScheduledWorkouts();
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (scheduledWorkoutId: string, sessionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("scheduled_workouts")
        .update({
          completed: true,
          completed_session_id: sessionId,
        })
        .eq("id", scheduledWorkoutId);

      if (error) throw error;
      await fetchScheduledWorkouts();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledWorkouts();
  }, [user]);

  return {
    scheduledWorkouts,
    scheduleWorkout,
    markAsCompleted,
    loading,
    refetch: fetchScheduledWorkouts,
  };
};
