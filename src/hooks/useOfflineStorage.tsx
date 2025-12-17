import { useState, useEffect, useCallback } from "react";
import {
  offlineDB,
  PendingWorkout,
  PendingFoodLog,
  PendingWaterLog,
  SyncQueueItem,
} from "@/lib/offlineDB";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";

export const useOfflineSync = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when back online
      syncAll();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const workouts = await offlineDB.count("pendingWorkouts");
      const foodLogs = await offlineDB.count("pendingFoodLogs");
      const waterLogs = await offlineDB.count("pendingWaterLogs");
      setPendingCount(workouts + foodLogs + waterLogs);
    } catch (error) {
      console.error("[OfflineSync] Error counting pending items:", error);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Save workout offline
  const saveWorkoutOffline = useCallback(
    async (workout: Omit<PendingWorkout, "localId" | "createdAt" | "synced">) => {
      if (!user?.id) return null;

      const pendingWorkout: PendingWorkout = {
        ...workout,
        userId: user.id,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      try {
        const localId = await offlineDB.add("pendingWorkouts", pendingWorkout);
        await updatePendingCount();
        
        toast({
          title: "Saved offline",
          description: "Workout will sync when you're back online",
        });
        
        return localId;
      } catch (error) {
        console.error("[OfflineSync] Error saving workout offline:", error);
        throw error;
      }
    },
    [user?.id, toast, updatePendingCount]
  );

  // Save food log offline
  const saveFoodLogOffline = useCallback(
    async (foodLog: Omit<PendingFoodLog, "localId" | "createdAt" | "synced">) => {
      if (!user?.id) return null;

      const pendingFoodLog: PendingFoodLog = {
        ...foodLog,
        userId: user.id,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      try {
        const localId = await offlineDB.add("pendingFoodLogs", pendingFoodLog);
        await updatePendingCount();
        
        return localId;
      } catch (error) {
        console.error("[OfflineSync] Error saving food log offline:", error);
        throw error;
      }
    },
    [user?.id, updatePendingCount]
  );

  // Save water log offline
  const saveWaterLogOffline = useCallback(
    async (waterLog: Omit<PendingWaterLog, "localId" | "createdAt" | "synced">) => {
      if (!user?.id) return null;

      const pendingWaterLog: PendingWaterLog = {
        ...waterLog,
        userId: user.id,
        createdAt: new Date().toISOString(),
        synced: false,
      };

      try {
        const localId = await offlineDB.add("pendingWaterLogs", pendingWaterLog);
        await updatePendingCount();
        
        return localId;
      } catch (error) {
        console.error("[OfflineSync] Error saving water log offline:", error);
        throw error;
      }
    },
    [user?.id, updatePendingCount]
  );

  // Sync pending workouts
  const syncWorkouts = useCallback(async () => {
    const pendingWorkouts = await offlineDB.getAll<PendingWorkout>("pendingWorkouts");
    const unsynced = pendingWorkouts.filter((w) => !w.synced);
    
    let syncedCount = 0;

    for (const workout of unsynced) {
      try {
        const { error } = await supabase.from("workout_sessions").insert({
          user_id: workout.userId,
          name: workout.name,
          exercises_data: workout.exercisesData,
          started_at: workout.startedAt,
          completed_at: workout.completedAt,
          duration_minutes: workout.durationMinutes,
          notes: workout.notes,
        });

        if (!error && workout.localId) {
          await offlineDB.delete("pendingWorkouts", workout.localId);
          syncedCount++;
        }
      } catch (error) {
        console.error("[OfflineSync] Error syncing workout:", error);
      }
    }

    return syncedCount;
  }, []);

  // Sync pending food logs
  const syncFoodLogs = useCallback(async () => {
    const pendingLogs = await offlineDB.getAll<PendingFoodLog>("pendingFoodLogs");
    const unsynced = pendingLogs.filter((l) => !l.synced);
    
    let syncedCount = 0;

    for (const log of unsynced) {
      try {
        const { error } = await supabase.from("food_logs").insert({
          user_id: log.userId,
          food_name: log.foodName,
          calories: log.calories,
          protein_g: log.proteinG,
          carbs_g: log.carbsG,
          fat_g: log.fatG,
          meal_type: log.mealType,
          quantity: log.quantity,
          unit: log.unit,
          logged_at: log.loggedAt,
        });

        if (!error && log.localId) {
          await offlineDB.delete("pendingFoodLogs", log.localId);
          syncedCount++;
        }
      } catch (error) {
        console.error("[OfflineSync] Error syncing food log:", error);
      }
    }

    return syncedCount;
  }, []);

  // Sync pending water logs
  const syncWaterLogs = useCallback(async () => {
    const pendingLogs = await offlineDB.getAll<PendingWaterLog>("pendingWaterLogs");
    const unsynced = pendingLogs.filter((l) => !l.synced);
    
    let syncedCount = 0;

    for (const log of unsynced) {
      try {
        const { error } = await supabase.from("water_logs").insert({
          user_id: log.userId,
          amount_ml: log.amountMl,
          date: log.date,
          logged_at: log.createdAt,
        });

        if (!error && log.localId) {
          await offlineDB.delete("pendingWaterLogs", log.localId);
          syncedCount++;
        }
      } catch (error) {
        console.error("[OfflineSync] Error syncing water log:", error);
      }
    }

    return syncedCount;
  }, []);

  // Sync all pending data
  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing || !user?.id) return;

    setIsSyncing(true);
    console.log("[OfflineSync] Starting sync...");

    try {
      const [workouts, foodLogs, waterLogs] = await Promise.all([
        syncWorkouts(),
        syncFoodLogs(),
        syncWaterLogs(),
      ]);

      const total = workouts + foodLogs + waterLogs;
      
      if (total > 0) {
        toast({
          title: "Sync complete",
          description: `Synced ${total} item${total > 1 ? "s" : ""} to the cloud`,
        });
      }

      await updatePendingCount();
      console.log("[OfflineSync] Sync complete:", { workouts, foodLogs, waterLogs });
    } catch (error) {
      console.error("[OfflineSync] Sync failed:", error);
      toast({
        title: "Sync failed",
        description: "Some items couldn't be synced. Will retry later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, user?.id, syncWorkouts, syncFoodLogs, syncWaterLogs, toast, updatePendingCount]);

  // Get all pending items
  const getPendingItems = useCallback(async () => {
    const [workouts, foodLogs, waterLogs] = await Promise.all([
      offlineDB.getAll<PendingWorkout>("pendingWorkouts"),
      offlineDB.getAll<PendingFoodLog>("pendingFoodLogs"),
      offlineDB.getAll<PendingWaterLog>("pendingWaterLogs"),
    ]);

    return { workouts, foodLogs, waterLogs };
  }, []);

  // Clear all pending items
  const clearPending = useCallback(async () => {
    await Promise.all([
      offlineDB.clear("pendingWorkouts"),
      offlineDB.clear("pendingFoodLogs"),
      offlineDB.clear("pendingWaterLogs"),
    ]);
    await updatePendingCount();
  }, [updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    saveWorkoutOffline,
    saveFoodLogOffline,
    saveWaterLogOffline,
    syncAll,
    getPendingItems,
    clearPending,
  };
};
