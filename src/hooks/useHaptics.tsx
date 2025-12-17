import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useCallback } from 'react';

// Check if we're on a mobile device with Capacitor available
const isCapacitorAvailable = () => {
  return typeof window !== 'undefined' && 
         (window as any).Capacitor !== undefined;
};

export const useHaptics = () => {
  // Light tap - for button presses
  const lightTap = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Medium tap - for selections, toggles
  const mediumTap = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Heavy tap - for important actions
  const heavyTap = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Success notification - for completed actions
  const success = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Warning notification
  const warning = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Error notification
  const error = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      // Haptics not available, fail silently
    }
  }, []);

  // Selection changed - for pickers, sliders
  const selectionChanged = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.selectionChanged();
    } catch (err) {
      // Haptics not available, fail silently
    }
  }, []);

  // Selection start - for beginning a selection
  const selectionStart = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.selectionStart();
    } catch (err) {
      // Haptics not available, fail silently
    }
  }, []);

  // Selection end - for ending a selection
  const selectionEnd = useCallback(async () => {
    if (!isCapacitorAvailable()) return;
    try {
      await Haptics.selectionEnd();
    } catch (err) {
      // Haptics not available, fail silently
    }
  }, []);

  return {
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    selectionChanged,
    selectionStart,
    selectionEnd,
  };
};
