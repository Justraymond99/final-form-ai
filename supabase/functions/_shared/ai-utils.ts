import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Structured logging
export function log(level: 'info' | 'warn' | 'error', fn: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [${fn}] ${message}`, data ? JSON.stringify(data) : '');
}

// Log errors to database
export async function logError(
  functionName: string,
  errorType: string,
  errorMessage: string,
  errorStack?: string,
  requestData?: unknown,
  userId?: string,
  severity: 'info' | 'warn' | 'error' | 'critical' = 'error'
) {
  try {
    await supabase.from('error_logs').insert({
      user_id: userId,
      error_type: errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      function_name: functionName,
      request_data: requestData,
      severity
    });
  } catch (e) {
    console.error('Failed to log error:', e);
  }
}

// Generate a cache key from prompt
export function generateCacheKey(prompt: string, model: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(prompt + model);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `ai_${Math.abs(hash).toString(36)}`;
}

// Check cache for existing response
export async function getCachedResponse(cacheKey: string): Promise<unknown | null> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !data) return null;
    return data.response;
  } catch {
    return null;
  }
}

// Cache a response
export async function cacheResponse(
  cacheKey: string,
  promptHash: string,
  response: unknown,
  model: string,
  tokensUsed?: number,
  ttlHours: number = 24
) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    await supabase.from('ai_response_cache').upsert({
      cache_key: cacheKey,
      prompt_hash: promptHash,
      response,
      model,
      tokens_used: tokensUsed,
      expires_at: expiresAt.toISOString()
    });
  } catch (e) {
    console.error('Failed to cache response:', e);
  }
}

// Call AI with retry and fallback
export async function callAI(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    stream?: boolean;
    maxRetries?: number;
    functionName?: string;
    userId?: string;
  } = {}
): Promise<Response> {
  const {
    model = 'google/gemini-2.5-flash',
    stream = false,
    maxRetries = 2,
    functionName = 'unknown',
    userId
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
        }),
      });

      if (response.ok) {
        return response;
      }

      // Handle rate limits and payment errors specially
      if (response.status === 429 || response.status === 402) {
        await logError(
          functionName,
          response.status === 429 ? 'rate_limit' : 'payment_required',
          `AI gateway returned ${response.status}`,
          undefined,
          undefined,
          userId,
          'warn'
        );
        
        // Return the error response, don't retry
        return response;
      }

      const errorText = await response.text();
      lastError = new Error(`AI gateway error: ${response.status} - ${errorText}`);
      
      log('warn', functionName, `AI call attempt ${attempt + 1} failed`, { 
        status: response.status, 
        error: errorText 
      });

    } catch (error) {
      lastError = error as Error;
      log('warn', functionName, `AI call attempt ${attempt + 1} threw error`, { 
        error: error.message 
      });
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  // Log the final failure
  await logError(
    functionName,
    'ai_call_failed',
    lastError?.message || 'Unknown AI error',
    lastError?.stack,
    undefined,
    userId,
    'error'
  );

  throw lastError || new Error('AI call failed after retries');
}

// Extract JSON from AI response (handles markdown code blocks)
export function extractJSON(text: string): string {
  // Try to find JSON within markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Try to find array in code blocks
  const arrayBlockMatch = text.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
  if (arrayBlockMatch) {
    return arrayBlockMatch[1];
  }
  
  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  // Try to find raw array
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  
  return text;
}

// Batch fetch user context in single query
export async function getUserContext(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  // Execute all queries in parallel
  const [
    profileResult,
    dailyTrackingResult,
    recentWorkoutsResult,
    goalsResult,
    recentFoodResult
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle(),
    supabase
      .from('workout_sessions')
      .select('id, name, exercises_data, completed_at, duration_minutes')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', sevenDaysAgoStr)
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('goals')
      .select('goal_type, title, target_value, current_value, unit')
      .eq('user_id', userId)
      .eq('completed', false)
      .limit(10),
    supabase
      .from('food_logs')
      .select('food_name, calories, meal_type, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sevenDaysAgoStr)
      .order('logged_at', { ascending: false })
      .limit(10)
  ]);

  return {
    profile: profileResult.data,
    dailyTracking: dailyTrackingResult.data,
    recentWorkouts: recentWorkoutsResult.data || [],
    goals: goalsResult.data || [],
    recentFood: recentFoodResult.data || []
  };
}
