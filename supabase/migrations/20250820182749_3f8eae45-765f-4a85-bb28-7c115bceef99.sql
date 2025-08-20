-- Remove all existing policies on profiles table
DROP POLICY IF EXISTS "Allow professionals to query client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view all client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create clean, non-recursive policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Simple policy for professionals to view client profiles
CREATE POLICY "Professionals can view client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_type = 'client' 
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'professional'
  )
);