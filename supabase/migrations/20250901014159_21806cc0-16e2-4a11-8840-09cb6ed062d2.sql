-- Corrigir search_path das funções para segurança
DROP FUNCTION IF EXISTS public.notify_client_update() CASCADE;
DROP FUNCTION IF EXISTS public.professional_has_client_access(uuid, uuid) CASCADE;

-- Recriar função notify_client_update com search_path seguro
CREATE OR REPLACE FUNCTION public.notify_client_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Recriar função professional_has_client_access com search_path seguro
CREATE OR REPLACE FUNCTION public.professional_has_client_access(prof_id uuid, client_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.professional_client_relationships 
    WHERE professional_id = prof_id 
    AND client_id = client_user_id 
    AND is_active = true
  );
$function$;