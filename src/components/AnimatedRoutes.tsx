import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Workouts from "@/pages/Workouts";
import WorkoutSession from "@/pages/WorkoutSession";
import WorkoutBuilder from "@/pages/WorkoutBuilder";
import Nutrition from "@/pages/Nutrition";
import FoodLogger from "@/pages/FoodLogger";
import Progress from "@/pages/Progress";
import Goals from "@/pages/Goals";
import Pricing from "@/pages/Pricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import Social from "@/pages/Social";
import Profile from "@/pages/Profile";
import Awards from "@/pages/Awards";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import WorkoutCalendar from "@/pages/WorkoutCalendar";
import BodyMeasurements from "@/pages/BodyMeasurements";
import PersonalRecords from "@/pages/PersonalRecords";
import ProgressPhotos from "@/pages/ProgressPhotos";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
import ProgressAnalytics from "@/pages/ProgressAnalytics";
import Recipes from "@/pages/Recipes";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Install from "@/pages/Install";
import Support from "@/pages/Support";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
        <Route path="/home" element={<ProtectedRoute><PageTransition><Index /></PageTransition></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><PageTransition><Workouts /></PageTransition></ProtectedRoute>} />
        <Route path="/workout-session" element={<ProtectedRoute><PageTransition><WorkoutSession /></PageTransition></ProtectedRoute>} />
        <Route path="/workout-builder" element={<ProtectedRoute><PageTransition><WorkoutBuilder /></PageTransition></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><PageTransition><Nutrition /></PageTransition></ProtectedRoute>} />
        <Route path="/food-logger" element={<ProtectedRoute><PageTransition><FoodLogger /></PageTransition></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><PageTransition><Progress /></PageTransition></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><PageTransition><Goals /></PageTransition></ProtectedRoute>} />
        <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="/subscription-success" element={<ProtectedRoute><PageTransition><SubscriptionSuccess /></PageTransition></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><PageTransition><Social /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/awards" element={<ProtectedRoute><PageTransition><Awards /></PageTransition></ProtectedRoute>} />
        <Route path="/workout-calendar" element={<ProtectedRoute><PageTransition><WorkoutCalendar /></PageTransition></ProtectedRoute>} />
        <Route path="/body-measurements" element={<ProtectedRoute><PageTransition><BodyMeasurements /></PageTransition></ProtectedRoute>} />
        <Route path="/personal-records" element={<ProtectedRoute><PageTransition><PersonalRecords /></PageTransition></ProtectedRoute>} />
        <Route path="/progress-photos" element={<ProtectedRoute><PageTransition><ProgressPhotos /></PageTransition></ProtectedRoute>} />
        <Route path="/exercise-library" element={<ProtectedRoute><PageTransition><ExerciseLibrary /></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><ProgressAnalytics /></PageTransition></ProtectedRoute>} />
        <Route path="/recipes" element={<ProtectedRoute><PageTransition><Recipes /></PageTransition></ProtectedRoute>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/support" element={<PageTransition><Support /></PageTransition>} />
        <Route path="/404" element={<PageTransition><NotFound /></PageTransition>} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
