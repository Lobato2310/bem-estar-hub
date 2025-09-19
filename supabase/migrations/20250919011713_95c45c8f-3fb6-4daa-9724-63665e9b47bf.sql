-- Remove any existing constraints on plano column
ALTER TABLE public.assinaturas 
DROP CONSTRAINT IF EXISTS assinaturas_plano_check;

-- First update existing 'full' plans to the new format
UPDATE public.assinaturas 
SET plano = 'plano App completo' 
WHERE plano = 'full';

-- Update any NULL plans to basic
UPDATE public.assinaturas 
SET plano = 'plano App Basic' 
WHERE plano IS NULL;

-- Add the constraint for the new plan names
ALTER TABLE public.assinaturas 
ADD CONSTRAINT assinaturas_plano_check 
CHECK (plano IN ('plano Fusion', 'plano App completo', 'plano App Basic'));