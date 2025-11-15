import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { useToast } from "./use-toast";

interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  recorded_at: string;
  workout_session_id?: string;
  notes?: string;
}

interface AddRecordData {
  exercise_name: string;
  weight_kg: number;
  reps: number;
  workout_session_id?: string;
  notes?: string;
}

export const usePersonalRecords = () => {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSecureAuth();
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching PRs:", error);
      toast({
        title: "Error loading PRs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (data: AddRecordData) => {
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const { error } = await supabase.from("personal_records").insert({
        user_id: user.id,
        ...data,
      });

      if (error) throw error;
      await fetchRecords();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  return {
    records,
    addRecord,
    loading,
    refetch: fetchRecords,
  };
};
