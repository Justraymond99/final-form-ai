-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'workouts', -- 'workouts', 'calories', 'steps', 'water', 'custom'
  target_value INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'workouts',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create friends table for social features
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create weekly/monthly summaries table
CREATE TABLE public.progress_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL, -- 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_workouts INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0, -- sets * reps * weight
  total_calories_logged INTEGER DEFAULT 0,
  avg_daily_calories INTEGER DEFAULT 0,
  total_water_ml INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  weight_change_kg NUMERIC,
  highlights JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Users can view public challenges" ON public.challenges FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own challenges" ON public.challenges FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own challenges" ON public.challenges FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own challenges" ON public.challenges FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for challenge_participants
CREATE POLICY "Users can view their participations" ON public.challenge_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view other participants in their challenges" ON public.challenge_participants FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.challenge_participants cp WHERE cp.challenge_id = challenge_participants.challenge_id AND cp.user_id = auth.uid()));
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their progress" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave challenges" ON public.challenge_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for friends
CREATE POLICY "Users can view their friends" ON public.friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can send friend requests" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend status" ON public.friends FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can remove friends" ON public.friends FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for progress_summaries
CREATE POLICY "Users can view their summaries" ON public.progress_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their summaries" ON public.progress_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their summaries" ON public.progress_summaries FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_challenges_dates ON public.challenges(start_date, end_date);
CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX idx_friends_user ON public.friends(user_id);
CREATE INDEX idx_friends_friend ON public.friends(friend_id);
CREATE INDEX idx_progress_summaries_user_period ON public.progress_summaries(user_id, period_type, period_start);

-- Triggers for updated_at
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenge_participants_updated_at BEFORE UPDATE ON public.challenge_participants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON public.friends FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();