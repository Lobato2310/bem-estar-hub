-- Drop the existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user_subscription();

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
        'mensal' -- Default plan
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Failed to create subscription record for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();