-- Criar relacionamento entre o profissional e o cliente existente
INSERT INTO public.professional_client_relationships (professional_id, client_id, is_active)
VALUES ('126b1feb-15a8-4dbd-9dc7-fe7454307e46', '0afa065c-2221-4b38-a00e-f42d9d3c74f9', true)
ON CONFLICT DO NOTHING;

-- Atualizar política da anamnese para permitir profissionais visualizarem sem a função complexa
DROP POLICY IF EXISTS "Professionals can view assigned client anamnesis" ON public.client_anamnesis;

CREATE POLICY "Professionals can view client anamnesis" 
ON public.client_anamnesis 
FOR SELECT 
USING (
  auth.uid() = client_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  )
);