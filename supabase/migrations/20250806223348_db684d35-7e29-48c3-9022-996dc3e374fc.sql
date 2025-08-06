-- Create missing tables
CREATE TABLE IF NOT EXISTS public.workouts (
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

CREATE TABLE IF NOT EXISTS public.daily_tracking (
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

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies  
CREATE POLICY "Users can manage their own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily tracking" ON public.daily_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_tracking_updated_at BEFORE UPDATE ON public.daily_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update daily tracking when food is logged
CREATE OR REPLACE FUNCTION public.update_daily_calories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to update daily tracking when water is logged
CREATE OR REPLACE FUNCTION public.update_daily_water()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create triggers
DROP TRIGGER IF EXISTS on_food_logged ON public.food_logs;
CREATE TRIGGER on_food_logged
  AFTER INSERT ON public.food_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_calories();

DROP TRIGGER IF EXISTS on_water_logged ON public.water_logs;
CREATE TRIGGER on_water_logged
  AFTER INSERT ON public.water_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_water();