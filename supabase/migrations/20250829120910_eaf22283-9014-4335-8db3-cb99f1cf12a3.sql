-- Ativar assinatura para a usuária específica
UPDATE user_subscriptions 
SET 
  assinatura_ativa = true,
  plano = 'mensal',
  data_inicio = CURRENT_DATE,
  data_expiracao = CURRENT_DATE + INTERVAL '1 month',
  mercado_pago_status = 'approved',
  valor_pago = 29.90,
  updated_at = now()
WHERE email = '1976alessandralobato@gmail.com' 
  AND user_id = 'f0fa81bd-4f60-4600-9ffc-bab96b5eef0d';