import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useStreakFreeze = () => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  // Get freezes used this month
  const { data: freezesThisMonth = [], isLoading } = useQuery({
    queryKey: ["streak-freezes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("streak_freezes")
        .select("*")
        .eq("user_id", user.id)
        .gte("freeze_date", monthStart)
        .lte("freeze_date", monthEnd);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Max 2 freezes per month for premium users
  const MAX_FREEZES_PER_MONTH = 2;
  const freezesRemaining = Math.max(0, MAX_FREEZES_PER_MONTH - freezesThisMonth.length);
  const canFreeze = freezesRemaining > 0;

  // Check if today is already frozen
  const todayFrozen = freezesThisMonth.some(
    (f) => f.freeze_date === format(new Date(), "yyyy-MM-dd")
  );

  const freezeStreakMutation = useMutation({
    mutationFn: async (date: Date = new Date()) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("streak_freezes")
        .insert({
          user_id: user.id,
          freeze_date: format(date, "yyyy-MM-dd"),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak-freezes"] });
      toast.success("Streak frozen!", {
        description: "Your streak is protected for today.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error("Already frozen", {
          description: "This day is already frozen.",
        });
      } else {
        toast.error("Failed to freeze streak");
      }
    },
  });

  return {
    freezesThisMonth,
    freezesRemaining,
    canFreeze,
    todayFrozen,
    isLoading,
    freezeStreak: freezeStreakMutation.mutate,
    isFreezing: freezeStreakMutation.isPending,
  };
};
