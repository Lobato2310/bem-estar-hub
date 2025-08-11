-- Create table for client check-ins
CREATE TABLE public.client_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  checkin_date DATE NOT NULL,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('monthly', 'biweekly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'reviewed')),
  
  -- Photo uploads
  front_photo_url TEXT,
  side_photo_url TEXT,
  back_photo_url TEXT,
  
  -- Body measurements
  belly_circumference NUMERIC,
  hip_circumference NUMERIC,
  left_thigh NUMERIC,
  right_thigh NUMERIC,
  
  -- Goal for next period
  next_goal TEXT CHECK (next_goal IN ('mass_gain', 'fat_loss', 'maintenance')),
  
  -- Observations
  observations TEXT,
  
  -- Nutritionist feedback
  nutritionist_feedback TEXT,
  feedback_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clients can view their own check-ins" 
ON public.client_checkins 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own check-ins" 
ON public.client_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own check-ins" 
ON public.client_checkins 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view all client check-ins" 
ON public.client_checkins 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'professional'
));

CREATE POLICY "Professionals can update check-ins (feedback)" 
ON public.client_checkins 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'professional'
));

-- Add trigger for timestamps
CREATE TRIGGER update_client_checkins_updated_at
BEFORE UPDATE ON public.client_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();