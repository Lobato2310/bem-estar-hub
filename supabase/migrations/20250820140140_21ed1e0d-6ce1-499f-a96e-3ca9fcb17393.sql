-- Adicionar constraint UNIQUE na coluna client_id da tabela client_anamnesis
-- Isso permite que cada cliente tenha apenas uma anamnese
ALTER TABLE public.client_anamnesis 
ADD CONSTRAINT client_anamnesis_client_id_unique UNIQUE (client_id);