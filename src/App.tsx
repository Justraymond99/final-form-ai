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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => (
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
                  <PrefetchInit />
                  <TrialNotificationsInit />
                  <OnboardingTrialNudge />
                  <RateAppPrompt />
                  <AnimatedRoutes />
                </PaywallProvider>
              </BrowserRouter>
            </TooltipProvider>
          </SecurityWrapper>
        </SubscriptionProvider>
      </SecureAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
