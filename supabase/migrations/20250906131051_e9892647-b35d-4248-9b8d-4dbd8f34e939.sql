-- Adicionar colunas de fotos na tabela client_checkins
ALTER TABLE public.client_checkins 
ADD COLUMN front_photo_url TEXT,
ADD COLUMN side_photo_url TEXT,
ADD COLUMN back_photo_url TEXT;

-- Criar bucket para fotos de check-in se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('checkin-photos', 'checkin-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para fotos de check-in
CREATE POLICY "Users can upload their own checkin photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own checkin photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own checkin photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'checkin-photos' AND auth.uid()::text = (storage.foldername(name))[1]);