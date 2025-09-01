-- Corrigir as últimas duas funções sem search_path
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_professional()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  );
END;
$function$;