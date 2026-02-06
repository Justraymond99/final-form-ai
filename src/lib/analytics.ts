import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  event_properties?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
  device_info?: Record<string, unknown>;
}

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Get device info
function getDeviceInfo(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine,
  };
}

// Event queue for batching
let eventQueue: AnalyticsEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

// Flush events to server
async function flushEvents() {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue = [];
  
  try {
    const { error } = await supabase.functions.invoke('analytics', {
      body: { events }
    });
    
    if (error) {
      console.warn('Failed to send analytics:', error);
      // Re-queue failed events (up to 50)
      eventQueue = [...events.slice(-50), ...eventQueue];
    }
  } catch (e) {
    console.warn('Analytics error:', e);
    // Re-queue failed events
    eventQueue = [...events.slice(-50), ...eventQueue];
  }
}

// Schedule flush with debounce
function scheduleFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushEvents, 2000); // Flush after 2 seconds of inactivity
  
  // Also flush if queue is large
  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

// Track an event
export function track(eventName: string, properties?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    event_name: eventName,
    event_properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
    page_url: window.location.href,
    session_id: getSessionId(),
    device_info: getDeviceInfo(),
  };
  
  eventQueue.push(event);
  scheduleFlush();
  
  // Also log to console in dev
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, properties);
  }
}

// Track page view
export function trackPageView(pageName: string, properties?: Record<string, unknown>) {
  track('page_view', {
    page_name: pageName,
    page_path: window.location.pathname,
    referrer: document.referrer,
    ...properties,
  });
}

// Fitness-specific tracking helpers
export const analytics = {
  // Workout events
  workoutStarted: (workoutType: string, templateId?: string) => 
    track('workout_started', { workout_type: workoutType, template_id: templateId }),
  
  workoutCompleted: (workoutType: string, durationMinutes: number, exerciseCount: number) =>
    track('workout_completed', { 
      workout_type: workoutType, 
      duration_minutes: durationMinutes,
      exercise_count: exerciseCount 
    }),
  
  workoutAbandoned: (workoutType: string, progressPercent: number) =>
    track('workout_abandoned', { workout_type: workoutType, progress_percent: progressPercent }),

  // Nutrition events
  foodLogged: (mealType: string, calories: number, source: 'manual' | 'barcode' | 'voice' | 'search') =>
    track('food_logged', { meal_type: mealType, calories, source }),
  
  waterLogged: (amountMl: number) =>
    track('water_logged', { amount_ml: amountMl }),

  // AI events
  aiChatSent: (messageLength: number) =>
    track('ai_chat_sent', { message_length: messageLength }),
  
  aiWorkoutGenerated: (workoutType: string, success: boolean) =>
    track('ai_workout_generated', { workout_type: workoutType, success }),
  
  aiMealPlanGenerated: (goal: string, success: boolean) =>
    track('ai_meal_plan_generated', { goal, success }),

  // Engagement events
  streakAchieved: (streakDays: number) =>
    track('streak_achieved', { streak_days: streakDays }),
  
  achievementUnlocked: (achievementType: string, title: string) =>
    track('achievement_unlocked', { achievement_type: achievementType, title }),
  
  goalCompleted: (goalType: string, targetValue: number) =>
    track('goal_completed', { goal_type: goalType, target_value: targetValue }),

  // Subscription events
  subscriptionStarted: (plan: string) =>
    track('subscription_started', { plan }),
  
  subscriptionCancelled: (plan: string, reason?: string) =>
    track('subscription_cancelled', { plan, reason }),
  
  checkoutStarted: (plan: string) =>
    track('checkout_started', { plan }),

  // Feature usage
  featureUsed: (feature: string, metadata?: Record<string, unknown>) =>
    track('feature_used', { feature, ...metadata }),

  // Errors
  errorOccurred: (errorType: string, errorMessage: string, context?: Record<string, unknown>) =>
    track('error_occurred', { error_type: errorType, error_message: errorMessage, ...context }),

  // Data export
  dataExported: (format: string) =>
    track('data_exported', { format }),

  // Onboarding
  onboardingStep: (step: number, name: string) =>
    track('onboarding_step', { step_number: step, step_name: name }),
  onboardingCompleted: () => track('onboarding_completed'),
};

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushEvents);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

export default analytics;
