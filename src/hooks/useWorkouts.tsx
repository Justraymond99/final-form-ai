import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: string;
  difficulty: string;
  estimated_duration: number;
  exercises: any;
  description?: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setSessions([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch workout templates (both user-specific and default public templates)
        const { data: workoutData, error: workoutError } = await supabase
          .from('workout_templates')
          .select('*')
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .order('created_at', { ascending: false });

        if (workoutError) throw workoutError;
        setWorkouts(workoutData || []);

        // Fetch workout sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sessionError) throw sessionError;
        setSessions(sessionData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getTemplates = () => workouts; // All items from workout_templates are templates
  const getRecentWorkouts = () => sessions.slice(0, 5); // Recent sessions

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
    sessions,
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