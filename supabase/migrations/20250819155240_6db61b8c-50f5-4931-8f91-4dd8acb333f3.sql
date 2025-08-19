-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  user_type TEXT DEFAULT 'client' CHECK (user_type IN ('client', 'professional')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de planos de treino
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de planos nutricionais
CREATE TABLE public.nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meals JSONB,
  daily_calories INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de medições dos clientes
CREATE TABLE public.client_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  weight DECIMAL,
  height DECIMAL,
  body_fat DECIMAL,
  muscle_mass DECIMAL,
  waist DECIMAL,
  chest DECIMAL,
  arms DECIMAL,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de check-ins dos clientes
CREATE TABLE public.client_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de alimentação
CREATE TABLE public.client_food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  meal_name TEXT NOT NULL,
  foods JSONB NOT NULL,
  total_calories INTEGER,
  eaten_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de exercícios
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  muscle_groups TEXT[],
  description TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para workout_plans
CREATE POLICY "Clients can view their own workout plans" 
ON public.workout_plans 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their client workout plans" 
ON public.workout_plans 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create workout plans for clients" 
ON public.workout_plans 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their client workout plans" 
ON public.workout_plans 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Políticas para nutrition_plans
CREATE POLICY "Clients can view their own nutrition plans" 
ON public.nutrition_plans 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their client nutrition plans" 
ON public.nutrition_plans 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create nutrition plans for clients" 
ON public.nutrition_plans 
FOR INSERT 
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their client nutrition plans" 
ON public.nutrition_plans 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Políticas para client_measurements
CREATE POLICY "Clients can view their own measurements" 
ON public.client_measurements 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own measurements" 
ON public.client_measurements 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Políticas para client_checkins
CREATE POLICY "Clients can view their own checkins" 
ON public.client_checkins 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own checkins" 
ON public.client_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own checkins" 
ON public.client_checkins 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Políticas para client_food_logs
CREATE POLICY "Clients can view their own food logs" 
ON public.client_food_logs 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own food logs" 
ON public.client_food_logs 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own food logs" 
ON public.client_food_logs 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Políticas para exercises (tabela pública de leitura)
CREATE POLICY "Everyone can view exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

-- Adicionar triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
BEFORE UPDATE ON public.workout_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
BEFORE UPDATE ON public.nutrition_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();