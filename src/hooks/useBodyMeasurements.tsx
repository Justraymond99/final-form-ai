import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { useToast } from "./use-toast";

interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  arms_cm?: number;
  thighs_cm?: number;
  body_fat_percent?: number;
  notes?: string;
  created_at: string;
}

interface AddMeasurementData {
  weight_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  arms_cm?: number;
  thighs_cm?: number;
  body_fat_percent?: number;
  notes?: string;
}

export const useBodyMeasurements = () => {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSecureAuth();
  const { toast } = useToast();

  const fetchMeasurements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      console.error("Error fetching measurements:", error);
      toast({
        title: "Error loading measurements",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async (data: AddMeasurementData) => {
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const { error } = await supabase.from("body_measurements").insert({
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        ...data,
      });

      if (error) throw error;
      await fetchMeasurements();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [user]);

  return {
    measurements,
    addMeasurement,
    loading,
    refetch: fetchMeasurements,
  };
};
