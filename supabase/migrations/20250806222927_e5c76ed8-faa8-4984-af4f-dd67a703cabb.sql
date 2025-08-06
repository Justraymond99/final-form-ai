-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  is_earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration_minutes INTEGER,
  exercises JSONB NOT NULL,
  target_muscles TEXT[],
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_id UUID REFERENCES public.workouts(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  exercises_completed JSONB,
  is_paused BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_tracking table
CREATE TABLE public.daily_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  water_intake_ml INTEGER DEFAULT 0,
  workout_completed BOOLEAN DEFAULT false,
  workout_streak INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  meditation_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create water_logs table
CREATE TABLE public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS on all tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workout sessions" ON public.workout_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily tracking" ON public.daily_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_tracking_updated_at BEFORE UPDATE ON public.daily_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user data
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default achievements
  INSERT INTO public.achievements (user_id, title, description, icon, category, target_value) VALUES
  (NEW.user_id, 'First Workout', 'Complete your first workout', 'Dumbbell', 'fitness', 1),
  (NEW.user_id, 'Week Warrior', 'Complete 7 workouts', 'Trophy', 'fitness', 7),
  (NEW.user_id, 'Month Master', 'Complete 30 workouts', 'Crown', 'fitness', 30),
  (NEW.user_id, 'Hydration Hero', 'Drink 2L of water in a day', 'Droplets', 'nutrition', 2000),
  (NEW.user_id, 'Calorie Counter', 'Log 100 meals', 'Apple', 'nutrition', 100),
  (NEW.user_id, 'Streak Starter', 'Maintain a 7-day workout streak', 'Flame', 'consistency', 7),
  (NEW.user_id, 'Consistency King', 'Maintain a 30-day workout streak', 'Medal', 'consistency', 30),
  (NEW.user_id, 'Early Bird', 'Complete 10 morning workouts', 'Sunrise', 'timing', 10),
  (NEW.user_id, 'Goal Getter', 'Achieve 5 fitness goals', 'Target', 'goals', 5),
  (NEW.user_id, 'Marathon Mindset', 'Complete 100 workouts', 'Heart', 'fitness', 100);

  -- Insert default goals
  INSERT INTO public.goals (user_id, title, description, category, target_value, unit) VALUES
  (NEW.user_id, 'Weekly Workouts', 'Complete 4 workouts per week', 'fitness', 4, 'workouts'),
  (NEW.user_id, 'Daily Water', 'Drink 2L of water daily', 'nutrition', 2000, 'ml'),
  (NEW.user_id, 'Weight Loss', 'Lose 10 pounds', 'body', 10, 'lbs'),
  (NEW.user_id, 'Muscle Gain', 'Gain 5 pounds of muscle', 'body', 5, 'lbs'),
  (NEW.user_id, 'Daily Steps', 'Walk 10,000 steps daily', 'activity', 10000, 'steps'),
  (NEW.user_id, 'Meditation', 'Meditate 15 minutes daily', 'wellness', 15, 'minutes');

  -- Insert workout templates
  INSERT INTO public.workouts (user_id, name, type, difficulty, duration_minutes, exercises, target_muscles, is_template) VALUES
  (NEW.user_id, 'Hypertrophy Upper Body', 'hypertrophy', 'intermediate', 60, 
   '[{"name": "Bench Press", "sets": 4, "reps": "8-10", "rest": 90}, {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest": 60}, {"name": "Barbell Rows", "sets": 4, "reps": "8-10", "rest": 90}, {"name": "Pull-ups", "sets": 3, "reps": "max", "rest": 90}]'::jsonb,
   '{"chest", "back", "shoulders", "arms"}', true),
  (NEW.user_id, 'Strength Deadlift Focus', 'strength', 'advanced', 45,
   '[{"name": "Deadlift", "sets": 5, "reps": "3-5", "rest": 180}, {"name": "Romanian Deadlift", "sets": 3, "reps": "6-8", "rest": 120}, {"name": "Barbell Rows", "sets": 3, "reps": "5", "rest": 120}]'::jsonb,
   '{"back", "legs", "glutes"}', true),
  (NEW.user_id, 'HIIT Cardio Blast', 'hiit', 'beginner', 20,
   '[{"name": "Burpees", "duration": "30s", "rest": "30s", "rounds": 4}, {"name": "Mountain Climbers", "duration": "30s", "rest": "30s", "rounds": 4}, {"name": "Jump Squats", "duration": "30s", "rest": "30s", "rounds": 4}]'::jsonb,
   '{"full body", "cardio"}', true),
  (NEW.user_id, 'Leg Day Hypertrophy', 'hypertrophy', 'intermediate', 75,
   '[{"name": "Squats", "sets": 4, "reps": "10-12", "rest": 90}, {"name": "Leg Press", "sets": 3, "reps": "12-15", "rest": 60}, {"name": "Leg Curls", "sets": 3, "reps": "12-15", "rest": 60}, {"name": "Calf Raises", "sets": 4, "reps": "15-20", "rest": 45}]'::jsonb,
   '{"legs", "glutes", "calves"}', true);

  -- Create initial daily tracking record
  INSERT INTO public.daily_tracking (user_id, date) VALUES (NEW.user_id, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger to initialize user data when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();

-- Function to update daily tracking when food is logged
CREATE OR REPLACE FUNCTION public.update_daily_calories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update daily tracking with new calories
  INSERT INTO public.daily_tracking (user_id, date, calories_consumed)
  VALUES (NEW.user_id, NEW.logged_at::date, COALESCE(NEW.calories, 0))
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    calories_consumed = daily_tracking.calories_consumed + COALESCE(NEW.calories, 0),
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to update calories when food is logged
CREATE TRIGGER on_food_logged
  AFTER INSERT ON public.food_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_calories();

-- Function to update daily tracking when water is logged
CREATE OR REPLACE FUNCTION public.update_daily_water()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update daily tracking with new water intake
  INSERT INTO public.daily_tracking (user_id, date, water_intake_ml)
  VALUES (NEW.user_id, NEW.date, NEW.amount_ml)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    water_intake_ml = daily_tracking.water_intake_ml + NEW.amount_ml,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to update water when logged
CREATE TRIGGER on_water_logged
  AFTER INSERT ON public.water_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_water();