import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SecureAuthProvider } from "./hooks/useSecureAuth";
import SecurityWrapper from "./components/SecurityWrapper";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Workouts from "./pages/Workouts";
import WorkoutSession from "./pages/WorkoutSession";
import WorkoutBuilder from "./pages/WorkoutBuilder";
import Nutrition from "./pages/Nutrition";
import FoodLogger from "./pages/FoodLogger";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Social from "./pages/Social";
import Profile from "./pages/Profile";
import Awards from "./pages/Awards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SecureAuthProvider>
      <SecurityWrapper>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><div className="pb-16"><Index /><Navigation /></div></ProtectedRoute>} />
              <Route path="/workouts" element={<ProtectedRoute><div className="pb-16"><Workouts /><Navigation /></div></ProtectedRoute>} />
              <Route path="/workout-session" element={<ProtectedRoute><div className="pb-16"><WorkoutSession /><Navigation /></div></ProtectedRoute>} />
              <Route path="/workout-builder" element={<ProtectedRoute><div className="pb-16"><WorkoutBuilder /><Navigation /></div></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><div className="pb-16"><Nutrition /><Navigation /></div></ProtectedRoute>} />
              <Route path="/food-logger" element={<ProtectedRoute><div className="pb-16"><FoodLogger /><Navigation /></div></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><div className="pb-16"><Progress /><Navigation /></div></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><div className="pb-16"><Goals /><Navigation /></div></ProtectedRoute>} />
              <Route path="/social" element={<ProtectedRoute><div className="pb-16"><Social /><Navigation /></div></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><div className="pb-16"><Profile /><Navigation /></div></ProtectedRoute>} />
              <Route path="/awards" element={<ProtectedRoute><div className="pb-16"><Awards /><Navigation /></div></ProtectedRoute>} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SecurityWrapper>
    </SecureAuthProvider>
  </QueryClientProvider>
);

export default App;
