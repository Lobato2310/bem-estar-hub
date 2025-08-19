-- Update exercises table to allow professional management
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Allow professionals to insert and update exercises
DROP POLICY IF EXISTS "Everyone can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Professionals can manage exercises" ON public.exercises;

-- Create new policies for exercise management
CREATE POLICY "Everyone can view exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

CREATE POLICY "Professionals can insert exercises" 
ON public.exercises 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  )
);

CREATE POLICY "Professionals can update exercises" 
ON public.exercises 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  )
);

CREATE POLICY "Professionals can delete exercises" 
ON public.exercises 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'professional'
  )
);