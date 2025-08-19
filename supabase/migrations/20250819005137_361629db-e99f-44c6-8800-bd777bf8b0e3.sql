-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.create_default_goals(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.goals (user_id, goal_type, title, target_value, unit, target_date) VALUES
  (user_id_param, 'workout_frequency', 'Weekly Workouts', 3, 'workouts', CURRENT_DATE + INTERVAL '7 days'),
  (user_id_param, 'weight_loss', 'Weight Goal', 10, 'lbs', CURRENT_DATE + INTERVAL '90 days'),
  (user_id_param, 'strength', 'Bench Press Goal', 200, 'lbs', CURRENT_DATE + INTERVAL '180 days'),
  (user_id_param, 'endurance', 'Running Distance', 5, 'miles', CURRENT_DATE + INTERVAL '60 days'),
  (user_id_param, 'hydration', 'Daily Water Goal', 8, 'glasses', CURRENT_DATE + INTERVAL '30 days');
END;
$$;

CREATE OR REPLACE FUNCTION public.create_default_workout_templates(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.workout_templates (user_id, name, type, description, estimated_duration, difficulty, exercises) VALUES
  (user_id_param, 'Push Day - Chest & Triceps', 'hypertrophy', 'Focus on pushing movements for chest, shoulders, and triceps', 45, 'intermediate', 
   '[
     {"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": 180},
     {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 120},
     {"name": "Dips", "sets": 3, "reps": "12-15", "rest": 90},
     {"name": "Overhead Press", "sets": 3, "reps": "8-10", "rest": 120},
     {"name": "Tricep Pushdowns", "sets": 3, "reps": "12-15", "rest": 60}
   ]'::jsonb),
  (user_id_param, 'Pull Day - Back & Biceps', 'hypertrophy', 'Focus on pulling movements for back, rear delts, and biceps', 45, 'intermediate',
   '[
     {"name": "Pull-ups", "sets": 4, "reps": "6-10", "rest": 180},
     {"name": "Barbell Rows", "sets": 4, "reps": "8-10", "rest": 120},
     {"name": "Lat Pulldowns", "sets": 3, "reps": "10-12", "rest": 90},
     {"name": "Face Pulls", "sets": 3, "reps": "15-20", "rest": 60},
     {"name": "Bicep Curls", "sets": 3, "reps": "12-15", "rest": 60}
   ]'::jsonb),
  (user_id_param, 'Leg Day - Quads & Glutes', 'hypertrophy', 'Comprehensive lower body workout', 60, 'intermediate',
   '[
     {"name": "Squats", "sets": 4, "reps": "8-12", "rest": 180},
     {"name": "Romanian Deadlifts", "sets": 3, "reps": "10-12", "rest": 120},
     {"name": "Bulgarian Split Squats", "sets": 3, "reps": "12-15", "rest": 90},
     {"name": "Leg Press", "sets": 3, "reps": "15-20", "rest": 90},
     {"name": "Calf Raises", "sets": 4, "reps": "15-20", "rest": 60}
   ]'::jsonb),
  (user_id_param, '5x5 Strength Training', 'strength', 'Classic strength building program', 60, 'intermediate',
   '[
     {"name": "Squats", "sets": 5, "reps": "5", "rest": 300},
     {"name": "Bench Press", "sets": 5, "reps": "5", "rest": 300},
     {"name": "Barbell Rows", "sets": 5, "reps": "5", "rest": 300},
     {"name": "Overhead Press", "sets": 3, "reps": "5", "rest": 240},
     {"name": "Deadlifts", "sets": 1, "reps": "5", "rest": 300}
   ]'::jsonb),
  (user_id_param, 'HIIT Cardio Blast', 'hiit', 'High intensity interval training for fat burning', 25, 'advanced',
   '[
     {"name": "Burpees", "sets": 4, "reps": "30 sec", "rest": 30},
     {"name": "Mountain Climbers", "sets": 4, "reps": "30 sec", "rest": 30},
     {"name": "Jump Squats", "sets": 4, "reps": "30 sec", "rest": 30},
     {"name": "High Knees", "sets": 4, "reps": "30 sec", "rest": 30},
     {"name": "Plank Jacks", "sets": 4, "reps": "30 sec", "rest": 30}
   ]'::jsonb),
  (user_id_param, 'Beginner Full Body', 'strength', 'Perfect starting workout for beginners', 40, 'beginner',
   '[
     {"name": "Goblet Squats", "sets": 3, "reps": "10-12", "rest": 90},
     {"name": "Push-ups", "sets": 3, "reps": "8-12", "rest": 90},
     {"name": "Assisted Pull-ups", "sets": 3, "reps": "5-8", "rest": 90},
     {"name": "Plank", "sets": 3, "reps": "30-60 sec", "rest": 60},
     {"name": "Glute Bridges", "sets": 3, "reps": "12-15", "rest": 60}
   ]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_daily_water()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.daily_tracking (user_id, date, water_intake_ml)
  VALUES (NEW.user_id, NEW.date, NEW.amount_ml)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    water_intake_ml = daily_tracking.water_intake_ml + NEW.amount_ml,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.update_daily_calories()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.email
  );
  
  -- Create default achievements (including completed signup)
  PERFORM public.create_default_achievements(NEW.id);
  
  -- Create default goals starting from 0
  INSERT INTO public.goals (user_id, goal_type, title, target_value, unit, target_date, current_value) VALUES
  (NEW.id, 'workout_frequency', 'Weekly Workouts', 3, 'workouts', CURRENT_DATE + INTERVAL '7 days', 0),
  (NEW.id, 'weight_loss', 'Weight Goal', 10, 'lbs', CURRENT_DATE + INTERVAL '90 days', 0),
  (NEW.id, 'strength', 'Bench Press Goal', 200, 'lbs', CURRENT_DATE + INTERVAL '180 days', 0),
  (NEW.id, 'endurance', 'Running Distance', 5, 'miles', CURRENT_DATE + INTERVAL '60 days', 0),
  (NEW.id, 'hydration', 'Daily Water Goal', 8, 'glasses', CURRENT_DATE + INTERVAL '30 days', 0);
  
  -- Create default workout templates
  PERFORM public.create_default_workout_templates(NEW.id);
  
  -- Create initial daily stats entry starting from 0
  INSERT INTO public.daily_tracking (user_id, date, calories_consumed, water_intake_ml, workout_completed, workout_streak, steps, meditation_minutes) 
  VALUES (NEW.id, CURRENT_DATE, 0, 0, false, 0, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.create_default_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clear existing achievements for this user if any
  DELETE FROM public.achievements WHERE user_id = user_id_param;
  
  -- Create fresh achievement set starting from 0
  INSERT INTO public.achievements (user_id, achievement_type, title, description, icon, target_value, current_value, completed) VALUES
  
  -- Signup achievements (already completed)
  (user_id_param, 'signup', 'Welcome Aboard!', 'Created your fitness account', 'star', 1, 1, true),
  
  -- First time achievements  
  (user_id_param, 'first_workout', 'First Workout', 'Complete your first workout', 'dumbbell', 1, 0, false),
  (user_id_param, 'first_food_log', 'Food Logger', 'Log your first meal', 'utensils', 1, 0, false),
  (user_id_param, 'first_water_log', 'Hydration Start', 'Log your first water intake', 'droplets', 1, 0, false),
  (user_id_param, 'first_full_day', 'Complete Day', 'Log breakfast, lunch, and dinner in one day', 'calendar', 1, 0, false),
  
  -- Workout streak achievements
  (user_id_param, 'workout_streak', 'Consistent Starter', 'Complete 3 workouts', 'flame', 3, 0, false),
  (user_id_param, 'workout_streak', 'Week Warrior', 'Complete 7 workouts', 'zap', 7, 0, false),
  (user_id_param, 'workout_streak', 'Monthly Master', 'Complete 30 workouts', 'trophy', 30, 0, false),
  (user_id_param, 'workout_streak', 'Century Club', 'Complete 100 workouts', 'crown', 100, 0, false),
  
  -- Nutrition achievements
  (user_id_param, 'nutrition_streak', 'Food Tracker', 'Log food for 3 days', 'target', 3, 0, false),
  (user_id_param, 'nutrition_streak', 'Nutrition Pro', 'Log food for 7 days', 'trending-up', 7, 0, false),
  (user_id_param, 'nutrition_streak', 'Diet Master', 'Log food for 30 days', 'award', 30, 0, false),
  
  -- Hydration achievements
  (user_id_param, 'hydration', 'Hydration Hero', 'Drink 8 glasses of water in a day', 'waves', 8, 0, false),
  (user_id_param, 'hydration', 'Water Champion', 'Drink water for 7 consecutive days', 'droplets', 7, 0, false),
  
  -- Calorie achievements
  (user_id_param, 'calories', 'Calorie Tracker', 'Log 2000 calories', 'target', 2000, 0, false),
  (user_id_param, 'calories', 'Nutrition Master', 'Log 10000 calories total', 'trending-up', 10000, 0, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_check_achievements()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.check_achievements(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.check_achievements(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;