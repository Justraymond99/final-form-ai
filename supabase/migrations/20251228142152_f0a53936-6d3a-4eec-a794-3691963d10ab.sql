-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;

-- Create a new policy that only allows users to insert their own analytics events
CREATE POLICY "Users can insert their own analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);