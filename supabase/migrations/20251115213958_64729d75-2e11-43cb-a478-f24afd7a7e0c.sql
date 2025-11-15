-- Create body measurements table
CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  arms_cm DECIMAL(5,2),
  thighs_cm DECIMAL(5,2),
  body_fat_percent DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create personal records table
CREATE TABLE public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  workout_session_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (workout_session_id) REFERENCES public.workout_sessions(id) ON DELETE SET NULL
);

-- Create scheduled_workouts table for calendar
CREATE TABLE public.scheduled_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workout_template_id UUID,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed BOOLEAN DEFAULT false,
  completed_session_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (workout_template_id) REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_session_id) REFERENCES public.workout_sessions(id) ON DELETE SET NULL
);

-- Create notification_queue table
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for body_measurements
CREATE POLICY "Users can view their own body measurements" 
ON public.body_measurements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body measurements" 
ON public.body_measurements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body measurements" 
ON public.body_measurements FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body measurements" 
ON public.body_measurements FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for personal_records
CREATE POLICY "Users can view their own personal records" 
ON public.personal_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal records" 
ON public.personal_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal records" 
ON public.personal_records FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal records" 
ON public.personal_records FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for scheduled_workouts
CREATE POLICY "Users can view their own scheduled workouts" 
ON public.scheduled_workouts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled workouts" 
ON public.scheduled_workouts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled workouts" 
ON public.scheduled_workouts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled workouts" 
ON public.scheduled_workouts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for notification_queue
CREATE POLICY "Users can view their own notifications" 
ON public.notification_queue FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notification_queue FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_body_measurements_updated_at
BEFORE UPDATE ON public.body_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at
BEFORE UPDATE ON public.personal_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_workouts_updated_at
BEFORE UPDATE ON public.scheduled_workouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, date DESC);
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_name, recorded_at DESC);
CREATE INDEX idx_scheduled_workouts_user_date ON public.scheduled_workouts(user_id, scheduled_date);
CREATE INDEX idx_notification_queue_user_scheduled ON public.notification_queue(user_id, scheduled_for) WHERE NOT sent;