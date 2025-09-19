-- Update the plano field to use specific plan names
ALTER TABLE public.assinaturas 
DROP CONSTRAINT IF EXISTS assinaturas_plano_check;

-- Add constraint for the new plan names
ALTER TABLE public.assinaturas 
ADD CONSTRAINT assinaturas_plano_check 
CHECK (plano IN ('plano Fusion', 'plano App completo', 'plano App Basic'));

-- Update existing records to use the new plan names (default to basic)
UPDATE public.assinaturas 
SET plano = 'plano App Basic' 
WHERE plano IS NULL OR plano NOT IN ('plano Fusion', 'plano App completo', 'plano App Basic');