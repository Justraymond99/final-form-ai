import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

const generateReferralCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useReferrals = () => {
  const { user } = useSecureAuth();
  const queryClient = useQueryClient();

  // Get user's referrals
  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get or create user's referral code
  const { data: userReferralCode } = useQuery({
    queryKey: ["user-referral-code", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Check if user has any referrals to get their code
      const { data: existingReferral } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", user.id)
        .limit(1)
        .single();

      if (existingReferral?.referral_code) {
        return existingReferral.referral_code;
      }

      // Generate a new unique code for this user
      return generateReferralCode();
    },
    enabled: !!user?.id,
  });

  // Create a referral invite
  const createReferralMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user?.id || !userReferralCode) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referred_email: email,
          referral_code: userReferralCode,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      toast.success("Invite sent!", {
        description: "We'll notify you when they sign up.",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error("Already invited", {
          description: "This email has already been invited.",
        });
      } else {
        toast.error("Failed to send invite");
      }
    },
  });

  // Stats
  const pendingCount = referrals.filter((r) => r.status === "pending").length;
  const convertedCount = referrals.filter((r) => r.status === "converted").length;
  const totalRewardMonths = referrals.reduce((acc, r) => acc + (r.reward_months || 0), 0);

  return {
    referrals,
    userReferralCode,
    isLoading,
    pendingCount,
    convertedCount,
    totalRewardMonths,
    createReferral: createReferralMutation.mutate,
    isCreating: createReferralMutation.isPending,
  };
};
