-- Create tables for professional management system

-- Table for workout plans
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  sets TEXT NOT NULL, -- format like "4x12"
  video_url TEXT,
  video_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for nutrition plans
CREATE TABLE public.nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, lunch, snack, dinner
  meal_time TIME,
  meal_description TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for market products
CREATE TABLE public.market_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for psychology sessions
CREATE TABLE public.psychology_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  session_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for psychology goals
CREATE TABLE public.psychology_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  goal_text TEXT NOT NULL,
  goal_period TEXT DEFAULT 'quinzenal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for motivational phrases
CREATE TABLE public.motivational_phrases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  phrase TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for client reports
CREATE TABLE public.client_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  report_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for client measurements
CREATE TABLE public.client_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hip DECIMAL(5,2),
  arm DECIMAL(5,2),
  thigh DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  measured_by UUID, -- professional who took measurements
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivational_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_plans
CREATE POLICY "Professionals can manage workout plans" ON public.workout_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their workout plans" ON public.workout_plans
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for nutrition_plans
CREATE POLICY "Professionals can manage nutrition plans" ON public.nutrition_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their nutrition plans" ON public.nutrition_plans
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for market_products
CREATE POLICY "Professionals can manage market products" ON public.market_products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Everyone can view market products" ON public.market_products
FOR SELECT USING (true);

-- RLS Policies for psychology_sessions
CREATE POLICY "Professionals can manage psychology sessions" ON public.psychology_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their psychology sessions" ON public.psychology_sessions
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for psychology_goals
CREATE POLICY "Professionals can manage psychology goals" ON public.psychology_goals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their psychology goals" ON public.psychology_goals
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for motivational_phrases
CREATE POLICY "Professionals can manage motivational phrases" ON public.motivational_phrases
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their motivational phrases" ON public.motivational_phrases
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for client_reports
CREATE POLICY "Professionals can manage client reports" ON public.client_reports
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their reports" ON public.client_reports
FOR SELECT USING (auth.uid() = client_id);

-- RLS Policies for client_measurements
CREATE POLICY "Professionals can manage client measurements" ON public.client_measurements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view their measurements" ON public.client_measurements
FOR SELECT USING (auth.uid() = client_id);

-- Add triggers for updated_at
CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON public.workout_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
BEFORE UPDATE ON public.nutrition_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_products_updated_at
BEFORE UPDATE ON public.market_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_psychology_sessions_updated_at
BEFORE UPDATE ON public.psychology_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_psychology_goals_updated_at
BEFORE UPDATE ON public.psychology_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_motivational_phrases_updated_at
BEFORE UPDATE ON public.motivational_phrases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_reports_updated_at
BEFORE UPDATE ON public.client_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_measurements_updated_at
BEFORE UPDATE ON public.client_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-videos', 'exercise-videos', false);

-- Create RLS policies for exercise videos
CREATE POLICY "Professionals can upload exercise videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'exercise-videos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Professionals can view exercise videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'exercise-videos' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);

CREATE POLICY "Clients can view exercise videos assigned to them" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'exercise-videos');