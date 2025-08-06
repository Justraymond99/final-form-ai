import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: string;
  difficulty: string;
  duration_minutes: number;
  exercises: any;
  target_muscles: string[];
  is_template: boolean;
  created_at: string;
}

interface WorkoutSession {
  id: string;
  template_id: string;
  user_id: string;
  name: string;
  started_at: string;
  completed_at?: string;
  paused_at?: string;
  duration_minutes?: number;
  is_paused: boolean;
  exercises_data: any;
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    const fetchWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWorkouts((data as Workout[]) || []);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const getTemplates = () => workouts.filter(w => w.is_template);
  const getRecentWorkouts = () => workouts.filter(w => !w.is_template);

  const startWorkout = async (workoutId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          template_id: workoutId,
          name: "Current Workout",
          started_at: new Date().toISOString(),
          is_paused: false,
          exercises_data: {}
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data as WorkoutSession);
      return { success: true, session: data };
    } catch (error) {
      console.error('Error starting workout:', error);
      return { success: false, error };
    }
  };

  const pauseWorkout = async () => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          is_paused: true,
          paused_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (error) throw error;
      setCurrentSession({ ...currentSession, is_paused: true });
      return { success: true };
    } catch (error) {
      console.error('Error pausing workout:', error);
      return { success: false, error };
    }
  };

  const resumeWorkout = async () => {
    if (!currentSession) return;

    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          is_paused: false,
          paused_at: null
        })
        .eq('id', currentSession.id);

      if (error) throw error;
      setCurrentSession({ ...currentSession, is_paused: false });
      return { success: true };
    } catch (error) {
      console.error('Error resuming workout:', error);
      return { success: false, error };
    }
  };

  const completeWorkout = async () => {
    if (!currentSession) return;

    try {
      const endTime = new Date().toISOString();
      const startTime = new Date(currentSession.started_at).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const durationSeconds = Math.floor((endTimeMs - startTime) / 1000);

      const { error } = await supabase
        .from('workout_sessions')
        .update({
          completed_at: endTime,
          duration_minutes: Math.floor(durationSeconds / 60)
        })
        .eq('id', currentSession.id);

      if (error) throw error;
      setCurrentSession(null);
      return { success: true };
    } catch (error) {
      console.error('Error completing workout:', error);
      return { success: false, error };
    }
  };

  return {
    workouts,
    templates: getTemplates(),
    recentWorkouts: getRecentWorkouts(),
    currentSession,
    loading,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeWorkout
  };
};