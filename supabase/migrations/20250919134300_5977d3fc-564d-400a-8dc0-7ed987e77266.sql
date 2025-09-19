-- Add RLS policy to allow professionals to view client checkins
CREATE POLICY "Professionals can view client checkins" 
ON client_checkins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'professional'
  )
);