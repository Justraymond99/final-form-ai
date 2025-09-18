import { useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export const useAnalytics = () => {
  const { user } = useSecureAuth();

  useEffect(() => {
    // Initialize analytics when user logs in
    if (user) {
      identify(user.id);
    }
  }, [user]);

  const track = (event: string, properties?: Record<string, any>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        platform: 'web',
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        page_title: document.title,
      },
      userId: user?.id,
      timestamp: new Date().toISOString(),
    };

    // Store locally for batch sending
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push(analyticsEvent);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events));

    // Send to server in background
    sendAnalytics([analyticsEvent]);

    console.log('Analytics Event:', analyticsEvent);
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    track('user_identified', {
      user_id: userId,
      traits: traits || {}
    });
  };

  const page = (pageName: string, properties?: Record<string, any>) => {
    track('page_viewed', {
      page: pageName,
      ...properties
    });
  };

  const sendAnalytics = async (events: AnalyticsEvent[]) => {
    try {
      // In a real implementation, you'd send to your analytics service
      // For now, we'll just log to console
      console.log('Sending analytics events:', events);
      
      // Example: Send to a custom analytics endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events })
      // });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  };

  // Fitness-specific tracking methods
  const trackWorkoutStarted = (workoutType: string, duration?: number) => {
    track('workout_started', {
      workout_type: workoutType,
      estimated_duration: duration,
    });
  };

  const trackWorkoutCompleted = (workoutType: string, duration: number, exercises: number) => {
    track('workout_completed', {
      workout_type: workoutType,
      duration_minutes: duration,
      exercises_count: exercises,
    });
  };

  const trackFoodLogged = (mealType: string, calories: number) => {
    track('food_logged', {
      meal_type: mealType,
      calories: calories,
    });
  };

  const trackWaterLogged = (amount: number) => {
    track('water_logged', {
      amount_ml: amount,
    });
  };

  const trackAIFeatureUsed = (feature: string, success: boolean) => {
    track('ai_feature_used', {
      feature_name: feature,
      success: success,
    });
  };

  const trackGoalSet = (goalType: string, targetValue: number) => {
    track('goal_set', {
      goal_type: goalType,
      target_value: targetValue,
    });
  };

  const trackAchievementUnlocked = (achievementType: string, title: string) => {
    track('achievement_unlocked', {
      achievement_type: achievementType,
      title: title,
    });
  };

  const trackSubscriptionEvent = (event: string, plan?: string) => {
    track('subscription_event', {
      subscription_event: event,
      plan: plan,
    });
  };

  const trackUserRetention = (daysSinceInstall: number, sessionsCount: number) => {
    track('user_retention', {
      days_since_install: daysSinceInstall,
      sessions_count: sessionsCount,
    });
  };

  // Batch send events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      if (events.length > 0) {
        sendAnalytics(events);
        localStorage.removeItem('analytics_events');
      }
    }, 30000); // Send every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    track,
    identify,
    page,
    trackWorkoutStarted,
    trackWorkoutCompleted,
    trackFoodLogged,
    trackWaterLogged,
    trackAIFeatureUsed,
    trackGoalSet,
    trackAchievementUnlocked,
    trackSubscriptionEvent,
    trackUserRetention,
  };
};
