-- Remover a política que pode causar recursão
DROP POLICY IF EXISTS "Professionals can view client profiles" ON public.profiles;

-- Criar função security definer para verificar se o usuário é profissional
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  );
$$;

-- Criar política correta usando a função
CREATE POLICY "Professionals can view client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (public.is_professional() AND user_type = 'client')
  OR 
  (auth.uid() = user_id)
);