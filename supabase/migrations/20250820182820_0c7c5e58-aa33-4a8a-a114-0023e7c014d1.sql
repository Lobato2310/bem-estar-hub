-- Remove the problematic policy
DROP POLICY IF EXISTS "Professionals can view client profiles" ON public.profiles;

-- Create a security definer function to check if user is professional
CREATE OR REPLACE FUNCTION public.is_current_user_professional()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create a simple, non-recursive policy for professionals
CREATE POLICY "Professionals can view client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'client' 
  AND public.is_current_user_professional()
);