-- Permitir leitura pública nas tabelas de alimentos
-- Tabela TACO
CREATE POLICY "Allow public read access to taco" 
ON public.taco 
FOR SELECT 
USING (true);

-- Tabela OPEN  
CREATE POLICY "Allow public read access to open" 
ON public.open 
FOR SELECT 
USING (true);