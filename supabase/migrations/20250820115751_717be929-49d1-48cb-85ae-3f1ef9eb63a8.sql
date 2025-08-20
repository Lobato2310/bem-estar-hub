-- Criar perfil de cliente para lucaslobsouza@gmail.com
INSERT INTO profiles (user_id, display_name, email, user_type, created_at, updated_at) 
VALUES (
  gen_random_uuid(), 
  'Lucas Cliente', 
  'lucaslobsouza@gmail.com', 
  'client', 
  now(), 
  now()
);