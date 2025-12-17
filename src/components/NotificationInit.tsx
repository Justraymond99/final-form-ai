import { useEffect, useRef, useCallback } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useSecureAuth } from '@/hooks/useSecureAuth';

/**
 * Initialize notification system and set up scheduled reminders
 */
export const NotificationInit = () => {
  const { user } = useSecureAuth();
  const { permission, isSupported, subscribe, sendLocalNotification } = usePushNotifications();
  const initialized = useRef(false);

  const getPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem('notification_preferences');
      return saved ? JSON.parse(saved) : {
        workoutReminders: true,
        mealReminders: true,
        hydrationReminders: true,
        achievementNotifications: true,
        motivationalMessages: true
      };
    } catch {
      return {};
    }
  }, []);

  // Auto-subscribe when permission is granted
  useEffect(() => {
    if (user && permission === 'granted' && isSupported) {
      subscribe();
    }
  }, [user, permission, isSupported, subscribe]);

  // Send daily motivational message
  useEffect(() => {
    if (!user || permission !== 'granted' || initialized.current) return;

    const prefs = getPreferences();
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('last_motivational_date');

    if (prefs.motivationalMessages && savedDate !== today) {
      const messages = [
        "Every workout counts! Keep pushing! 💪",
        "You're stronger than you think! 🔥",
        "Progress, not perfection! ⚡",
        "Your future self will thank you! 🎯",
        "One step at a time, one day at a time! 🚀",
        "Champions are made when no one is watching! ✨"
      ];

      setTimeout(() => {
        sendLocalNotification(
          '💪 Daily Motivation',
          messages[Math.floor(Math.random() * messages.length)],
          { tag: 'daily-motivation' }
        );
        localStorage.setItem('last_motivational_date', today);
      }, 5000);
    }

    initialized.current = true;
  }, [user, permission, getPreferences, sendLocalNotification]);

  // Hydration reminders every 2 hours
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    const checkHydration = () => {
      const prefs = getPreferences();
      if (!prefs.hydrationReminders) return;

      const now = new Date();
      const hour = now.getHours();

      // Only between 8 AM and 8 PM
      if (hour >= 8 && hour <= 20) {
        const lastReminder = localStorage.getItem('last_hydration_reminder');
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

        if (!lastReminder || parseInt(lastReminder) < twoHoursAgo) {
          sendLocalNotification(
            '💧 Stay Hydrated!',
            'Time for a water break! Keep your body running smooth.',
            { tag: 'hydration' }
          );
          localStorage.setItem('last_hydration_reminder', Date.now().toString());
        }
      }
    };

    // Check every 30 minutes
    const interval = setInterval(checkHydration, 30 * 60 * 1000);
    
    // Initial check after 1 minute
    const timeout = setTimeout(checkHydration, 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [user, permission, getPreferences, sendLocalNotification]);

  return null;
};
