-- Create table for workout plan scheduling
CREATE TABLE public.workout_schedules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    workout_plan_id UUID NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'scheduled'::text,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, scheduled_date)
);

-- Enable RLS
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;

-- Clients can view their own scheduled workouts
CREATE POLICY "Clients can view their own scheduled workouts" 
ON public.workout_schedules 
FOR SELECT 
USING (auth.uid() = client_id);

-- Professionals can create workout schedules for clients
CREATE POLICY "Professionals can create workout schedules" 
ON public.workout_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

-- Professionals can update their client workout schedules
CREATE POLICY "Professionals can update workout schedules" 
ON public.workout_schedules 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Professionals can view their client workout schedules
CREATE POLICY "Professionals can view their client workout schedules" 
ON public.workout_schedules 
FOR SELECT 
USING (auth.uid() = professional_id);

-- Professionals can delete workout schedules
CREATE POLICY "Professionals can delete workout schedules" 
ON public.workout_schedules 
FOR DELETE 
USING (auth.uid() = professional_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_workout_schedules_updated_at
BEFORE UPDATE ON public.workout_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();