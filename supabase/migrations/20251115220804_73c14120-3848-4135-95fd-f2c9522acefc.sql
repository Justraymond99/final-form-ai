-- Progress Photos Table
CREATE TABLE IF NOT EXISTS public.progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  photo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC,
  notes TEXT,
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')) DEFAULT 'front',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Exercise Library Table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  exercise_type TEXT CHECK (exercise_type IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric')) DEFAULT 'strength',
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Recipes Table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT NOT NULL,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  dietary_tags TEXT[] DEFAULT '{}',
  cuisine_type TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Workout Timers/Sessions Enhancement
CREATE TABLE IF NOT EXISTS public.workout_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  default_rest_seconds INTEGER DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, exercise_name)
);

-- Enable RLS on all tables
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_timers ENABLE ROW LEVEL SECURITY;

-- Progress Photos Policies
CREATE POLICY "Users can manage their own progress photos"
  ON public.progress_photos FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Exercise Library Policies (public read, only admins can write)
CREATE POLICY "Anyone can view exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (true);

-- Recipes Policies
CREATE POLICY "Users can view public recipes and their own"
  ON public.recipes FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes"
  ON public.recipes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Workout Timers Policies
CREATE POLICY "Users can manage their own workout timers"
  ON public.workout_timers FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_progress_photos_updated_at
  BEFORE UPDATE ON public.progress_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_timers_updated_at
  BEFORE UPDATE ON public.workout_timers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_progress_photos_user_date ON public.progress_photos(user_id, photo_date DESC);
CREATE INDEX idx_exercises_muscle_groups ON public.exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_equipment ON public.exercises USING GIN(equipment);
CREATE INDEX idx_recipes_dietary_tags ON public.recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_public ON public.recipes(is_public) WHERE is_public = true;