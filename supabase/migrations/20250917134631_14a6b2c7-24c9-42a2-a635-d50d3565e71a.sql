-- Atualizar a função para usar plano válido
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only create subscription record for clients, not professionals
  -- Use TRY/CATCH equivalent in PostgreSQL
  BEGIN
    IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'client') = 'client' THEN
      INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
      VALUES (
        NEW.id,
        NEW.email,
        false, -- Start with inactive subscription
        'full' -- Use valid plan value
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Failed to create subscription record for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;