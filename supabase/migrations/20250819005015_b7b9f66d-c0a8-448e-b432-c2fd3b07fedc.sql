-- Create security audit table for rate limiting and monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  endpoint TEXT,
  action TEXT,
  request_count INTEGER DEFAULT 1,
  blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage security logs (no user access)
CREATE POLICY "System only access to security audit log" 
ON public.security_audit_log 
FOR ALL 
USING (false);

-- Create index for performance on rate limiting queries
CREATE INDEX IF NOT EXISTS idx_security_audit_ip_endpoint_time 
ON public.security_audit_log (ip_address, endpoint, created_at);

CREATE INDEX IF NOT EXISTS idx_security_audit_user_endpoint_time 
ON public.security_audit_log (user_id, endpoint, created_at);

-- Create function to clean up expired audit logs
CREATE OR REPLACE FUNCTION public.cleanup_expired_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.security_audit_log 
  WHERE expires_at < now();
END;
$$;

-- Add enhanced RLS policies with additional security checks

-- Update profiles table with stricter policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Ensure all other tables have proper RLS with null checks
DROP POLICY IF EXISTS "Users can manage their own achievements" ON public.achievements;
CREATE POLICY "Users can manage their own achievements" 
ON public.achievements 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own custom goals" ON public.custom_goals;
CREATE POLICY "Users can manage their own custom goals" 
ON public.custom_goals 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own daily stats" ON public.daily_stats;
CREATE POLICY "Users can manage their own daily stats" 
ON public.daily_stats 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own daily tracking" ON public.daily_tracking;
CREATE POLICY "Users can manage their own daily tracking" 
ON public.daily_tracking 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can insert their own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can update their own food logs" ON public.food_logs;
DROP POLICY IF EXISTS "Users can delete their own food logs" ON public.food_logs;

CREATE POLICY "Users can manage their own food logs" 
ON public.food_logs 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;
CREATE POLICY "Users can manage their own goals" 
ON public.goals 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own shopping list items" ON public.shopping_list_items;
CREATE POLICY "Users can manage their own shopping list items" 
ON public.shopping_list_items 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can manage their own shopping lists" 
ON public.shopping_lists 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own water intake" ON public.water_intake;
CREATE POLICY "Users can manage their own water intake" 
ON public.water_intake 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own water logs" ON public.water_logs;
CREATE POLICY "Users can manage their own water logs" 
ON public.water_logs 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can manage their own workout sessions" 
ON public.workout_sessions 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can manage their own workout templates" 
ON public.workout_templates 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can manage their own workouts" ON public.workouts;
CREATE POLICY "Users can manage their own workouts" 
ON public.workouts 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);