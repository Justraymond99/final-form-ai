-- Add scheduled days to workout templates
ALTER TABLE public.workout_templates 
ADD COLUMN scheduled_days JSONB DEFAULT '[]'::jsonb;

-- Create custom goals table
CREATE TABLE public.custom_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  target_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_goals
ALTER TABLE public.custom_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_goals
CREATE POLICY "Users can manage their own custom goals" 
ON public.custom_goals 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_custom_goals_updated_at
BEFORE UPDATE ON public.custom_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();