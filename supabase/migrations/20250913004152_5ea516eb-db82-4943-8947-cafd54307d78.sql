-- Create function to handle new user registration and add to assinaturas table
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create subscription record for clients, not professionals
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'client') = 'client' THEN
    INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
    VALUES (
      NEW.id,
      NEW.email,
      false, -- Start with inactive subscription
      'mensal' -- Default plan
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically add users to assinaturas table
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();