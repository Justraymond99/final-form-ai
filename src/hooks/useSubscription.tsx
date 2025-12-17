import { createContext, useContext, useState, useEffect } from "react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Capacitor } from "@capacitor/core";
import { Purchases, PurchasesPackage, CustomerInfo, LOG_LEVEL } from "@revenuecat/purchases-capacitor";

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

  // Check if running on iOS native
  const isIOSNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";

  // Initialize RevenueCat on iOS
  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (!isIOSNative) {
        console.log("[Subscription] Not on iOS native, skipping RevenueCat");
        setLoading(false);
        return;
      }

      try {
        console.log("[Subscription] Initializing RevenueCat...");
        
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        
        await Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
          appUserID: user?.id || undefined,
        });

        setIsInitialized(true);
        console.log("[Subscription] RevenueCat initialized");

        // Fetch offerings
        await fetchOfferings();
        // Check subscription status
        await checkSubscription();
      } catch (err) {
        console.error("[Subscription] RevenueCat init error:", err);
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user?.id]);

  // Sync user with RevenueCat when auth changes
  useEffect(() => {
    const syncUser = async () => {
      if (!isInitialized || !isIOSNative) return;

      try {
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
  }, [user?.id, isInitialized]);

  const fetchOfferings = async () => {
    if (!isIOSNative) return;

    try {
      console.log("[Subscription] Fetching offerings...");
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
        console.log("[Subscription] Found packages:", offerings.current.availablePackages.length);
      }
    } catch (err) {
      console.error("[Subscription] Error fetching offerings:", err);
    }
  };

  const checkSubscription = async () => {
    if (!isIOSNative) {
      // For web preview, set default states
      setSubscribed(false);
      setHasPremiumAccess(false);
      setIsInTrial(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Checking subscription status...");
      
      const info = await Purchases.getCustomerInfo();
      const customerInfo = info.customerInfo;

      // Check for active entitlements (pro or premium)
      const proEntitlement = customerInfo?.entitlements?.active?.["pro"];
      const premiumEntitlement = customerInfo?.entitlements?.active?.["premium"];
      const activeEntitlement = proEntitlement || premiumEntitlement;

      const hasActive = activeEntitlement !== undefined;
      
      setSubscribed(hasActive);
      setHasPremiumAccess(hasActive);

      if (activeEntitlement) {
        // Check if in trial period
        const periodType = activeEntitlement.periodType;
        setIsInTrial(periodType === "TRIAL");

        // Get expiration date
        if (activeEntitlement.expirationDate) {
          setSubscriptionEnd(activeEntitlement.expirationDate);
          if (periodType === "TRIAL") {
            setTrialEndDate(activeEntitlement.expirationDate);
          }
        }

        // Determine plan type from product identifier
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
  };

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!isIOSNative) {
      console.warn("[Subscription] Purchases only available on iOS");
      return false;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Purchasing package:", pkg.identifier);
      
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      
      // Check if purchase was successful
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
      
      // User cancelled - not an error
      if (err.code === "1" || err.userCancelled) {
        return false;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!isIOSNative) {
      console.warn("[Subscription] Restore only available on iOS");
      return false;
    }

    try {
      setLoading(true);
      console.log("[Subscription] Restoring purchases...");
      
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
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isInitialized]);

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