-- ===========================================
-- PERFORMANCE INDEXES FOR HEAVY QUERIES
-- ===========================================

-- Index for calories consumed queries (daily tracking, analytics)
CREATE INDEX IF NOT EXISTS idx_daily_tracking_user_date 
ON public.daily_tracking(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_tracking_date 
ON public.daily_tracking(date DESC);

-- Index for workout queries (streaks, recent workouts)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_completed 
ON public.workout_sessions(user_id, completed_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started 
ON public.workout_sessions(user_id, started_at DESC);

-- Index for food logs (calorie tracking, meal type filtering)
CREATE INDEX IF NOT EXISTS idx_food_logs_user_logged 
ON public.food_logs(user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type 
ON public.food_logs(user_id, meal_type, logged_at DESC);

-- Index for water logs
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date 
ON public.water_logs(user_id, date DESC);

-- Index for achievements (completion tracking)
CREATE INDEX IF NOT EXISTS idx_achievements_user_completed 
ON public.achievements(user_id, completed DESC, achievement_type);

-- Index for goals (active goals)
CREATE INDEX IF NOT EXISTS idx_goals_user_completed 
ON public.goals(user_id, completed, target_date);

-- Index for workout templates (quick lookup)
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_type 
ON public.workout_templates(user_id, type);

-- Index for scheduled workouts
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_date 
ON public.scheduled_workouts(user_id, scheduled_date DESC);

-- Index for personal records
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise 
ON public.personal_records(user_id, exercise_name, recorded_at DESC);

-- Index for body measurements (weight tracking trends)
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date 
ON public.body_measurements(user_id, date DESC);

-- ===========================================
-- ANALYTICS & AUDIT LOGGING TABLE
-- ===========================================

-- Create analytics events table for tracking user behavior
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  event_properties jsonb DEFAULT '{}',
  page_url text,
  session_id text,
  device_info jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user 
ON public.analytics_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name 
ON public.analytics_events(event_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only system can insert (via edge function with service role)
CREATE POLICY "System can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);

-- ===========================================
-- AI RESPONSE CACHE TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  prompt_hash text NOT NULL,
  response jsonb NOT NULL,
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  tokens_used integer,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for cache lookups
CREATE INDEX IF NOT EXISTS idx_ai_cache_key 
ON public.ai_response_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_ai_cache_expires 
ON public.ai_response_cache(expires_at);

-- Enable RLS (system access only)
ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Only system can manage cache
CREATE POLICY "System only access to AI cache" 
ON public.ai_response_cache 
FOR ALL 
USING (false);

-- ===========================================
-- ERROR/AUDIT LOG TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  error_type text NOT NULL,
  error_message text NOT NULL,
  error_stack text,
  function_name text,
  request_data jsonb,
  severity text DEFAULT 'error' CHECK (severity IN ('info', 'warn', 'error', 'critical')),
  resolved boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for error queries
CREATE INDEX IF NOT EXISTS idx_error_logs_severity 
ON public.error_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_function 
ON public.error_logs(function_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only system can manage error logs
CREATE POLICY "System only access to error logs" 
ON public.error_logs 
FOR ALL 
USING (false);

-- ===========================================
-- CLEANUP FUNCTION FOR EXPIRED CACHE
-- ===========================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_ai_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_response_cache 
  WHERE expires_at < now();
END;
$$;