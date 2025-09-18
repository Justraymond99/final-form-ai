import { useEffect, useState } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { PushNotifications, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSettings {
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  achievementNotifications: boolean;
}

export const useNotifications = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    workoutReminders: true,
    mealReminders: true,
    hydrationReminders: true,
    achievementNotifications: true,
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check if we're on web or mobile
      const isWeb = !Capacitor.isNativePlatform();
      
      // Request local notifications permissions (works on web and mobile)
      const permStatus = await LocalNotifications.requestPermissions();
      
      if (permStatus.display === 'granted') {
        setPermissionsGranted(true);
        
        // Only try push notifications on mobile platforms
        if (!isWeb) {
          try {
            const pushPermStatus = await PushNotifications.requestPermissions();
            
            if (pushPermStatus.receive === 'granted') {
              // Register for push notifications
              await PushNotifications.register();
              
              // Add listeners
              PushNotifications.addListener('registration', (token) => {
                console.log('Push registration success, token: ' + token.value);
              });

              PushNotifications.addListener('registrationError', (error) => {
                console.error('Error on registration: ', error);
              });

              PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('Push received: ', notification);
              });

              PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                console.log('Push action performed: ', notification);
              });
            }
          } catch (pushError) {
            console.log('Push notifications not available on this platform');
          }
        }

        // Load settings from storage
        const savedSettings = localStorage.getItem('notification_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // On web, we can still function without notifications
      if (Capacitor.isNativePlatform()) {
        throw error;
      }
    }
  };

  const scheduleWorkoutReminder = async (workoutTime: string, workoutName: string) => {
    if (!permissionsGranted || !settings.workoutReminders) return;

    const [hours, minutes] = workoutTime.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduleDate < new Date()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    const options: ScheduleOptions = {
      notifications: [{
        title: '💪 Time to Work Out!',
        body: `Ready for ${workoutName}? Let's crush your fitness goals!`,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: scheduleDate },
        actionTypeId: 'WORKOUT_REMINDER',
        extra: { workoutName }
      }]
    };

    await LocalNotifications.schedule(options);
  };

  const scheduleMealReminder = async (mealType: string, time: string) => {
    if (!permissionsGranted || !settings.mealReminders) return;

    const [hours, minutes] = time.split(':').map(Number);
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    const mealEmojis = {
      breakfast: '🥞',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎'
    };

    const options: ScheduleOptions = {
      notifications: [{
        title: `${mealEmojis[mealType as keyof typeof mealEmojis]} ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!`,
        body: `Don't forget to log your meal and fuel your body right!`,
        id: Math.floor(Math.random() * 10000),
        schedule: { 
          at: scheduleDate,
          repeats: true,
          every: 'day'
        },
        actionTypeId: 'MEAL_REMINDER',
        extra: { mealType }
      }]
    };

    await LocalNotifications.schedule(options);
  };

  const scheduleHydrationReminder = async () => {
    if (!permissionsGranted || !settings.hydrationReminders) return;

    // Schedule hydration reminders every 2 hours from 8 AM to 8 PM
    const reminders = [];
    for (let hour = 8; hour <= 20; hour += 2) {
      const scheduleDate = new Date();
      scheduleDate.setHours(hour, 0, 0, 0);

      reminders.push({
        title: '💧 Stay Hydrated!',
        body: `Time for a water break! Keep that body hydrated.`,
        id: Math.floor(Math.random() * 10000),
        schedule: { 
          at: scheduleDate,
          repeats: true,
          every: 'day'
        },
        actionTypeId: 'HYDRATION_REMINDER'
      });
    }

    const options: ScheduleOptions = { notifications: reminders };
    await LocalNotifications.schedule(options);
  };

  const sendAchievementNotification = async (achievementTitle: string, description: string) => {
    if (!permissionsGranted || !settings.achievementNotifications) return;

    const options: ScheduleOptions = {
      notifications: [{
        title: `🎉 Achievement Unlocked!`,
        body: `${achievementTitle}: ${description}`,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
        actionTypeId: 'ACHIEVEMENT',
        extra: { achievementTitle }
      }]
    };

    await LocalNotifications.schedule(options);
  };

  const sendMotivationalNotification = async (message: string) => {
    if (!permissionsGranted) return;

    const motivationalEmojis = ['💪', '🔥', '⚡', '🎯', '🚀', '✨'];
    const emoji = motivationalEmojis[Math.floor(Math.random() * motivationalEmojis.length)];

    const options: ScheduleOptions = {
      notifications: [{
        title: `${emoji} Daily Motivation`,
        body: message,
        id: Math.floor(Math.random() * 10000),
        schedule: { at: new Date(Date.now() + 1000) },
        actionTypeId: 'MOTIVATION'
      }]
    };

    await LocalNotifications.schedule(options);
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));

    // Cancel existing reminders if disabled
    if (!newSettings.hydrationReminders && settings.hydrationReminders) {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    }

    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const clearAllNotifications = async () => {
    await LocalNotifications.cancel({ notifications: [] });
  };

  return {
    settings,
    permissionsGranted,
    scheduleWorkoutReminder,
    scheduleMealReminder,
    scheduleHydrationReminder,
    sendAchievementNotification,
    sendMotivationalNotification,
    updateSettings,
    clearAllNotifications,
    initializeNotifications
  };
};