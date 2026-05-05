import { useState, useEffect, useCallback } from "react";
import { useWorkouts } from "@/hooks/useWorkouts";

const RATE_APP_STORAGE_KEY = "rate_app_prompt_shown";
const RATE_APP_DISMISSED_KEY = "rate_app_dismissed";
const WORKOUT_THRESHOLD = 5;

export const useRateApp = () => {
  const { sessions } = useWorkouts();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Count completed workouts
  const completedWorkouts = sessions.filter(s => s.completed_at).length;

  useEffect(() => {
    // Check if prompt was already shown or dismissed
    const alreadyShown = localStorage.getItem(RATE_APP_STORAGE_KEY);
    const dismissed = localStorage.getItem(RATE_APP_DISMISSED_KEY);

    // Show prompt if:
    // 1. User has completed 5+ workouts
    // 2. Prompt hasn't been shown before
    // 3. User hasn't dismissed it
    if (
      completedWorkouts >= WORKOUT_THRESHOLD &&
      !alreadyShown &&
      !dismissed
    ) {
      // Small delay to not show immediately on page load
      const timer = setTimeout(() => {
        setShouldShowPrompt(true);
        localStorage.setItem(RATE_APP_STORAGE_KEY, "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [completedWorkouts]);

  const dismissPrompt = useCallback(() => {
    setShouldShowPrompt(false);
    localStorage.setItem(RATE_APP_DISMISSED_KEY, "true");
  }, []);

  const rateNow = useCallback(async () => {
    setShouldShowPrompt(false);
    localStorage.setItem(RATE_APP_DISMISSED_KEY, "true");
    
    // Try to use native rating if available (Capacitor)
    try {
      const win = window as any;
      if (win.Capacitor?.Plugins?.AppRate) {
        await win.Capacitor.Plugins.AppRate.requestReview();
        return;
      }
    } catch (error) {
      console.log("Native rating not available:", error);
    }

    // Fallback: Open App Store / Play Store link
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // Replace with your actual App Store ID
      window.open("https://apps.apple.com/app/id<YOUR_APP_ID>", "_blank");
    } else if (isAndroid) {
      // Replace with your actual Play Store package
      window.open("https://play.google.com/store/apps/details?id=com.finalform.app", "_blank");
    }
  }, []);

  const rateLater = useCallback(() => {
    setShouldShowPrompt(false);
    // Reset the shown flag so it can show again later
    localStorage.removeItem(RATE_APP_STORAGE_KEY);
  }, []);

  return {
    shouldShowPrompt,
    completedWorkouts,
    dismissPrompt,
    rateNow,
    rateLater,
  };
};
