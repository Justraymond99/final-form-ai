-- Fix function search path warnings by setting secure search path on existing functions
ALTER FUNCTION public.create_default_achievements(user_id_param uuid)
SET search_path = 'public';

ALTER FUNCTION public.check_achievements(user_id_param uuid)
SET search_path = 'public';