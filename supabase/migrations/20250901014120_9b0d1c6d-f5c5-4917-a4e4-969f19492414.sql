-- Adicionar campos para melhor organização dos planos de treino por dias
ALTER TABLE workout_plans 
ADD COLUMN training_day VARCHAR(1) CHECK (training_day IN ('A', 'B', 'C', 'D', 'E')),
ADD COLUMN plan_group_id UUID,
ADD COLUMN days_per_week INTEGER CHECK (days_per_week BETWEEN 2 AND 5);

-- Criar índice para melhor performance nas consultas agrupadas
CREATE INDEX idx_workout_plans_group ON workout_plans(plan_group_id, training_day);

-- Comentários para documentar a estrutura
COMMENT ON COLUMN workout_plans.training_day IS 'Dia do treino: A, B, C, D ou E';
COMMENT ON COLUMN workout_plans.plan_group_id IS 'ID do grupo de planos (para agrupar A, B, C, etc.)';
COMMENT ON COLUMN workout_plans.days_per_week IS 'Número total de dias de treino por semana para este grupo';