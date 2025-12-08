import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface OfflineData {
  workoutTemplates: any[];
  mealPlans: any[];
  dailyTracking: any;
  exercises: any[];
  lastSync: string;
}

interface PendingSyncItem {
  id: string;
  type: 'workout_log' | 'food_log' | 'water_log' | 'daily_tracking';
  data: any;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEYS = {
  OFFLINE_DATA: 'ff_offline_data',
  PENDING_SYNC: 'ff_pending_sync',
  SYNC_VERSION: 'ff_sync_version'
};

const MAX_RETRY_COUNT = 3;
const SYNC_VERSION = 2; // Increment when schema changes

export const useOfflineSync = () => {
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    workoutTemplates: [],
    mealPlans: [],
    dailyTracking: null,
    exercises: [],
    lastSync: ''
  });
  const [pendingSync, setPendingSync] = useState<PendingSyncItem[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    const version = localStorage.getItem(STORAGE_KEYS.SYNC_VERSION);
    if (version !== String(SYNC_VERSION)) {
      // Clear old data on version mismatch
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
      localStorage.setItem(STORAGE_KEYS.SYNC_VERSION, String(SYNC_VERSION));
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }

      const pending = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      if (pending) {
        setPendingSync(JSON.parse(pending));
      }
    } catch (e) {
      console.error('Failed to load offline data:', e);
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: pendingSync.length > 0 
          ? `Syncing ${pendingSync.length} pending items...`
          : "Connected to the internet.",
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your data will sync when you reconnect.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync.length]);

  // Persist offline data
  const saveOfflineData = useCallback((data: Partial<OfflineData>) => {
    const updated = { 
      ...offlineData, 
      ...data, 
      lastSync: new Date().toISOString() 
    };
    setOfflineData(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save offline data:', e);
      // Try to clear old data if storage is full
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      }
    }
  }, [offlineData]);

  // Add item to pending sync queue
  const addToPendingSync = useCallback((type: PendingSyncItem['type'], data: any) => {
    const item: PendingSyncItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    const updated = [...pendingSync, item];
    setPendingSync(updated);
    
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save pending sync:', e);
    }
    
    return item.id;
  }, [pendingSync]);

  // Process a single sync item
  const processSyncItem = async (item: PendingSyncItem): Promise<boolean> => {
    if (!user) return false;

    try {
      switch (item.type) {
        case 'food_log': {
          const { error } = await supabase
            .from('food_logs')
            .insert({
              user_id: user.id,
              ...item.data,
              logged_at: new Date(item.timestamp).toISOString()
            });
          if (error) throw error;
          break;
        }
        
        case 'water_log': {
          const { error } = await supabase
            .from('water_logs')
            .insert({
              user_id: user.id,
              ...item.data,
              logged_at: new Date(item.timestamp).toISOString()
            });
          if (error) throw error;
          break;
        }
        
        case 'workout_log': {
          const { error } = await supabase
            .from('workout_sessions')
            .insert({
              user_id: user.id,
              ...item.data,
              created_at: new Date(item.timestamp).toISOString()
            });
          if (error) throw error;
          break;
        }
        
        case 'daily_tracking': {
          const { error } = await supabase
            .from('daily_tracking')
            .upsert({
              user_id: user.id,
              ...item.data
            }, {
              onConflict: 'user_id,date'
            });
          if (error) throw error;
          break;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to sync ${item.type}:`, error);
      return false;
    }
  };

  // Sync all pending data
  const syncPendingData = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0 || isSyncing || !user) return;

    setIsSyncing(true);
    const results: { success: string[]; failed: PendingSyncItem[] } = {
      success: [],
      failed: []
    };

    for (const item of pendingSync) {
      const success = await processSyncItem(item);
      
      if (success) {
        results.success.push(item.id);
      } else {
        const updatedItem = { ...item, retryCount: item.retryCount + 1 };
        if (updatedItem.retryCount < MAX_RETRY_COUNT) {
          results.failed.push(updatedItem);
        } else {
          console.warn(`Dropping sync item after ${MAX_RETRY_COUNT} retries:`, item);
        }
      }
    }

    // Update pending sync with only failed items
    setPendingSync(results.failed);
    
    try {
      if (results.failed.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(results.failed));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
      }
    } catch (e) {
      console.error('Failed to update pending sync:', e);
    }

    setIsSyncing(false);

    if (results.success.length > 0) {
      toast({
        title: "Sync Complete",
        description: `Synced ${results.success.length} items.${results.failed.length > 0 ? ` ${results.failed.length} items will retry.` : ''}`,
      });
    }
  }, [isOnline, pendingSync, isSyncing, user, toast]);

  // Cache workout templates for offline use
  const cacheWorkoutTemplates = useCallback(async () => {
    if (!user || !isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      saveOfflineData({ workoutTemplates: data || [] });
    } catch (e) {
      console.error('Failed to cache workout templates:', e);
    }
  }, [user, isOnline, saveOfflineData]);

  // Cache meal plans for offline use
  const cacheMealPlans = useCallback(async () => {
    if (!user || !isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(10);
      
      if (error) throw error;
      saveOfflineData({ mealPlans: data || [] });
    } catch (e) {
      console.error('Failed to cache meal plans:', e);
    }
  }, [user, isOnline, saveOfflineData]);

  // Cache exercises library
  const cacheExercises = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name')
        .limit(100);
      
      if (error) throw error;
      saveOfflineData({ exercises: data || [] });
    } catch (e) {
      console.error('Failed to cache exercises:', e);
    }
  }, [isOnline, saveOfflineData]);

  // Cache today's tracking
  const cacheDailyTracking = useCallback(async () => {
    if (!user || !isOnline) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      if (error) throw error;
      saveOfflineData({ dailyTracking: data });
    } catch (e) {
      console.error('Failed to cache daily tracking:', e);
    }
  }, [user, isOnline, saveOfflineData]);

  // Cache all data for offline use
  const cacheAllData = useCallback(async () => {
    await Promise.all([
      cacheWorkoutTemplates(),
      cacheMealPlans(),
      cacheExercises(),
      cacheDailyTracking()
    ]);
  }, [cacheWorkoutTemplates, cacheMealPlans, cacheExercises, cacheDailyTracking]);

  // Log food offline
  const logFoodOffline = useCallback((foodData: any) => {
    const id = addToPendingSync('food_log', foodData);
    
    toast({
      title: "Saved Offline",
      description: "Your food entry will sync when you're back online.",
    });
    
    return id;
  }, [addToPendingSync, toast]);

  // Log water offline
  const logWaterOffline = useCallback((waterData: any) => {
    const id = addToPendingSync('water_log', waterData);
    
    toast({
      title: "Saved Offline",
      description: "Your water intake will sync when you're back online.",
    });
    
    return id;
  }, [addToPendingSync, toast]);

  // Log workout offline
  const logWorkoutOffline = useCallback((workoutData: any) => {
    const id = addToPendingSync('workout_log', workoutData);
    
    toast({
      title: "Saved Offline",
      description: "Your workout will sync when you're back online.",
    });
    
    return id;
  }, [addToPendingSync, toast]);

  return {
    isOnline,
    isSyncing,
    offlineData,
    pendingCount: pendingSync.length,
    lastSync: offlineData.lastSync,
    
    // Cache methods
    cacheAllData,
    cacheWorkoutTemplates,
    cacheMealPlans,
    cacheExercises,
    cacheDailyTracking,
    
    // Offline logging
    logFoodOffline,
    logWaterOffline,
    logWorkoutOffline,
    
    // Manual sync
    syncPendingData,
    
    // Get cached data
    getOfflineWorkouts: () => offlineData.workoutTemplates,
    getOfflineMealPlans: () => offlineData.mealPlans,
    getOfflineExercises: () => offlineData.exercises,
    getOfflineDailyTracking: () => offlineData.dailyTracking,
  };
};

export default useOfflineSync;
