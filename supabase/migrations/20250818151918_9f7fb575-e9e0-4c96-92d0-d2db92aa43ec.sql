-- Create TACO (Tabela Brasileira de Composição de Alimentos) table
CREATE TABLE public.taco_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo INTEGER,
  alimento TEXT NOT NULL,
  energia_kcal NUMERIC,
  proteina_g NUMERIC,
  lipideos_g NUMERIC,
  carboidrato_g NUMERIC,
  fibra_g NUMERIC,
  calcio_mg NUMERIC,
  magnesio_mg NUMERIC,
  manganes_mg NUMERIC,
  fosforo_mg NUMERIC,
  ferro_mg NUMERIC,
  sodio_mg NUMERIC,
  potassio_mg NUMERIC,
  cobre_mg NUMERIC,
  zinco_mg NUMERIC,
  retinol_mcg NUMERIC,
  tiamina_mg NUMERIC,
  riboflavina_mg NUMERIC,
  niacina_mg NUMERIC,
  vitamina_c_mg NUMERIC,
  porcao_g NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OpenFoodFacts table
CREATE TABLE public.open_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT,
  product_name TEXT NOT NULL,
  brands TEXT,
  categories TEXT,
  energy_kcal_100g NUMERIC,
  proteins_100g NUMERIC,
  carbohydrates_100g NUMERIC,
  sugars_100g NUMERIC,
  fat_100g NUMERIC,
  saturated_fat_100g NUMERIC,
  fiber_100g NUMERIC,
  sodium_100g NUMERIC,
  salt_100g NUMERIC,
  porcao_g NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.taco_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_foods ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Everyone can view TACO foods" 
ON public.taco_foods 
FOR SELECT 
USING (true);

CREATE POLICY "Everyone can view Open foods" 
ON public.open_foods 
FOR SELECT 
USING (true);

-- Create policies for professionals to manage foods
CREATE POLICY "Professionals can manage TACO foods" 
ON public.taco_foods 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'professional'::user_type
));

CREATE POLICY "Professionals can manage Open foods" 
ON public.open_foods 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'professional'::user_type
));

-- Create indexes for better search performance
CREATE INDEX idx_taco_foods_alimento ON public.taco_foods USING gin(to_tsvector('portuguese', alimento));
CREATE INDEX idx_open_foods_product_name ON public.open_foods USING gin(to_tsvector('portuguese', product_name));

-- Insert some sample TACO data
INSERT INTO public.taco_foods (codigo, alimento, energia_kcal, proteina_g, lipideos_g, carboidrato_g, fibra_g, porcao_g) VALUES
(1, 'Requeijão cremoso', 264, 11.6, 22.8, 3.0, 0, 100),
(2, 'Pão francês', 300, 8.9, 3.1, 58.6, 2.3, 50),
(3, 'Café, infusão', 2, 0.1, 0, 0.3, 0, 240),
(4, 'Açúcar cristal', 387, 0, 0, 99.9, 0, 10),
(5, 'Leite de vaca, integral', 61, 2.9, 3.2, 4.3, 0, 240),
(6, 'Ovo de galinha, inteiro, cru', 143, 13.0, 8.9, 1.6, 0, 60),
(7, 'Arroz, tipo 1, cozido', 128, 2.5, 0.2, 28.1, 1.6, 100),
(8, 'Feijão, carioca, cozido', 76, 4.8, 0.5, 13.6, 8.5, 100),
(9, 'Banana, nanica', 92, 1.3, 0.1, 23.0, 2.0, 100),
(10, 'Frango, peito, sem pele, cru', 163, 30.3, 3.6, 0, 0, 100);

-- Insert some sample Open Foods data
INSERT INTO public.open_foods (barcode, product_name, brands, energy_kcal_100g, proteins_100g, carbohydrates_100g, fat_100g, fiber_100g, porcao_g) VALUES
('7891000100103', 'Leite Condensado Moça', 'Nestlé', 321, 7.5, 54.4, 8.5, 0, 20),
('7891000053706', 'Nescau', 'Nestlé', 380, 4.0, 75.8, 3.5, 7.0, 20),
('7622210979804', 'KitKat', 'Nestlé', 518, 7.3, 59.5, 27.0, 2.8, 45),
('7891000244807', 'Iogurte Natural Nestlé', 'Nestlé', 51, 4.1, 4.3, 1.6, 0, 170),
('7891118013593', 'Pão de Açúcar Integral', 'Pão de Açúcar', 265, 13.0, 43.0, 4.5, 7.0, 50);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_taco_foods_updated_at
  BEFORE UPDATE ON public.taco_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_open_foods_updated_at
  BEFORE UPDATE ON public.open_foods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();