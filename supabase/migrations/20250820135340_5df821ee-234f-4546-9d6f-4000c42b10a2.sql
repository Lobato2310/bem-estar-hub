-- Criar tabela para anamnese dos clientes
CREATE TABLE public.client_anamnesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Dados pessoais básicos
  full_name TEXT,
  gender TEXT CHECK (gender IN ('feminino', 'masculino', 'outros')),
  whatsapp TEXT,
  birth_date DATE,
  height NUMERIC,
  weight NUMERIC,
  
  -- Atividade física (para personal)
  practices_physical_activity BOOLEAN,
  physical_activity_time TEXT,
  training_frequency_per_week INTEGER,
  training_duration_minutes INTEGER,
  fitness_objective TEXT,
  physical_restrictions TEXT,
  has_postural_deviation BOOLEAN,
  postural_deviation_description TEXT,
  
  -- Anamnese médica (para ambos)
  has_cardiac_problems BOOLEAN,
  has_high_blood_pressure BOOLEAN,
  has_high_cholesterol BOOLEAN,
  
  -- Anamnese nutricional (para nutricionista)
  daily_meals_description TEXT,
  meal_times_description TEXT,
  preferred_foods TEXT,
  food_restrictions TEXT,
  
  -- Metadados
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.client_anamnesis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Clients can view their own anamnesis" 
ON public.client_anamnesis 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own anamnesis" 
ON public.client_anamnesis 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own anamnesis" 
ON public.client_anamnesis 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Profissionais podem visualizar anamnese dos clientes
CREATE POLICY "Professionals can view client anamnesis" 
ON public.client_anamnesis 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_anamnesis_updated_at
BEFORE UPDATE ON public.client_anamnesis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();