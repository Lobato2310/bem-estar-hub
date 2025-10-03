-- Create table for exercise logs during workout
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id),
  workout_plan_id UUID NOT NULL REFERENCES workout_plans(id),
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  effort_perception INTEGER CHECK (effort_perception >= 1 AND effort_perception <= 10),
  joint_discomfort TEXT,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own logs
CREATE POLICY "Clients can insert their own exercise logs"
ON public.exercise_logs
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Clients can view their own logs
CREATE POLICY "Clients can view their own exercise logs"
ON public.exercise_logs
FOR SELECT
USING (auth.uid() = client_id);

-- Clients can update their own logs
CREATE POLICY "Clients can update their own exercise logs"
ON public.exercise_logs
FOR UPDATE
USING (auth.uid() = client_id);

-- Professionals can view client logs
CREATE POLICY "Professionals can view client exercise logs"
ON public.exercise_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'professional'
  )
);

-- Create index for better performance
CREATE INDEX idx_exercise_logs_client_id ON public.exercise_logs(client_id);
CREATE INDEX idx_exercise_logs_workout_plan_id ON public.exercise_logs(workout_plan_id);
CREATE INDEX idx_exercise_logs_logged_at ON public.exercise_logs(logged_at);