-- Inserir clientes existentes que não estão na tabela assinaturas
INSERT INTO public.assinaturas (id_usuario, email, assinatura_ativa, plano)
SELECT 
  p.user_id,
  p.email,
  false,
  'full'
FROM public.profiles p
WHERE p.user_type = 'client' 
AND p.user_id NOT IN (SELECT id_usuario FROM public.assinaturas WHERE id_usuario IS NOT NULL);