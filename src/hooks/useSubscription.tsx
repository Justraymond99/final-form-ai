import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Capacitor } from "@capacitor/core";

// Types for RevenueCat (defined here to avoid import issues in web)
interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    priceString: string;
  };
}

interface SubscriptionContextType {
  subscribed: boolean;
  isInTrial: boolean;
  hasPremiumAccess: boolean;
  planType: string | null;
  trialEndDate: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  packages: PurchasesPackage[];
  checkSubscription: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// RevenueCat iOS Public API Key
const REVENUECAT_IOS_API_KEY = "appl_FgmYvLdacMBIcQcgaiGzBNqgfPn";

// Check if running on iOS native (safe for web)
const getIsIOSNative = () => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSecureAuth();
  
  const [subscribed, setSubscribed] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [purchasesModule, setPurchasesModule] = useState<any>(null);

  const isIOSNative = getIsIOSNative();

  // Dynamically load RevenueCat only on iOS native
  useEffect(() => {
    const loadRevenueCat = async () => {
      if (!isIOSNative) {
        console.log("[Subscription] Not on iOS native, skipping RevenueCat");
        setLoading(false);
        return;
      }

      try {
        console.log("[Subscription] Loading RevenueCat module...");
        const module = await import("@revenuecat/purchases-capacitor");
        setPurchasesModule(module);
        console.log("[Subscription] RevenueCat module loaded");
      } catch (err) {
        console.error("[Subscription] Failed to load RevenueCat:", err);
        setLoading(false);
      }
    };

    loadRevenueCat();
  }, [isIOSNative]);

  // Initialize RevenueCat once module is loaded
  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (!isIOSNative || !purchasesModule) return;

      try {
        console.log("[Subscription] Initializing RevenueCat...");
        const { Purchases, LOG_LEVEL } = purchasesModule;
        
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        
        await Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
          appUserID: user?.id || undefined,
        });

        setIsInitialized(true);
        console.log("[Subscription] RevenueCat initialized");
      } catch (err) {
        console.error("[Subscription] RevenueCat init error:", err);
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [purchasesModule, user?.id, isIOSNative]);

  // Fetch offerings when initialized
  useEffect(() => {
    const fetchOfferings = async () => {
      if (!isInitialized || !purchasesModule) return;

      try {
        console.log("[Subscription] Fetching offerings...");
        const { Purchases } = purchasesModule;
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
          console.log("[Subscription] Found packages:", offerings.current.availablePackages.length);
        }
      } catch (err) {
        console.error("[Subscription] Error fetching offerings:", err);
      }
    };

    fetchOfferings();
  }, [isInitialized, purchasesModule]);

  const checkSubscription = useCallback(async () => {
    if (!isIOSNative || !purchasesModule) {
      setSubscribed(false);
      setHasPremiumAccess(false);
      setIsInTrial(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Checking subscription status...");
      
      const { Purchases } = purchasesModule;
      const info = await Purchases.getCustomerInfo();
      const customerInfo = info.customerInfo;

      const proEntitlement = customerInfo?.entitlements?.active?.["pro"];
      const premiumEntitlement = customerInfo?.entitlements?.active?.["premium"];
      const activeEntitlement = proEntitlement || premiumEntitlement;

      const hasActive = activeEntitlement !== undefined;
      
      setSubscribed(hasActive);
      setHasPremiumAccess(hasActive);

      if (activeEntitlement) {
        const periodType = activeEntitlement.periodType;
        setIsInTrial(periodType === "TRIAL");

        if (activeEntitlement.expirationDate) {
          setSubscriptionEnd(activeEntitlement.expirationDate);
          if (periodType === "TRIAL") {
            setTrialEndDate(activeEntitlement.expirationDate);
          }
        }

        const productId = activeEntitlement.productIdentifier;
        if (productId?.includes("yearly") || productId?.includes("annual")) {
          setPlanType("yearly");
        } else if (productId?.includes("monthly")) {
          setPlanType("monthly");
        } else {
          setPlanType("pro");
        }

        console.log("[Subscription] Active subscription found:", {
          productId,
          periodType,
          expirationDate: activeEntitlement.expirationDate
        });
      } else {
        setIsInTrial(false);
        setTrialEndDate(null);
        setSubscriptionEnd(null);
        setPlanType(null);
        console.log("[Subscription] No active subscription");
      }
    } catch (err) {
      console.error("[Subscription] Error checking subscription:", err);
      setSubscribed(false);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  }, [isIOSNative, purchasesModule]);

  // Check subscription when initialized
  useEffect(() => {
    if (isInitialized) {
      checkSubscription();
    }
  }, [isInitialized, checkSubscription]);

  // Sync user with RevenueCat when auth changes
  useEffect(() => {
    const syncUser = async () => {
      if (!isInitialized || !isIOSNative || !purchasesModule) return;

      try {
        const { Purchases } = purchasesModule;
        if (user?.id) {
          console.log("[Subscription] Syncing user:", user.id);
          await Purchases.logIn({ appUserID: user.id });
        } else {
          await Purchases.logOut();
        }
        await checkSubscription();
      } catch (err) {
        console.error("[Subscription] User sync error:", err);
      }
    };

    syncUser();
  }, [user?.id, isInitialized, isIOSNative, purchasesModule, checkSubscription]);

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!isIOSNative || !purchasesModule) {
      console.warn("[Subscription] Purchases only available on iOS");
      return false;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Purchasing package:", pkg.identifier);
      
      const { Purchases } = purchasesModule;
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      
      const proEntitlement = result.customerInfo?.entitlements?.active?.["pro"];
      const premiumEntitlement = result.customerInfo?.entitlements?.active?.["premium"];
      const hasActive = proEntitlement !== undefined || premiumEntitlement !== undefined;

      if (hasActive) {
        await checkSubscription();
        console.log("[Subscription] Purchase successful!");
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("[Subscription] Purchase error:", err);
      
      if (err.code === "1" || err.userCancelled) {
        return false;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!isIOSNative || !purchasesModule) {
      console.warn("[Subscription] Restore only available on iOS");
      return false;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Restoring purchases...");
      
      const { Purchases } = purchasesModule;
      const info = await Purchases.restorePurchases();
      
      const proEntitlement = info.customerInfo?.entitlements?.active?.["pro"];
      const premiumEntitlement = info.customerInfo?.entitlements?.active?.["premium"];
      const hasActive = proEntitlement !== undefined || premiumEntitlement !== undefined;

      if (hasActive) {
        await checkSubscription();
        console.log("[Subscription] Purchases restored!");
        return true;
      }
      
      console.log("[Subscription] No purchases to restore");
      return false;
    } catch (err) {
      console.error("[Subscription] Restore error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh subscription status periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, checkSubscription]);

  const value = {
    subscribed,
    isInTrial,
    hasPremiumAccess,
    planType,
    trialEndDate,
    subscriptionEnd,
    loading,
    packages,
    checkSubscription,
    purchasePackage,
    restorePurchases,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
