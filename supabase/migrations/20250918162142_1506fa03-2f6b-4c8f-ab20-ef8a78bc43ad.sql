-- Create table for saving AI-generated meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for meal plans
CREATE POLICY "Users can manage their own meal plans" 
ON public.meal_plans 
FOR ALL 
USING ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL))
WITH CHECK ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for quick meal plan items (for easy adding to food logs)
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  calories NUMERIC,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  fiber_g NUMERIC,
  sugar_g NUMERIC,
  sodium_mg NUMERIC,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Create policies for meal plan items
CREATE POLICY "Users can manage their own meal plan items" 
ON public.meal_plan_items 
FOR ALL 
USING ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL))
WITH CHECK ((auth.uid() = user_id) AND (auth.uid() IS NOT NULL));