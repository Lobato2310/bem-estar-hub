-- Criar tabela para feedback de treino se não existir
CREATE TABLE IF NOT EXISTS public.workout_feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    intensity_level INTEGER NOT NULL CHECK (intensity_level >= 1 AND intensity_level <= 10),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    workout_duration_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS na tabela workout_feedback se não estiver ativa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'workout_feedback'
    ) THEN
        ALTER TABLE public.workout_feedback ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas para workout_feedback
        CREATE POLICY "Users can insert their own workout feedback"
        ON public.workout_feedback
        FOR INSERT
        WITH CHECK (auth.uid() = client_id);

        CREATE POLICY "Users can view their own workout feedback"
        ON public.workout_feedback
        FOR SELECT
        USING (auth.uid() = client_id);

        CREATE POLICY "Users can update their own workout feedback"
        ON public.workout_feedback
        FOR UPDATE
        USING (auth.uid() = client_id);
    END IF;
END
$$;

-- Criar trigger para updated_at na tabela workout_feedback se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_workout_feedback_updated_at'
    ) THEN
        CREATE TRIGGER update_workout_feedback_updated_at
            BEFORE UPDATE ON public.workout_feedback
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;