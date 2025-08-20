-- Criar política para permitir que profissionais vejam perfis de clientes
CREATE POLICY "Professionals can view client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  ) 
  AND user_type = 'client'
);