import { useCallback, useEffect } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useSecureAuth } from './useSecureAuth';

interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  achievementNotifications: boolean;
  motivationalMessages: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  workoutReminders: true,
  mealReminders: true,
  hydrationReminders: true,
  achievementNotifications: true,
  motivationalMessages: true
};

export const useNotificationScheduler = () => {
  const { user } = useSecureAuth();
  const { 
    permission, 
    sendLocalNotification, 
    scheduleNotification 
  } = usePushNotifications();

  const getPreferences = useCallback((): NotificationPreferences => {
    try {
      const saved = localStorage.getItem('notification_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }, []);

  // Workout reminder notification
  const sendWorkoutReminder = useCallback(async (workoutName: string) => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.workoutReminders) return false;

    return sendLocalNotification(
      '💪 Time to Work Out!',
      `Ready for ${workoutName}? Let's crush your fitness goals!`,
      { tag: 'workout-reminder', data: { type: 'workout', workoutName } }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Schedule workout reminder for a specific time
  const scheduleWorkoutReminder = useCallback(async (
    workoutName: string, 
    scheduledTime: Date
  ) => {
    const prefs = getPreferences();
    if (!user || permission !== 'granted' || !prefs.workoutReminders) return false;

    // For immediate reminders (within 1 min), send directly
    if (scheduledTime.getTime() - Date.now() < 60000) {
      return sendWorkoutReminder(workoutName);
    }

    // Schedule for later
    return scheduleNotification(
      'workout_reminder',
      '💪 Time to Work Out!',
      `Ready for ${workoutName}? Let's crush your fitness goals!`,
      scheduledTime,
      { workoutName }
    );
  }, [user, permission, scheduleNotification, sendWorkoutReminder, getPreferences]);

  // Meal logging prompt
  const sendMealReminder = useCallback(async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.mealReminders) return false;

    const mealEmojis = {
      breakfast: '🥞',
      lunch: '🥗', 
      dinner: '🍽️',
      snack: '🍎'
    };

    const mealMessages = {
      breakfast: "Start your day right! Log your breakfast to stay on track.",
      lunch: "Midday fuel check! Don't forget to log your lunch.",
      dinner: "Evening nutrition matters! Log your dinner now.",
      snack: "Quick snack? Make sure to log it!"
    };

    return sendLocalNotification(
      `${mealEmojis[mealType]} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!`,
      mealMessages[mealType],
      { tag: `meal-${mealType}`, data: { type: 'meal', mealType } }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Schedule meal reminders
  const scheduleMealReminders = useCallback(async () => {
    const prefs = getPreferences();
    if (!user || permission !== 'granted' || !prefs.mealReminders) return;

    const mealTimes = [
      { type: 'breakfast' as const, hour: 8 },
      { type: 'lunch' as const, hour: 12 },
      { type: 'dinner' as const, hour: 18 }
    ];

    for (const meal of mealTimes) {
      const scheduleDate = new Date();
      scheduleDate.setHours(meal.hour, 0, 0, 0);
      
      // If time passed today, schedule for tomorrow
      if (scheduleDate < new Date()) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      await scheduleNotification(
        'meal_reminder',
        `Time for ${meal.type}!`,
        `Don't forget to log your ${meal.type} to stay on track!`,
        scheduleDate,
        { mealType: meal.type }
      );
    }
  }, [user, permission, scheduleNotification, getPreferences]);

  // Achievement celebration
  const sendAchievementNotification = useCallback(async (
    title: string, 
    description: string,
    icon?: string
  ) => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.achievementNotifications) return false;

    return sendLocalNotification(
      `🏆 Achievement Unlocked!`,
      `${title}: ${description}`,
      { 
        tag: 'achievement', 
        data: { type: 'achievement', title, description },
        icon: icon || '/icon-192.png'
      }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Hydration reminder
  const sendHydrationReminder = useCallback(async () => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.hydrationReminders) return false;

    const messages = [
      "Time for a water break! Stay hydrated! 💧",
      "Drink some water! Your body will thank you! 💦",
      "Hydration check! Have you had your water? 🥤",
      "Water time! Keep that body running smooth! 💧"
    ];

    return sendLocalNotification(
      '💧 Stay Hydrated!',
      messages[Math.floor(Math.random() * messages.length)],
      { tag: 'hydration' }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Motivational message
  const sendMotivationalMessage = useCallback(async () => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.motivationalMessages) return false;

    const messages = [
      "Every workout counts! Keep pushing! 💪",
      "You're stronger than you think! 🔥",
      "Progress, not perfection! ⚡",
      "Your future self will thank you! 🎯",
      "One step at a time, one day at a time! 🚀",
      "Champions are made when no one is watching! ✨"
    ];

    const emojis = ['💪', '🔥', '⚡', '🎯', '🚀', '✨'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return sendLocalNotification(
      `${emoji} Daily Motivation`,
      messages[Math.floor(Math.random() * messages.length)],
      { tag: 'motivation' }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Streak reminder
  const sendStreakReminder = useCallback(async (currentStreak: number) => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.workoutReminders) return false;

    return sendLocalNotification(
      '🔥 Protect Your Streak!',
      `You're on a ${currentStreak}-day streak! Don't break the chain - complete a workout today!`,
      { tag: 'streak-reminder', data: { type: 'streak', currentStreak } }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Goal completion celebration
  const sendGoalCompletedNotification = useCallback(async (goalTitle: string) => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.achievementNotifications) return false;

    return sendLocalNotification(
      '🎉 Goal Completed!',
      `Congratulations! You've completed your goal: ${goalTitle}`,
      { tag: 'goal-complete', data: { type: 'goal', goalTitle } }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  // Personal record celebration
  const sendPRNotification = useCallback(async (exerciseName: string, weight: number, reps: number) => {
    const prefs = getPreferences();
    if (permission !== 'granted' || !prefs.achievementNotifications) return false;

    return sendLocalNotification(
      '🏋️ New Personal Record!',
      `You crushed it! ${exerciseName}: ${weight}kg x ${reps} reps`,
      { tag: 'personal-record', data: { type: 'pr', exerciseName, weight, reps } }
    );
  }, [permission, sendLocalNotification, getPreferences]);

  return {
    // Immediate notifications
    sendWorkoutReminder,
    sendMealReminder,
    sendHydrationReminder,
    sendAchievementNotification,
    sendMotivationalMessage,
    sendStreakReminder,
    sendGoalCompletedNotification,
    sendPRNotification,
    // Scheduled notifications
    scheduleWorkoutReminder,
    scheduleMealReminders,
    // Utilities
    getPreferences
  };
};
