-- Fix security issue: Restrict professionals to only view their assigned clients
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Professionals can view client profiles" ON public.profiles;

-- Create a new restrictive policy that only allows professionals to view profiles 
-- of clients they have an active relationship with through any service
CREATE POLICY "Professionals can view assigned client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  is_professional() 
  AND user_type = 'client'::user_type 
  AND (
    -- Professional has workout plans for this client
    EXISTS (
      SELECT 1 FROM public.workout_plans wp 
      WHERE wp.professional_id = auth.uid() AND wp.client_id = profiles.user_id
    )
    OR
    -- Professional has nutrition plans for this client
    EXISTS (
      SELECT 1 FROM public.nutrition_plans np 
      WHERE np.professional_id = auth.uid() AND np.client_id = profiles.user_id
    )
    OR
    -- Professional has psychology sessions for this client
    EXISTS (
      SELECT 1 FROM public.psychology_sessions ps 
      WHERE ps.professional_id = auth.uid() AND ps.client_id = profiles.user_id
    )
    OR
    -- Professional has created reports for this client
    EXISTS (
      SELECT 1 FROM public.client_reports cr 
      WHERE cr.professional_id = auth.uid() AND cr.client_id = profiles.user_id
    )
    OR
    -- Professional has created measurements for this client
    EXISTS (
      SELECT 1 FROM public.client_measurements cm 
      WHERE cm.measured_by = auth.uid() AND cm.client_id = profiles.user_id
    )
  )
);