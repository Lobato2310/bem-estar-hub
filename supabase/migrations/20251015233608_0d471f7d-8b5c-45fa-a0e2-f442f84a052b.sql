-- Atualizar função para usar valor correto do plano
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create subscription record for clients, not professionals
  BEGIN
    IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'client') = 'client' THEN
      INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
      VALUES (
        NEW.id,
        NEW.email,
        false,
        'plano App completo'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create subscription record for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;