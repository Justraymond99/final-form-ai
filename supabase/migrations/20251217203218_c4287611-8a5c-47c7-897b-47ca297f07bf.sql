-- Create generation_history table to track all AI-generated content
CREATE TABLE public.generation_history (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    generation_type text NOT NULL, -- 'workout', 'nutrition', 'insights', 'recovery'
    title text,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb, -- store preferences, parameters used
    is_saved boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_type ON public.generation_history(generation_type);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policy - users can only access their own generation history
CREATE POLICY "Users can manage their own generation history"
ON public.generation_history
FOR ALL
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE TRIGGER update_generation_history_updated_at
    BEFORE UPDATE ON public.generation_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();