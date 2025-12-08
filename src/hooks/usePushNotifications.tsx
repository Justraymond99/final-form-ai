import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/hooks/use-toast';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'default';
}

export const usePushNotifications = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default'
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const permission = 'Notification' in window ? Notification.permission : 'default';
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
      isLoading: false
    }));

    return isSupported;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for reminders and achievements.",
        });
        return true;
      } else if (permission === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported, toast]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user || !state.isSupported || state.permission !== 'granted') {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription (using VAPID public key if available)
        // For now, we'll use local notifications as fallback
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Note: In production, you'd use a VAPID public key here
          // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }).catch(() => null);
      }

      if (subscription) {
        // Store subscription in database (optional - for server-sent push)
        console.log('Push subscription:', JSON.stringify(subscription));
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user, state.isSupported, state.permission]);

  // Send a local notification immediately
  const sendLocalNotification = useCallback(async (title: string, body: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      // Fallback to basic Notification API
      try {
        new Notification(title, { body, icon: '/icon-192.png' });
        return true;
      } catch (e) {
        console.error('Fallback notification failed:', e);
        return false;
      }
    }
  }, [state.permission]);

  // Schedule a notification for later (stores in DB)
  const scheduleNotification = useCallback(async (
    type: string,
    title: string,
    body: string,
    scheduledFor: Date,
    data?: Record<string, unknown>
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke('send-notifications', {
        body: {
          type,
          userId: user.id,
          title,
          body,
          scheduledFor: scheduledFor.toISOString(),
          data
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder Set",
        description: `You'll be notified at ${scheduledFor.toLocaleTimeString()}`,
      });

      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Initialize on mount
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  // Auto-subscribe when permission is granted and user is logged in
  useEffect(() => {
    if (user && state.permission === 'granted' && !state.isSubscribed && !state.isLoading) {
      subscribe();
    }
  }, [user, state.permission, state.isSubscribed, state.isLoading, subscribe]);

  return {
    ...state,
    requestPermission,
    subscribe,
    sendLocalNotification,
    scheduleNotification
  };
};
