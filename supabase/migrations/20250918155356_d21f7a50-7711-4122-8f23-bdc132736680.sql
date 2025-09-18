-- Fix the remaining function search path issue
CREATE OR REPLACE FUNCTION public.cleanup_expired_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.security_audit_log 
  WHERE expires_at < now();
END;
$$;