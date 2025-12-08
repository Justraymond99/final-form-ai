import { useEffect, useRef, useCallback } from 'react';
import analytics, { trackPageView } from '@/lib/analytics';
import { useLocation } from 'react-router-dom';

interface UseAnalyticsOptions {
  trackPageViews?: boolean;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { 
    trackPageViews = true, 
    trackScrollDepth = false,
    trackTimeOnPage = true 
  } = options;
  
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);

  // Track page views on route change
  useEffect(() => {
    if (trackPageViews) {
      const pageName = location.pathname === '/' ? 'Home' : 
        location.pathname.slice(1).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      trackPageView(pageName);
    }
    
    // Reset tracking for new page
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
  }, [location.pathname, trackPageViews]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? Math.round((window.scrollY / scrollHeight) * 100) : 100;
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        
        // Track milestones
        const milestones = [25, 50, 75, 100];
        for (const milestone of milestones) {
          if (scrollPercent >= milestone && maxScrollDepth.current < milestone) {
            analytics.featureUsed('scroll_depth', { 
              page: location.pathname, 
              depth_percent: milestone 
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, trackScrollDepth]);

  // Track time on page when leaving
  useEffect(() => {
    if (!trackTimeOnPage) return;

    return () => {
      const timeSpent = Math.round((Date.now() - pageStartTime.current) / 1000);
      if (timeSpent > 2) { // Only track if > 2 seconds
        analytics.featureUsed('time_on_page', {
          page: location.pathname,
          seconds: timeSpent,
          scroll_depth: maxScrollDepth.current
        });
      }
    };
  }, [location.pathname, trackTimeOnPage]);

  // Helper to track user actions
  const trackAction = useCallback((action: string, metadata?: Record<string, unknown>) => {
    analytics.featureUsed(action, {
      page: location.pathname,
      ...metadata
    });
  }, [location.pathname]);

  return {
    track: analytics.featureUsed,
    trackAction,
    trackError: analytics.errorOccurred,
    
    // Fitness-specific
    trackWorkoutStarted: analytics.workoutStarted,
    trackWorkoutCompleted: analytics.workoutCompleted,
    trackFoodLogged: analytics.foodLogged,
    trackWaterLogged: analytics.waterLogged,
    trackAiChatSent: analytics.aiChatSent,
    trackStreakAchieved: analytics.streakAchieved,
    trackAchievementUnlocked: analytics.achievementUnlocked,
    trackGoalCompleted: analytics.goalCompleted,
  };
}

export default useAnalytics;
