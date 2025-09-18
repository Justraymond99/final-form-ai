import { createContext, useContext, useEffect, useState } from "react";
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
    if (!user || !session) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        return;
      }

      setSubscribed(data.subscribed || false);
      setIsInTrial(data.isInTrial || false);
      setHasPremiumAccess(data.hasPremiumAccess || false);
      setPlanType(data.plan_type || null);
      setTrialEndDate(data.trialEndDate || null);
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (planType: 'monthly' | 'yearly'): Promise<string | null> => {
    if (!session) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout creation error:', error);
        return null;
      }

      return data?.url || null;
    } catch (error) {
      console.error('Failed to create checkout:', error);
      return null;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  // Check subscription on mount and auth changes
  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  // Auto-refresh subscription status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

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