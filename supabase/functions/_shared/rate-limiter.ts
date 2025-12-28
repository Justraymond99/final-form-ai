import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Rate limit configurations for different AI functions
export const AI_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-fitness-chat': { maxRequests: 30, windowMs: 3600000 }, // 30/hour
  'ai-workout-generator': { maxRequests: 15, windowMs: 3600000 }, // 15/hour
  'ai-nutrition-generator': { maxRequests: 15, windowMs: 3600000 }, // 15/hour
  'ai-recovery-planner': { maxRequests: 10, windowMs: 3600000 }, // 10/hour
  'ai-recovery-coach': { maxRequests: 20, windowMs: 3600000 }, // 20/hour
  'ai-weekly-coach': { maxRequests: 10, windowMs: 3600000 }, // 10/hour
  'ai-insights-generator': { maxRequests: 10, windowMs: 3600000 }, // 10/hour
  'ai-food-suggestions': { maxRequests: 20, windowMs: 3600000 }, // 20/hour
  'ai-feature-activation': { maxRequests: 10, windowMs: 3600000 }, // 10/hour
  'default': { maxRequests: 20, windowMs: 3600000 }, // 20/hour default
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a request should be rate limited
 * @param userId - The authenticated user's ID
 * @param functionName - The name of the edge function
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  userId: string,
  functionName: string
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const config = AI_RATE_LIMITS[functionName] || AI_RATE_LIMITS['default'];
    const windowStart = new Date(Date.now() - config.windowMs);
    const resetAt = new Date(Date.now() + config.windowMs);

    // Count requests in the current window
    const { count, error } = await supabase
      .from('security_audit_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('endpoint', functionName)
      .eq('action', 'AI_REQUEST')
      .gte('created_at', windowStart.toISOString());

    if (error) {
      console.error('Rate limit check error');
      // Fail open but with reduced limit
      return { allowed: true, remaining: 5, resetAt };
    }

    const requestCount = count || 0;
    const remaining = Math.max(0, config.maxRequests - requestCount - 1);
    const allowed = requestCount < config.maxRequests;

    if (allowed) {
      // Log the request
      await supabase.from('security_audit_log').insert({
        user_id: userId,
        endpoint: functionName,
        action: 'AI_REQUEST',
        request_count: 1,
        blocked: false,
      });
    } else {
      // Log the blocked request
      await supabase.from('security_audit_log').insert({
        user_id: userId,
        endpoint: functionName,
        action: 'AI_RATE_LIMITED',
        request_count: 1,
        blocked: true,
      });
    }

    return { allowed, remaining, resetAt };
  } catch (error) {
    console.error('Rate limiter failed');
    // Fail open
    return { allowed: true, remaining: 10, resetAt: new Date(Date.now() + 3600000) };
  }
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>): Response {
  const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'You have made too many AI requests. Please wait before trying again.',
      retryAfter,
      resetAt: result.resetAt.toISOString(),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toISOString(),
      },
    }
  );
}
