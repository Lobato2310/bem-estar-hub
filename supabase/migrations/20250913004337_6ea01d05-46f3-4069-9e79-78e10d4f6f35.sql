-- Enable RLS on assinaturas table
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assinaturas table
CREATE POLICY "Users can view their own subscription" 
ON public.assinaturas 
FOR SELECT 
USING (auth.uid() = id_usuario);

CREATE POLICY "Users can update their own subscription" 
ON public.assinaturas 
FOR UPDATE 
USING (auth.uid() = id_usuario);

CREATE POLICY "System can insert subscriptions" 
ON public.assinaturas 
FOR INSERT 
WITH CHECK (true);

-- Allow professionals to view all subscriptions for administration
CREATE POLICY "Professionals can view all subscriptions" 
ON public.assinaturas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_type = 'professional'
));

-- Allow professionals to update any subscription for administration
CREATE POLICY "Professionals can update any subscription" 
ON public.assinaturas 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_type = 'professional'
));