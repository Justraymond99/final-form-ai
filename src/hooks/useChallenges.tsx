import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  created_by: string | null;
  is_public: boolean;
  participants_count?: number;
  user_progress?: number;
  user_joined?: boolean;
}

interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_value: number;
  completed: boolean;
  joined_at: string;
}

export const useChallenges = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active challenges
  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ["challenges", user?.id],
    queryFn: async (): Promise<Challenge[]> => {
      const today = new Date().toISOString().split("T")[0];

      // Get public challenges that are active
      const { data: publicChallenges, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_public", true)
        .lte("start_date", today)
        .gte("end_date", today);

      if (error) throw error;

      if (!user || !publicChallenges) return publicChallenges || [];

      // Get user's participations
      const { data: participations } = await supabase
        .from("challenge_participants")
        .select("challenge_id, current_value")
        .eq("user_id", user.id);

      const participationMap = new Map(
        participations?.map((p) => [p.challenge_id, p.current_value]) || []
      );

      // Get participant counts for each challenge
      const challengeIds = publicChallenges.map((c) => c.id);
      const { data: counts } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .in("challenge_id", challengeIds);

      const countMap = new Map<string, number>();
      counts?.forEach((c) => {
        countMap.set(c.challenge_id, (countMap.get(c.challenge_id) || 0) + 1);
      });

      return publicChallenges.map((c) => ({
        ...c,
        participants_count: countMap.get(c.id) || 0,
        user_progress: participationMap.get(c.id) || 0,
        user_joined: participationMap.has(c.id),
      }));
    },
    enabled: true,
  });

  // Fetch user's challenge participations
  const { data: myParticipations } = useQuery({
    queryKey: ["my-challenge-participations", user?.id],
    queryFn: async (): Promise<ChallengeParticipant[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Join a challenge
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: user.id,
        current_value: 0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["my-challenge-participations"] });
      toast({ title: "Joined!", description: "You've joined the challenge!" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave a challenge
  const leaveChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["my-challenge-participations"] });
      toast({ title: "Left challenge", description: "You've left the challenge." });
    },
  });

  // Create a new challenge
  const createChallenge = useMutation({
    mutationFn: async (challenge: {
      title: string;
      description?: string;
      challenge_type: string;
      target_value: number;
      unit: string;
      start_date: string;
      end_date: string;
      is_public: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("challenges")
        .insert({
          ...challenge,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the challenge
      await supabase.from("challenge_participants").insert({
        challenge_id: data.id,
        user_id: user.id,
        current_value: 0,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast({ title: "Created!", description: "Challenge created successfully!" });
    },
  });

  return {
    challenges,
    myParticipations,
    loadingChallenges,
    joinChallenge,
    leaveChallenge,
    createChallenge,
  };
};
