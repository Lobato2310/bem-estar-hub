-- Adicionar colunas que estão faltando na tabela client_checkins
ALTER TABLE public.client_checkins 
ADD COLUMN checkin_type TEXT,
ADD COLUMN belly_circumference NUMERIC,
ADD COLUMN hip_circumference NUMERIC,
ADD COLUMN left_thigh NUMERIC,
ADD COLUMN right_thigh NUMERIC,
ADD COLUMN next_goal TEXT,
ADD COLUMN observations TEXT,
ADD COLUMN status TEXT DEFAULT 'completed';