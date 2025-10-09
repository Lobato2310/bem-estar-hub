-- Adicionar coluna access_granted na tabela profiles para controle de acesso de clientes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_granted BOOLEAN NOT NULL DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.access_granted IS 'Indica se o cliente teve seu acesso ao aplicativo liberado pela administração';

-- Por padrão, profissionais têm acesso liberado automaticamente
UPDATE public.profiles 
SET access_granted = true 
WHERE user_type = 'professional';