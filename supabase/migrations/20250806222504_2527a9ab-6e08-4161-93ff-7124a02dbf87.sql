-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  target_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout templates table
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'strength', 'hypertrophy', 'hiit', 'cardio'
  description TEXT,
  estimated_duration INTEGER, -- minutes
  difficulty TEXT DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id),
  name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  exercises_data JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  is_paused BOOLEAN DEFAULT false,
  paused_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily stats table for tracking daily metrics
CREATE TABLE public.daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  calories_consumed INTEGER DEFAULT 0,
  water_glasses INTEGER DEFAULT 0,
  workout_completed BOOLEAN DEFAULT false,
  meditation_minutes INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create water intake table
CREATE TABLE public.water_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  glasses INTEGER NOT NULL DEFAULT 1,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own achievements" ON public.achievements
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON public.goals
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout templates" ON public.workout_templates
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout sessions" ON public.workout_sessions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily stats" ON public.daily_stats
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own water intake" ON public.water_intake
FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at
BEFORE UPDATE ON public.workout_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
BEFORE UPDATE ON public.workout_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
BEFORE UPDATE ON public.daily_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default achievements for new users
CREATE OR REPLACE FUNCTION public.create_default_achievements(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.achievements (user_id, achievement_type, title, description, icon, target_value) VALUES
  (user_id_param, 'workout_streak', 'First Workout', 'Complete your first workout', 'dumbbell', 1),
  (user_id_param, 'workout_streak', 'Consistent Starter', 'Complete 7 workouts', 'flame', 7),
  (user_id_param, 'workout_streak', 'Dedicated Athlete', 'Complete 30 workouts', 'trophy', 30),
  (user_id_param, 'workout_streak', 'Fitness Master', 'Complete 100 workouts', 'crown', 100),
  (user_id_param, 'daily_streak', 'First Day', 'Log your first day of activity', 'star', 1),
  (user_id_param, 'daily_streak', 'Week Warrior', 'Maintain a 7-day streak', 'zap', 7),
  (user_id_param, 'daily_streak', 'Monthly Master', 'Maintain a 30-day streak', 'award', 30),
  (user_id_param, 'hydration', 'Hydration Hero', 'Drink 8 glasses of water in a day', 'droplets', 8),
  (user_id_param, 'hydration', 'Water Champion', 'Drink 50 glasses total', 'waves', 50),
  (user_id_param, 'calories', 'Nutrition Tracker', 'Log 1000 calories', 'target', 1000),
  (user_id_param, 'calories', 'Calorie Counter', 'Log 10000 calories total', 'trending-up', 10000);
END;
$$;

-- Function to create default goals for new users
CREATE OR REPLACE FUNCTION public.create_default_goals(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to create default workout templates
CREATE OR REPLACE FUNCTION public.create_default_workout_templates(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the handle_new_user function to include new defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.email
  );
  
  -- Create default achievements
  PERFORM public.create_default_achievements(NEW.id);
  
  -- Create default goals  
  PERFORM public.create_default_goals(NEW.id);
  
  -- Create default workout templates
  PERFORM public.create_default_workout_templates(NEW.id);
  
  -- Create initial daily stats entry
  INSERT INTO public.daily_stats (user_id, date) 
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  RETURN NEW;
END;
$$;