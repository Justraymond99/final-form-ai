-- Create recent_searches table to track user's food searches
CREATE TABLE IF NOT EXISTS public.recent_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_recent_searches_user_id ON public.recent_searches(user_id, searched_at DESC);

-- Enable RLS
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recent_searches
CREATE POLICY "Users can view their own recent searches"
ON public.recent_searches
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent searches"
ON public.recent_searches
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches"
ON public.recent_searches
FOR DELETE
USING (auth.uid() = user_id);

-- Create favorite_foods table
CREATE TABLE IF NOT EXISTS public.favorite_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  brand TEXT,
  food_id TEXT,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sodium_mg NUMERIC,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_favorite_foods_user_id ON public.favorite_foods(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.favorite_foods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorite_foods
CREATE POLICY "Users can view their own favorite foods"
ON public.favorite_foods
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite foods"
ON public.favorite_foods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite foods"
ON public.favorite_foods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite foods"
ON public.favorite_foods
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_favorite_foods_updated_at
BEFORE UPDATE ON public.favorite_foods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();