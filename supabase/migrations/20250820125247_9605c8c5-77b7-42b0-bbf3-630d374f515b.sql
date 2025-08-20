-- Criar tabela para controlar atualizações do cliente
CREATE TABLE public.client_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  update_type TEXT NOT NULL, -- 'nutrition_plan', 'workout_plan', 'psychology_goal', etc.
  update_message TEXT,
  is_viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.client_updates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Clients can view their own updates"
ON public.client_updates
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can create client updates"
ON public.client_updates
FOR INSERT
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Clients can mark updates as viewed"
ON public.client_updates
FOR UPDATE
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Função para notificar cliente sobre atualizações
CREATE OR REPLACE FUNCTION notify_client_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação para o cliente
  INSERT INTO public.client_updates (client_id, professional_id, update_type, update_message)
  VALUES (
    NEW.client_id,
    NEW.professional_id,
    CASE 
      WHEN TG_TABLE_NAME = 'nutrition_plans' THEN 'nutrition_plan'
      WHEN TG_TABLE_NAME = 'workout_plans' THEN 'workout_plan'
      WHEN TG_TABLE_NAME = 'psychology_goals' THEN 'psychology_goal'
      ELSE 'general'
    END,
    CASE 
      WHEN TG_TABLE_NAME = 'nutrition_plans' THEN 'Seu plano nutricional foi atualizado pelo profissional'
      WHEN TG_TABLE_NAME = 'workout_plans' THEN 'Seu plano de treino foi atualizado pelo profissional'
      WHEN TG_TABLE_NAME = 'psychology_goals' THEN 'Suas metas psicológicas foram atualizadas pelo profissional'
      ELSE 'Seus dados foram atualizados pelo profissional'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para monitorar atualizações
CREATE TRIGGER trigger_nutrition_plan_update
  AFTER INSERT OR UPDATE ON public.nutrition_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_update();

CREATE TRIGGER trigger_workout_plan_update
  AFTER INSERT OR UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_update();

CREATE TRIGGER trigger_psychology_goal_update
  AFTER INSERT OR UPDATE ON public.psychology_goals
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_update();

-- Função para trigger de updated_at
CREATE TRIGGER update_client_updates_updated_at
  BEFORE UPDATE ON public.client_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();