import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Purchases, PurchasesPackage, CustomerInfo, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { Capacitor } from "@capacitor/core";
import { useSecureAuth } from "@/hooks/useSecureAuth";

interface RevenueCatContextType {
  isReady: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  isPremium: boolean;
  loading: boolean;
  error: string | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

// RevenueCat iOS API Key
const REVENUECAT_IOS_API_KEY = "appl_FgmYvLdacMBIcQcgaiGzBNqgfPn";

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSecureAuth();
  const [isReady, setIsReady] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has premium access
  const isPremium = customerInfo?.entitlements?.active?.["pro"] !== undefined ||
                    customerInfo?.entitlements?.active?.["premium"] !== undefined;

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      // Only initialize on iOS
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
        console.log("[RevenueCat] Not on iOS native platform, skipping initialization");
        setLoading(false);
        return;
      }

      try {
        console.log("[RevenueCat] Initializing...");
        
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        
        await Purchases.configure({
          apiKey: REVENUECAT_IOS_API_KEY,
          appUserID: user?.id || undefined,
        });

        setIsReady(true);
        console.log("[RevenueCat] Initialized successfully");

        // Fetch offerings and customer info
        await Promise.all([
          fetchOfferings(),
          fetchCustomerInfo(),
        ]);
      } catch (err) {
        console.error("[RevenueCat] Initialization error:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize purchases");
      } finally {
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user?.id]);

  // Login/logout user when auth changes
  useEffect(() => {
    const syncUser = async () => {
      if (!isReady) return;

      try {
        if (user?.id) {
          console.log("[RevenueCat] Logging in user:", user.id);
          await Purchases.logIn({ appUserID: user.id });
        } else {
          console.log("[RevenueCat] Logging out user");
          await Purchases.logOut();
        }
        await fetchCustomerInfo();
      } catch (err) {
        console.error("[RevenueCat] User sync error:", err);
      }
    };

    syncUser();
  }, [user?.id, isReady]);

  const fetchOfferings = async () => {
    try {
      console.log("[RevenueCat] Fetching offerings...");
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
        console.log("[RevenueCat] Found packages:", offerings.current.availablePackages.length);
      }
    } catch (err) {
      console.error("[RevenueCat] Error fetching offerings:", err);
    }
  };

  const fetchCustomerInfo = useCallback(async () => {
    try {
      console.log("[RevenueCat] Fetching customer info...");
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info.customerInfo);
      console.log("[RevenueCat] Customer info fetched, premium:", 
        info.customerInfo?.entitlements?.active?.["pro"] !== undefined);
    } catch (err) {
      console.error("[RevenueCat] Error fetching customer info:", err);
    }
  }, []);

  const purchasePackage = async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[RevenueCat] Purchasing package:", pkg.identifier);
      const result = await Purchases.purchasePackage({ aPackage: pkg });
      
      setCustomerInfo(result.customerInfo);
      
      const isPurchaseActive = result.customerInfo?.entitlements?.active?.["pro"] !== undefined ||
                               result.customerInfo?.entitlements?.active?.["premium"] !== undefined;
      
      console.log("[RevenueCat] Purchase successful, premium:", isPurchaseActive);
      return isPurchaseActive;
    } catch (err: any) {
      console.error("[RevenueCat] Purchase error:", err);
      
      // Check if user cancelled
      if (err.code === "1" || err.userCancelled) {
        console.log("[RevenueCat] User cancelled purchase");
        return false;
      }
      
      setError(err.message || "Purchase failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[RevenueCat] Restoring purchases...");
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info.customerInfo);
      
      const hasRestoredPremium = info.customerInfo?.entitlements?.active?.["pro"] !== undefined ||
                                  info.customerInfo?.entitlements?.active?.["premium"] !== undefined;
      
      console.log("[RevenueCat] Restore complete, premium:", hasRestoredPremium);
      return hasRestoredPremium;
    } catch (err) {
      console.error("[RevenueCat] Restore error:", err);
      setError(err instanceof Error ? err.message : "Failed to restore purchases");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshCustomerInfo = async () => {
    await fetchCustomerInfo();
  };

  const value = {
    isReady,
    customerInfo,
    packages,
    isPremium,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};
