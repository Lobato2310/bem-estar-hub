-- Function to safely check if current user is professional (avoid self-reference recursion)
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.user_type = 'professional'
  );
$$;

-- Allow professionals to view client profiles only
DROP POLICY IF EXISTS "Professionals can view client profiles" ON public.profiles;
CREATE POLICY "Professionals can view client profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_professional() AND user_type = 'client'
);
