-- Fix security warnings by setting search paths for functions
CREATE OR REPLACE FUNCTION public.update_daily_calories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.daily_tracking (user_id, date, calories_consumed)
  VALUES (NEW.user_id, NEW.logged_at::date, COALESCE(NEW.calories, 0))
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calories_consumed = daily_tracking.calories_consumed + COALESCE(NEW.calories, 0),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_daily_water()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.daily_tracking (user_id, date, water_intake_ml)
  VALUES (NEW.user_id, NEW.date, NEW.amount_ml)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    water_intake_ml = daily_tracking.water_intake_ml + NEW.amount_ml,
    updated_at = now();
  
  RETURN NEW;
END;
$$;