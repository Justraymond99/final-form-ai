import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "./useSecureAuth";
import { useToast } from "./use-toast";

export interface FeedbackData {
  feedback_type?: 'suggestion' | 'bug_report' | 'other';
  title?: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export const useFeedback = () => {
  const { user } = useSecureAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (feedback: FeedbackData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit feedback.",
        variant: "destructive",
      });
      return { error: "Not authenticated" };
    }

    if (!feedback.feedback_type || !feedback.title || !feedback.description) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return { error: "Missing required fields" };
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        feedback_type: feedback.feedback_type,
        title: feedback.title.trim(),
        description: feedback.description.trim(),
        category: feedback.category?.trim() || null,
        priority: feedback.priority || 'medium',
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast({
          title: "Failed to submit feedback",
          description: error.message,
          variant: "destructive",
        });
        return { error: error.message };
      }

      toast({
        title: "Thank you for your feedback!",
        description: "We'll review your submission and get back to you soon.",
      });

      return { success: true };
    } catch (error) {
      console.error('Unexpected error submitting feedback:', error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: "Unexpected error" };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserFeedback = async () => {
    if (!user) return { data: [], error: "Not authenticated" };

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  };

  return {
    submitFeedback,
    getUserFeedback,
    isSubmitting,
  };
};
