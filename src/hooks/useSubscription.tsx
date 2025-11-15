import { createContext, useContext, useState, useEffect } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  subscribed: boolean;
  isInTrial: boolean;
  hasPremiumAccess: boolean;
  planType: string | null;
  trialEndDate: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (planType: 'monthly' | 'yearly') => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useSecureAuth();
  
  const [subscribed, setSubscribed] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    if (!session) {
      setSubscribed(false);
      setHasPremiumAccess(false);
      setIsInTrial(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscribed(data.subscribed || false);
      setIsInTrial(data.isInTrial || false);
      setHasPremiumAccess(data.hasPremiumAccess || false);
      setTrialEndDate(data.trialEndDate || null);
      setSubscriptionEnd(data.subscription_end || null);
      
      // Determine plan type based on product_id
      if (data.product_id === "prod_T4uit3SE1DEhcw") {
        setPlanType("monthly");
      } else if (data.product_id === "prod_T4uir9ymrnMVjY") {
        setPlanType("yearly");
      } else {
        setPlanType(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (planType: 'monthly' | 'yearly'): Promise<string | null> => {
    if (!session) {
      throw new Error("User must be logged in to subscribe");
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      throw new Error("User must be logged in");
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  // Check subscription on mount and when session changes
  useEffect(() => {
    checkSubscription();
  }, [session]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const value = {
    subscribed,
    isInTrial,
    hasPremiumAccess,
    planType,
    trialEndDate,
    subscriptionEnd,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};