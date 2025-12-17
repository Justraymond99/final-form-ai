import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

// Prefetch common data that's used across multiple pages
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  const prefetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ["profile", user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        return data;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient, user?.id]);

  const prefetchDailyTracking = useCallback(async () => {
    if (!user?.id) return;
    
    const today = new Date().toISOString().split("T")[0];
    
    await queryClient.prefetchQuery({
      queryKey: ["daily-tracking", user.id, today],
      queryFn: async () => {
        const { data } = await supabase
          .from("daily_tracking")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .maybeSingle();
        return data;
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  }, [queryClient, user?.id]);

  const prefetchWorkoutTemplates = useCallback(async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ["workout-templates", user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from("workout_templates")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        return data || [];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient, user?.id]);

  const prefetchGoals = useCallback(async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ["goals", user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", false)
          .order("created_at", { ascending: false });
        return data || [];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient, user?.id]);

  const prefetchAchievements = useCallback(async () => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: ["achievements", user.id],
      queryFn: async () => {
        const { data } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", user.id);
        return data || [];
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  }, [queryClient, user?.id]);

  // Prefetch all common data
  const prefetchAll = useCallback(async () => {
    if (!user?.id) return;
    
    // Run prefetches in parallel
    await Promise.all([
      prefetchProfile(),
      prefetchDailyTracking(),
      prefetchWorkoutTemplates(),
      prefetchGoals(),
      prefetchAchievements(),
    ]);
  }, [
    user?.id,
    prefetchProfile,
    prefetchDailyTracking,
    prefetchWorkoutTemplates,
    prefetchGoals,
    prefetchAchievements,
  ]);

  return {
    prefetchAll,
    prefetchProfile,
    prefetchDailyTracking,
    prefetchWorkoutTemplates,
    prefetchGoals,
    prefetchAchievements,
  };
};

// Hook to automatically prefetch data on auth
export const usePrefetchOnAuth = () => {
  const { user } = useSecureAuth();
  const { prefetchAll } = usePrefetch();

  useEffect(() => {
    if (user?.id) {
      // Small delay to not block initial render
      const timeout = setTimeout(() => {
        prefetchAll();
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [user?.id, prefetchAll]);
};
