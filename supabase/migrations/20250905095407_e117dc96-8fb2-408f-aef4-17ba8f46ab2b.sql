-- Create workout_stats table for tracking user progress
CREATE TABLE public.workout_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_workouts INTEGER NOT NULL DEFAULT 0,
  total_time_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own workout stats" 
ON public.workout_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout stats" 
ON public.workout_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout stats" 
ON public.workout_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_workout_stats_updated_at
BEFORE UPDATE ON public.workout_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment workout stats
CREATE OR REPLACE FUNCTION public.increment_workout_stats(workout_duration_minutes INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert or update workout stats for the current user
  INSERT INTO public.workout_stats (user_id, total_workouts, total_time_minutes)
  VALUES (auth.uid(), 1, workout_duration_minutes)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_workouts = workout_stats.total_workouts + 1,
    total_time_minutes = workout_stats.total_time_minutes + workout_duration_minutes,
    updated_at = now();
END;
$$;

-- Add unique constraint on user_id to ensure one record per user
ALTER TABLE public.workout_stats ADD CONSTRAINT unique_user_workout_stats UNIQUE (user_id);