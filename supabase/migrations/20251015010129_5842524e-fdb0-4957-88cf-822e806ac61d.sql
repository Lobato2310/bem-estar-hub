-- Primeiro, garantir que o trigger existe para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_subscription_created ON auth.users;

CREATE TRIGGER on_auth_user_subscription_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Adicionar constraint única se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assinaturas_id_usuario_unique'
  ) THEN
    ALTER TABLE public.assinaturas ADD CONSTRAINT assinaturas_id_usuario_unique UNIQUE (id_usuario);
  END IF;
END $$;

-- Agora, adicionar registros de assinatura para usuários clientes que não têm
-- Usando o valor correto de plano
INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
SELECT 
  p.user_id,
  p.email,
  false,
  'plano App completo'
FROM public.profiles p
LEFT JOIN public.assinaturas a ON p.user_id = a.id_usuario
WHERE 
  p.user_type = 'client' 
  AND a.id_usuario IS NULL
ON CONFLICT (id_usuario) DO NOTHING;