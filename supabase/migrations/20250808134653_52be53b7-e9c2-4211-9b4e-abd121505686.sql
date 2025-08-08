-- Create table for workout sessions (client training logs)
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  workout_plan_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for exercise logs within workout sessions
CREATE TABLE public.exercise_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets_completed INTEGER,
  weight_used NUMERIC,
  reps_completed INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for client goals and profile configuration
CREATE TABLE public.client_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'endurance', etc.
  target_value NUMERIC,
  current_value NUMERIC,
  target_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_sessions
CREATE POLICY "Clients can view their own workout sessions" 
ON public.workout_sessions 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own workout sessions" 
ON public.workout_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own workout sessions" 
ON public.workout_sessions 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view client workout sessions" 
ON public.workout_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'professional'::user_type
));

-- RLS policies for exercise_logs
CREATE POLICY "Clients can view their own exercise logs" 
ON public.exercise_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = exercise_logs.workout_session_id 
  AND workout_sessions.client_id = auth.uid()
));

CREATE POLICY "Clients can create their own exercise logs" 
ON public.exercise_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = exercise_logs.workout_session_id 
  AND workout_sessions.client_id = auth.uid()
));

CREATE POLICY "Clients can update their own exercise logs" 
ON public.exercise_logs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = exercise_logs.workout_session_id 
  AND workout_sessions.client_id = auth.uid()
));

CREATE POLICY "Professionals can view client exercise logs" 
ON public.exercise_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workout_sessions ws
  JOIN profiles p ON p.user_id = auth.uid()
  WHERE ws.id = exercise_logs.workout_session_id 
  AND p.user_type = 'professional'::user_type
));

-- RLS policies for client_goals
CREATE POLICY "Clients can view their own goals" 
ON public.client_goals 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own goals" 
ON public.client_goals 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own goals" 
ON public.client_goals 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view client goals" 
ON public.client_goals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'professional'::user_type
));

CREATE POLICY "Professionals can manage client goals" 
ON public.client_goals 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'professional'::user_type
));

-- Add triggers for updated_at
CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercise_logs_updated_at
  BEFORE UPDATE ON public.exercise_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();