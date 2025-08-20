-- Fix infinite recursion in profiles RLS policies
-- The issue is that the professional policy is querying the profiles table within the profiles policy

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Professionals can view assigned client profiles" ON profiles;

-- Create a simpler, non-recursive policy for professionals to view client profiles
-- This policy uses the professional_has_client_access function which should handle the relationship check
CREATE POLICY "Professionals can view assigned client profiles" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (user_type = 'client' AND professional_has_client_access(auth.uid(), user_id))
);

-- Also ensure we have a basic policy for users to view their own profiles
-- (this should already exist but let's make sure)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);