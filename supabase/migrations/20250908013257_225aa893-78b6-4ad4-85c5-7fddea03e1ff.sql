-- Inserir dados fictícios de evolução de medidas corporais para teste
-- Primeiro, vamos pegar um cliente existente para usar como exemplo
-- Se não houver clientes, vamos usar um ID fictício

-- Dados de evolução para os últimos 6 meses (simulando progresso realista)
INSERT INTO public.client_measurements (
  client_id, 
  weight, 
  body_fat, 
  muscle_mass, 
  height, 
  waist, 
  chest, 
  arms, 
  measured_at
) VALUES 
-- Mês 1 (Janeiro 2024) - Medidas iniciais
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  85.5, 
  22.3, 
  65.2, 
  175.0, 
  92.0, 
  98.0, 
  35.0, 
  '2024-01-15 10:00:00'
),

-- Mês 2 (Fevereiro 2024) - Pequena melhora
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  84.8, 
  21.8, 
  65.8, 
  175.0, 
  90.5, 
  98.5, 
  35.2, 
  '2024-02-15 10:00:00'
),

-- Mês 3 (Março 2024) - Progresso consistente
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  83.9, 
  20.9, 
  66.8, 
  175.0, 
  89.0, 
  99.2, 
  35.8, 
  '2024-03-15 10:00:00'
),

-- Mês 4 (Abril 2024) - Platô temporário
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  83.7, 
  20.7, 
  67.1, 
  175.0, 
  88.8, 
  99.5, 
  36.0, 
  '2024-04-15 10:00:00'
),

-- Mês 5 (Maio 2024) - Nova queda de peso
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  82.4, 
  19.8, 
  67.9, 
  175.0, 
  87.2, 
  100.1, 
  36.5, 
  '2024-05-15 10:00:00'
),

-- Mês 6 (Junho 2024) - Resultado final
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  81.2, 
  18.9, 
  68.7, 
  175.0, 
  85.8, 
  100.8, 
  37.0, 
  '2024-06-15 10:00:00'
),

-- Dados mais recentes (Julho-Setembro 2024)
(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  80.8, 
  18.4, 
  69.2, 
  175.0, 
  85.0, 
  101.2, 
  37.2, 
  '2024-07-15 10:00:00'
),

(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  80.1, 
  17.8, 
  69.8, 
  175.0, 
  84.2, 
  101.8, 
  37.5, 
  '2024-08-15 10:00:00'
),

(
  (SELECT user_id FROM public.profiles WHERE user_type = 'client' LIMIT 1),
  79.5, 
  17.2, 
  70.3, 
  175.0, 
  83.5, 
  102.2, 
  37.8, 
  '2024-09-15 10:00:00'
);

-- Comentário sobre os dados inseridos:
-- Esta evolução simula um progresso realista de:
-- - Perda de peso: 85.5kg → 79.5kg (-6kg em 8 meses)
-- - Redução de gordura corporal: 22.3% → 17.2% (-5.1%)
-- - Ganho de massa muscular: 65.2kg → 70.3kg (+5.1kg)
-- - Redução da cintura: 92cm → 83.5cm (-8.5cm)
-- - Ganho de massa no peito e braços