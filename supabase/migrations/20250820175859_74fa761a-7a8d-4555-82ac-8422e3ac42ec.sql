-- Create professional-client relationships table
CREATE TABLE public.professional_client_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  client_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(professional_id, client_id)
);

-- Enable RLS on the relationships table
ALTER TABLE public.professional_client_relationships ENABLE ROW LEVEL SECURITY;

-- Policies for professional_client_relationships
CREATE POLICY "Professionals can view their own client relationships"
ON public.professional_client_relationships
FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can create client relationships"
ON public.professional_client_relationships
FOR INSERT
WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their client relationships"
ON public.professional_client_relationships
FOR UPDATE
USING (auth.uid() = professional_id);

-- Create a security definer function to check professional-client relationships
CREATE OR REPLACE FUNCTION public.professional_has_client_access(prof_id UUID, client_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.professional_client_relationships 
    WHERE professional_id = prof_id 
    AND client_id = client_user_id 
    AND is_active = true
  );
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Professionals can view client anamnesis" ON public.client_anamnesis;

-- Create new secure policy for client_anamnesis
CREATE POLICY "Professionals can view assigned client anamnesis"
ON public.client_anamnesis
FOR SELECT
USING (
  auth.uid() = client_id OR 
  (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND user_type = 'professional'
    ) AND 
    public.professional_has_client_access(auth.uid(), client_id)
  )
);

-- Also update the profiles policy to be more secure
DROP POLICY IF EXISTS "Professionals can view client profiles" ON public.profiles;

CREATE POLICY "Professionals can view assigned client profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR
  (
    user_type = 'client' AND
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.user_id = auth.uid() AND p2.user_type = 'professional'
    ) AND
    public.professional_has_client_access(auth.uid(), user_id)
  )
);

-- Populate relationships based on existing workout plans, nutrition plans, and psychology goals
INSERT INTO public.professional_client_relationships (professional_id, client_id)
SELECT DISTINCT professional_id, client_id 
FROM (
  SELECT professional_id, client_id FROM public.workout_plans
  UNION
  SELECT professional_id, client_id FROM public.nutrition_plans
  UNION
  SELECT professional_id, client_id FROM public.psychology_goals
) AS existing_relationships
ON CONFLICT (professional_id, client_id) DO NOTHING;