import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";
import { PageTransition } from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy load all pages for better code splitting
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Workouts = lazy(() => import("@/pages/Workouts"));
const WorkoutSession = lazy(() => import("@/pages/WorkoutSession"));
const WorkoutBuilder = lazy(() => import("@/pages/WorkoutBuilder"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const FoodLogger = lazy(() => import("@/pages/FoodLogger"));
const Progress = lazy(() => import("@/pages/Progress"));
const Goals = lazy(() => import("@/pages/Goals"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const Social = lazy(() => import("@/pages/Social"));
const Profile = lazy(() => import("@/pages/Profile"));
const Awards = lazy(() => import("@/pages/Awards"));
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const WorkoutCalendar = lazy(() => import("@/pages/WorkoutCalendar"));
const BodyMeasurements = lazy(() => import("@/pages/BodyMeasurements"));
const PersonalRecords = lazy(() => import("@/pages/PersonalRecords"));
const ProgressPhotos = lazy(() => import("@/pages/ProgressPhotos"));
const ExerciseLibrary = lazy(() => import("@/pages/ExerciseLibrary"));
const ProgressAnalytics = lazy(() => import("@/pages/ProgressAnalytics"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Install = lazy(() => import("@/pages/Install"));
const Support = lazy(() => import("@/pages/Support"));

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
  );
};
