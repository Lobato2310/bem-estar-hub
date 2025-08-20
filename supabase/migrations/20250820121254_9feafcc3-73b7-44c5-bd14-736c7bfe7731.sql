-- Criar perfil de cliente para testar funcionalidades profissionais
INSERT INTO profiles (user_id, display_name, email, user_type, created_at, updated_at) 
VALUES (
  gen_random_uuid(), 
  'Cliente Teste', 
  'cliente.teste@gmail.com', 
  'client', 
  now(), 
  now()
);