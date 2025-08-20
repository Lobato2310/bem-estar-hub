-- Criar perfil profissional para o usuário Lucas Silva
INSERT INTO public.profiles (user_id, display_name, email, user_type)
VALUES ('8742a473-8247-40fc-85c8-88342dac7190', 'Lucas Silva', 'lucaslobsouza.py@gmail.com', 'professional')
ON CONFLICT (user_id) DO UPDATE SET 
    user_type = 'professional',
    display_name = 'Lucas Silva',
    email = 'lucaslobsouza.py@gmail.com';