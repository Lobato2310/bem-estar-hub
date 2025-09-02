-- Criar um teste de trigger para testar se os webhooks estão funcionando
-- Vamos criar uma tabela de logs de webhook para debug

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  method TEXT,
  url TEXT,
  headers JSONB,
  body JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  user_id UUID
);

-- RLS policy para webhook logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Permitir inserção pelo service role (webhook)
CREATE POLICY "webhook_can_insert_logs" 
ON public.webhook_logs 
FOR INSERT 
WITH CHECK (true);

-- Permitir visualização pelos administradores/profissionais
CREATE POLICY "admins_can_view_webhook_logs" 
ON public.webhook_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_type = 'professional'
));