// Client-side rate limit configuration (mirrors server-side limits)
export const AI_RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  'ai-fitness-chat': { maxRequests: 30, windowMs: 60 * 60 * 1000 },
  'ai-workout-generator': { maxRequests: 15, windowMs: 60 * 60 * 1000 },
  'ai-nutrition-generator': { maxRequests: 15, windowMs: 60 * 60 * 1000 },
  'ai-recovery-planner': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'ai-recovery-coach': { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  'ai-weekly-coach': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'ai-insights-generator': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'ai-food-suggestions': { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  'ai-feature-activation': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'default': { maxRequests: 20, windowMs: 60 * 60 * 1000 },
};
