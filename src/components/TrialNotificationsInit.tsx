import { useTrialNotifications } from "@/hooks/useTrialNotifications";

// This component initializes trial expiry notifications
export const TrialNotificationsInit = () => {
  // Just use the hook to initialize notifications
  useTrialNotifications();
  return null;
};
