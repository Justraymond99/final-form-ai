import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  activity_level: string | null;
  dietary_restrictions: string[] | null;
  fitness_goals: string[] | null;
  dietary_preferences: string[] | null;
  allergies: string[] | null;
  gender: string | null;
  target_weight_kg: number | null;
  target_calories_per_day: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  daily_calorie_goal: number | null;
  daily_protein_goal: number | null;
  daily_carb_goal: number | null;
  daily_fat_goal: number | null;
  date_of_birth: string | null;
  food_preferences: any;
  organic_preference: boolean | null;
  preferred_stores: string[] | null;
  budget_preference: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useSecureAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  };

  return { profile, loading, updateProfile };
};