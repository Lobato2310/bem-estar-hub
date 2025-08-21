-- Criar tabela para controlar assinaturas dos usuários
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  assinatura_ativa BOOLEAN NOT NULL DEFAULT false,
  plano TEXT, -- 'mensal', 'anual', etc
  data_inicio DATE,
  data_expiracao DATE,
  mercado_pago_payment_id TEXT,
  mercado_pago_status TEXT,
  valor_pago DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas sua própria assinatura
CREATE POLICY "users_can_view_own_subscription" ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para inserção (será usada pelo webhook)
CREATE POLICY "webhook_can_insert_subscription" ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Política para atualização (será usada pelo webhook)
CREATE POLICY "webhook_can_update_subscription" ON public.user_subscriptions
  FOR UPDATE
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para teste
INSERT INTO public.user_subscriptions (user_id, email, assinatura_ativa, plano, data_inicio, data_expiracao)
SELECT 
  u.id, 
  u.email,
  false,
  'mensal',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days'
FROM auth.users u
WHERE u.id IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;