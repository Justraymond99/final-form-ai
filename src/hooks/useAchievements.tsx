import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  target_value: number;
  current_value: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();

    // Set up real-time subscription for achievements
    const channel = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchAchievements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getCompletedAchievements = () => {
    return achievements.filter(a => a.completed);
  };

  const getInProgressAchievements = () => {
    return achievements.filter(a => !a.completed);
  };

  const getAchievementsByType = (type: string) => {
    return achievements.filter(a => a.achievement_type === type);
  };

  const getRecentAchievements = (limit = 3) => {
    return achievements
      .filter(a => a.completed)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, limit);
  };

  return {
    achievements,
    loading,
    getCompletedAchievements,
    getInProgressAchievements,
    getAchievementsByType,
    getRecentAchievements
  };
};