-- Drop the existing policy that requires professional_has_client_access function
DROP POLICY IF EXISTS "Professionals can view assigned client profiles" ON public.profiles;

-- Create a simpler policy that allows professionals to view all clients
CREATE POLICY "Professionals can view all client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR 
  (user_type = 'client' AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND user_type = 'professional'
  ))
);

-- Also ensure professionals can view all client profiles in queries
CREATE POLICY "Allow professionals to query client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND user_type = 'professional'
  )
);