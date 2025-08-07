-- Update the food logs trigger to properly sync with daily tracking
CREATE OR REPLACE FUNCTION public.update_daily_calories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Calculate total calories for the day
  INSERT INTO public.daily_tracking (user_id, date, calories_consumed)
  SELECT 
    NEW.user_id, 
    NEW.logged_at::date, 
    COALESCE(SUM(calories), 0)
  FROM public.food_logs 
  WHERE user_id = NEW.user_id 
    AND logged_at::date = NEW.logged_at::date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calories_consumed = EXCLUDED.calories_consumed,
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_daily_calories_trigger ON public.food_logs;

-- Create new trigger for food logs
CREATE TRIGGER update_daily_calories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.food_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_calories();