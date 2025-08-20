-- Criar um usuário profissional para teste
-- Vamos usar o primeiro usuário da lista e torná-lo profissional
UPDATE profiles 
SET user_type = 'professional', 
    display_name = 'Dr. Profissional',
    updated_at = now()
WHERE user_id = '5c9c7ea7-b8ad-4d5e-8fe3-9f3813d1f514';