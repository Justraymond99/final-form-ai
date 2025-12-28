import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RateLimitInfo {
  remaining: number;
  resetAt: Date | null;
  endpoint: string;
  isLimited: boolean;
}

interface RateLimitState {
  [endpoint: string]: RateLimitInfo;
}

// Rate limit thresholds for warnings
const WARNING_THRESHOLD = 5;
const CRITICAL_THRESHOLD = 2;

export function useRateLimitStatus() {
  const [rateLimits, setRateLimits] = useState<RateLimitState>({});

  const updateRateLimitFromResponse = useCallback((
    response: Response,
    endpoint: string
  ) => {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');
    
    if (remaining !== null) {
      const remainingCount = parseInt(remaining, 10);
      const resetDate = resetAt ? new Date(resetAt) : null;
      
      setRateLimits(prev => ({
        ...prev,
        [endpoint]: {
          remaining: remainingCount,
          resetAt: resetDate,
          endpoint,
          isLimited: response.status === 429,
        }
      }));

      // Show warnings when approaching limit
      if (remainingCount <= CRITICAL_THRESHOLD && remainingCount > 0) {
        toast({
          title: "Rate Limit Warning",
          description: `Only ${remainingCount} AI request${remainingCount === 1 ? '' : 's'} remaining this hour.`,
          variant: "destructive",
        });
      } else if (remainingCount <= WARNING_THRESHOLD && remainingCount > CRITICAL_THRESHOLD) {
        toast({
          title: "Approaching Rate Limit",
          description: `${remainingCount} AI requests remaining this hour.`,
        });
      }
    }
  }, []);

  const handleRateLimitError = useCallback((
    responseData: { error?: string; message?: string; retryAfter?: number; resetAt?: string },
    endpoint: string
  ) => {
    const resetAt = responseData.resetAt ? new Date(responseData.resetAt) : null;
    
    setRateLimits(prev => ({
      ...prev,
      [endpoint]: {
        remaining: 0,
        resetAt,
        endpoint,
        isLimited: true,
      }
    }));

    const waitTime = responseData.retryAfter 
      ? Math.ceil(responseData.retryAfter / 60)
      : 60;

    toast({
      title: "Rate Limit Exceeded",
      description: `Too many AI requests. Please wait ${waitTime} minute${waitTime === 1 ? '' : 's'} before trying again.`,
      variant: "destructive",
    });
  }, []);

  const getRateLimitInfo = useCallback((endpoint: string): RateLimitInfo | null => {
    return rateLimits[endpoint] || null;
  }, [rateLimits]);

  const isRateLimited = useCallback((endpoint: string): boolean => {
    const info = rateLimits[endpoint];
    if (!info) return false;
    
    if (info.isLimited && info.resetAt) {
      return new Date() < info.resetAt;
    }
    return info.isLimited;
  }, [rateLimits]);

  const getTimeUntilReset = useCallback((endpoint: string): number | null => {
    const info = rateLimits[endpoint];
    if (!info?.resetAt) return null;
    
    const diff = info.resetAt.getTime() - Date.now();
    return diff > 0 ? Math.ceil(diff / 1000 / 60) : null;
  }, [rateLimits]);

  return {
    rateLimits,
    updateRateLimitFromResponse,
    handleRateLimitError,
    getRateLimitInfo,
    isRateLimited,
    getTimeUntilReset,
  };
}

// Create a singleton for global rate limit state
let globalRateLimitState: RateLimitState = {};

export function getGlobalRateLimitState() {
  return globalRateLimitState;
}

export function updateGlobalRateLimitState(endpoint: string, info: RateLimitInfo) {
  globalRateLimitState = {
    ...globalRateLimitState,
    [endpoint]: info,
  };
}
