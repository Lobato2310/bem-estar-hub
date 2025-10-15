-- Criar assinaturas para usuários clientes que não têm (com plano correto)
INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
SELECT 
  au.id,
  au.email,
  false,
  'plano App completo'
FROM auth.users au
LEFT JOIN public.assinaturas a ON au.id = a.id_usuario
WHERE a.id IS NULL
AND COALESCE(au.raw_user_meta_data->>'user_type', 'client') = 'client'
ON CONFLICT (id_usuario) DO NOTHING;