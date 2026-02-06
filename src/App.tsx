import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SecureAuthProvider } from "./hooks/useSecureAuth";
import { SubscriptionProvider } from "./hooks/useSubscription";
import SecurityWrapper from "./components/SecurityWrapper";
import { AnimatedRoutes } from "./components/AnimatedRoutes";
import { PaywallProvider } from "./components/PaywallModal";
import { OnboardingTrialNudge } from "./components/OnboardingTrialNudge";
import { TrialNotificationsInit } from "./components/TrialNotificationsInit";
import { RateAppPrompt } from "./components/RateAppPrompt";
import { PrefetchInit } from "./components/PrefetchInit";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { SyncStatus } from "./components/SyncStatus";
import { PerformanceInit } from "./components/PerformanceInit";
import { NotificationInit } from "./components/NotificationInit";
import { AnalyticsInit } from "./components/AnalyticsInit";
import { SkipNav } from "./components/SkipNav";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        <SecureAuthProvider>
          <SubscriptionProvider>
            <SecurityWrapper>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <PaywallProvider>
                    <SkipNav />
                    <PerformanceInit />
                    <NotificationInit />
                    <AnalyticsInit />
                    <OfflineIndicator />
                    <SyncStatus />
                    <PrefetchInit />
                    <TrialNotificationsInit />
                    <OnboardingTrialNudge />
                    <RateAppPrompt />
                    <main id="main-content">
                      <AnimatedRoutes />
                    </main>
                  </PaywallProvider>
                </BrowserRouter>
              </TooltipProvider>
            </SecurityWrapper>
          </SubscriptionProvider>
        </SecureAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
