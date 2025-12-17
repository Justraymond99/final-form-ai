import { useEffect, useCallback } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { differenceInDays } from "date-fns";

export const useTrialNotifications = () => {
  const { isInTrial, trialEndDate, subscribed } = useSubscription();
  const { sendLocalNotification, requestPermission, permission } = usePushNotifications();

  const scheduleTrialReminders = useCallback(async () => {
    if (!isInTrial || !trialEndDate || subscribed) return;

    // Request permission if not granted
    if (permission !== 'granted') {
      await requestPermission();
    }

    const now = new Date();
    const daysUntilExpiry = differenceInDays(trialEndDate, now);

    // Send notifications based on days remaining
    if (daysUntilExpiry === 2) {
      await sendLocalNotification(
        "Trial ending soon!",
        "Your 7-day free trial ends in 2 days. Upgrade to keep your AI features."
      );
    } else if (daysUntilExpiry === 1) {
      await sendLocalNotification(
        "Last day of your trial!",
        "Don't lose access to AI workouts and meal plans. Upgrade now!"
      );
    } else if (daysUntilExpiry <= 0) {
      await sendLocalNotification(
        "Your trial has expired",
        "Upgrade to FitTracker Pro to unlock all premium features again."
      );
    }
  }, [isInTrial, trialEndDate, subscribed, permission, requestPermission, sendLocalNotification]);

  // Schedule reminders when trial status changes
  useEffect(() => {
    if (isInTrial && trialEndDate) {
      scheduleTrialReminders();
    }
  }, [isInTrial, trialEndDate, scheduleTrialReminders]);

  // Calculate days remaining
  const daysRemaining = trialEndDate 
    ? Math.max(0, differenceInDays(trialEndDate, new Date()))
    : null;

  return {
    isInTrial,
    daysRemaining,
    trialEndDate,
    scheduleTrialReminders,
  };
};
