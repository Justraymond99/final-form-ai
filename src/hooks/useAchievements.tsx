import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const previousCompletedIds = useRef<Set<string>>(new Set());

  // Send browser notification for achievement
  const sendAchievementNotification = async (achievement: Achievement) => {
    // Check if notification preferences allow it
    const prefs = localStorage.getItem('notification_preferences');
    const preferences = prefs ? JSON.parse(prefs) : { achievementNotifications: true };
    
    if (!preferences.achievementNotifications) return;

    // Show toast notification
    toast({
      title: "🎉 Achievement Unlocked!",
      description: `${achievement.title}: ${achievement.description}`,
    });

    // Try browser push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
          await registration.showNotification("🎉 Achievement Unlocked!", {
            body: `${achievement.title}: ${achievement.description}`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `achievement-${achievement.id}`
          });
        }
      } catch (error) {
        console.log('Push notification not available:', error);
      }
    }
  };

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
        
        const newAchievements = data || [];
        
        // Check for newly completed achievements
        newAchievements.forEach(achievement => {
          if (
            achievement.completed && 
            !previousCompletedIds.current.has(achievement.id) &&
            previousCompletedIds.current.size > 0 // Don't notify on initial load
          ) {
            sendAchievementNotification(achievement);
          }
        });

        // Update the set of completed achievement IDs
        previousCompletedIds.current = new Set(
          newAchievements.filter(a => a.completed).map(a => a.id)
        );

        setAchievements(newAchievements);
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
  }, [user, toast]);

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