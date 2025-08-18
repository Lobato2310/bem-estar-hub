-- Fix infinite recursion in profiles RLS policies

-- First, create a security definer function to check if user is professional
CREATE OR REPLACE FUNCTION public.is_user_professional()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.user_type = 'professional'
  );
$$;

-- Drop the existing policy that causes recursion
DROP POLICY IF EXISTS "Professionals can view assigned client profiles" ON public.profiles;

-- Recreate the policy using the security definer function
CREATE POLICY "Professionals can view assigned client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  public.is_user_professional() 
  AND user_type = 'client'::user_type 
  AND (
    (EXISTS ( SELECT 1
     FROM workout_plans wp
    WHERE ((wp.professional_id = auth.uid()) AND (wp.client_id = profiles.user_id)))) 
    OR (EXISTS ( SELECT 1
     FROM nutrition_plans np
    WHERE ((np.professional_id = auth.uid()) AND (np.client_id = profiles.user_id)))) 
    OR (EXISTS ( SELECT 1
     FROM psychology_sessions ps
    WHERE ((ps.professional_id = auth.uid()) AND (ps.client_id = profiles.user_id)))) 
    OR (EXISTS ( SELECT 1
     FROM client_reports cr
    WHERE ((cr.professional_id = auth.uid()) AND (cr.client_id = profiles.user_id)))) 
    OR (EXISTS ( SELECT 1
     FROM client_measurements cm
    WHERE ((cm.measured_by = auth.uid()) AND (cm.client_id = profiles.user_id))))
  )
);