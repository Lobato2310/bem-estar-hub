-- Criar tabela taco para busca de alimentos
CREATE TABLE public.taco (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alimento TEXT NOT NULL,
  calorias FLOAT NOT NULL DEFAULT 0,
  proteina FLOAT NOT NULL DEFAULT 0,
  gorduras FLOAT NOT NULL DEFAULT 0,
  carboidrato FLOAT NOT NULL DEFAULT 0,
  fibras FLOAT NOT NULL DEFAULT 0,
  sodio FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.taco ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (busca de alimentos)
CREATE POLICY "Todos podem visualizar alimentos" 
ON public.taco 
FOR SELECT 
USING (true);

-- Criar política para profissionais gerenciarem alimentos
CREATE POLICY "Profissionais podem gerenciar alimentos" 
ON public.taco 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE users.id = auth.uid() 
  AND users.raw_user_meta_data ->> 'user_type' = 'professional'
));

-- Criar índices para melhorar performance das buscas
CREATE INDEX idx_taco_alimento ON public.taco USING gin(to_tsvector('portuguese', alimento));
CREATE INDEX idx_taco_alimento_text ON public.taco (alimento);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_taco_updated_at
BEFORE UPDATE ON public.taco
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();