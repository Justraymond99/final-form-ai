import { createContext, useContext, useState } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";

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
  
  // Override for testing - always return premium access
  const [subscribed] = useState(true);
  const [isInTrial] = useState(false);
  const [hasPremiumAccess] = useState(true);
  const [planType] = useState<string>("premium");
  const [trialEndDate] = useState<string | null>(null);
  const [subscriptionEnd] = useState<string | null>(null);
  const [loading] = useState(false);

  const checkSubscription = async () => {
    // No-op for testing - always has premium access
    return;
  };

  const createCheckout = async (planType: 'monthly' | 'yearly'): Promise<string | null> => {
    // No-op for testing - user already has premium access
    return null;
  };

  const openCustomerPortal = async () => {
    // No-op for testing - user already has premium access
    return;
  };

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