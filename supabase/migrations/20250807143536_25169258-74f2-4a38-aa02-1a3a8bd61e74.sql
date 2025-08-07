-- Fix the check_achievements function to use correct column names
CREATE OR REPLACE FUNCTION public.check_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  workout_count integer;
  food_log_days integer;
  water_log_days integer;
  total_calories integer;
  daily_water_count integer;
  full_day_count integer;
BEGIN
  -- Get current stats
  SELECT COUNT(*) INTO workout_count
  FROM public.workout_sessions 
  WHERE user_id = user_id_param AND completed_at IS NOT NULL;
  
  -- Fix: Use logged_at::date instead of date for food_logs
  SELECT COUNT(DISTINCT logged_at::date) INTO food_log_days
  FROM public.food_logs 
  WHERE user_id = user_id_param;
  
  SELECT COUNT(DISTINCT date) INTO water_log_days
  FROM public.water_logs 
  WHERE user_id = user_id_param;
  
  SELECT COALESCE(SUM(calories), 0) INTO total_calories
  FROM public.food_logs 
  WHERE user_id = user_id_param;
  
  -- Count full days (breakfast, lunch, dinner logged) - Fix: Use logged_at::date
  SELECT COUNT(*)::integer INTO full_day_count
  FROM (
    SELECT logged_at::date as date
    FROM public.food_logs 
    WHERE user_id = user_id_param 
    GROUP BY logged_at::date
    HAVING 
      COUNT(CASE WHEN meal_type = 'breakfast' THEN 1 END) > 0 AND
      COUNT(CASE WHEN meal_type = 'lunch' THEN 1 END) > 0 AND
      COUNT(CASE WHEN meal_type = 'dinner' THEN 1 END) > 0
  ) full_days;
  
  -- Check daily water intake for today
  SELECT COUNT(*) INTO daily_water_count
  FROM public.water_logs
  WHERE user_id = user_id_param AND date = CURRENT_DATE;
  
  -- Update achievements based on current progress
  
  -- First workout
  UPDATE public.achievements 
  SET current_value = LEAST(workout_count, target_value),
      completed = (workout_count >= target_value),
      completed_at = CASE WHEN workout_count >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'first_workout';
  
  -- Workout streaks
  UPDATE public.achievements 
  SET current_value = LEAST(workout_count, target_value),
      completed = (workout_count >= target_value),
      completed_at = CASE WHEN workout_count >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'workout_streak';
  
  -- First food log
  UPDATE public.achievements 
  SET current_value = LEAST(food_log_days, target_value),
      completed = (food_log_days >= target_value),
      completed_at = CASE WHEN food_log_days >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'first_food_log';
  
  -- Nutrition streaks
  UPDATE public.achievements 
  SET current_value = LEAST(food_log_days, target_value),
      completed = (food_log_days >= target_value),
      completed_at = CASE WHEN food_log_days >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'nutrition_streak';
  
  -- First water log
  UPDATE public.achievements 
  SET current_value = LEAST(water_log_days, target_value),
      completed = (water_log_days >= target_value),
      completed_at = CASE WHEN water_log_days >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'first_water_log';
  
  -- Hydration achievements
  UPDATE public.achievements 
  SET current_value = LEAST(daily_water_count, target_value),
      completed = (daily_water_count >= target_value),
      completed_at = CASE WHEN daily_water_count >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'hydration' AND title = 'Hydration Hero';
  
  UPDATE public.achievements 
  SET current_value = LEAST(water_log_days, target_value),
      completed = (water_log_days >= target_value),
      completed_at = CASE WHEN water_log_days >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'hydration' AND title = 'Water Champion';
  
  -- Full day achievements
  UPDATE public.achievements 
  SET current_value = LEAST(full_day_count, target_value),
      completed = (full_day_count >= target_value),
      completed_at = CASE WHEN full_day_count >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'first_full_day';
  
  -- Calorie achievements
  UPDATE public.achievements 
  SET current_value = LEAST(total_calories::integer, target_value),
      completed = (total_calories >= target_value),
      completed_at = CASE WHEN total_calories >= target_value AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = user_id_param AND achievement_type = 'calories';
  
END;
$function$;