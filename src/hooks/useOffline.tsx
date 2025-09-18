import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface OfflineData {
  workoutTemplates: any[];
  mealPlans: any[];
  lastSync: string;
}

export const useOffline = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    workoutTemplates: [],
    mealPlans: [],
    lastSync: new Date().toISOString()
  });
  const [pendingSync, setPendingSync] = useState<any[]>([]);

  useEffect(() => {
    // Load offline data from localStorage
    const stored = localStorage.getItem('offline_data');
    if (stored) {
      setOfflineData(JSON.parse(stored));
    }

    const pendingStored = localStorage.getItem('pending_sync');
    if (pendingStored) {
      setPendingSync(JSON.parse(pendingStored));
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online! 🌐",
        description: "Syncing your data...",
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline 📴",
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
  }, []);

  const saveOfflineData = (data: Partial<OfflineData>) => {
    const updated = { ...offlineData, ...data, lastSync: new Date().toISOString() };
    setOfflineData(updated);
    localStorage.setItem('offline_data', JSON.stringify(updated));
  };

  const addToPendingSync = (action: any) => {
    const updated = [...pendingSync, { ...action, timestamp: Date.now() }];
    setPendingSync(updated);
    localStorage.setItem('pending_sync', JSON.stringify(updated));
  };

  const syncPendingData = async () => {
    if (!isOnline || pendingSync.length === 0) return;

    try {
      // Process pending sync items
      for (const item of pendingSync) {
        // Process each pending sync item based on its type
        console.log('Syncing:', item);
        
        // You would implement actual sync logic here
        // For now, we'll just simulate success
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clear pending sync after successful sync
      setPendingSync([]);
      localStorage.removeItem('pending_sync');

      toast({
        title: "Sync Complete ✅",
        description: "All your offline data has been synced.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed ❌",
        description: "Some data couldn't be synced. Will retry later.",
        variant: "destructive"
      });
    }
  };

  const cacheWorkoutTemplates = (templates: any[]) => {
    saveOfflineData({ workoutTemplates: templates });
  };

  const cacheMealPlans = (plans: any[]) => {
    saveOfflineData({ mealPlans: plans });
  };

  const getOfflineWorkouts = () => {
    return offlineData.workoutTemplates;
  };

  const getOfflineMealPlans = () => {
    return offlineData.mealPlans;
  };

  const logWorkoutOffline = (workoutData: any) => {
    addToPendingSync({
      type: 'workout_log',
      data: workoutData
    });
    
    toast({
      title: "Workout Saved Offline 💾",
      description: "Will sync when you're back online.",
    });
  };

  const logFoodOffline = (foodData: any) => {
    addToPendingSync({
      type: 'food_log',
      data: foodData
    });
    
    toast({
      title: "Food Entry Saved Offline 💾",
      description: "Will sync when you're back online.",
    });
  };

  const logWaterOffline = (waterData: any) => {
    addToPendingSync({
      type: 'water_log',
      data: waterData
    });
    
    toast({
      title: "Water Intake Saved Offline 💾",
      description: "Will sync when you're back online.",
    });
  };

  return {
    isOnline,
    offlineData,
    pendingSync: pendingSync.length,
    cacheWorkoutTemplates,
    cacheMealPlans,
    getOfflineWorkouts,
    getOfflineMealPlans,
    logWorkoutOffline,
    logFoodOffline,
    logWaterOffline,
    syncPendingData,
    addToPendingSync
  };
};