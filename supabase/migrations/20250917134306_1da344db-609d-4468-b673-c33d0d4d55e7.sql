-- Criar trigger para adicionar automaticamente novos usuários clientes na tabela assinaturas
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();