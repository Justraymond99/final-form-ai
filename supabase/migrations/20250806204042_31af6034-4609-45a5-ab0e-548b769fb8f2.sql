-- Create shopping lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Shopping List',
  store_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shopping lists
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shopping lists" 
ON public.shopping_lists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create shopping list items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT, -- external retailer product ID
  product_name TEXT NOT NULL,
  brand TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'piece',
  estimated_price DECIMAL(8,2),
  store_url TEXT,
  image_url TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shopping list items
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shopping list items" 
ON public.shopping_list_items 
FOR ALL 
USING (auth.uid() = user_id);

-- Update the existing profiles table to add the new fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_preferences JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goals TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_weight_kg DECIMAL(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_calories_per_day INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_protein_g INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_carbs_g INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_fat_g INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_stores TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS budget_preference TEXT CHECK (budget_preference IN ('budget', 'mid_range', 'premium'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organic_preference BOOLEAN DEFAULT FALSE;

-- Update food_logs to reference auth.users instead of profiles for RLS
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS food_item_id TEXT;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS calories_per_unit DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS protein_g DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS carbs_g DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS fat_g DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS fiber_g DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS sugar_g DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS sodium_mg DECIMAL(8,2);
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));
ALTER TABLE public.food_logs ADD COLUMN IF NOT EXISTS logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();