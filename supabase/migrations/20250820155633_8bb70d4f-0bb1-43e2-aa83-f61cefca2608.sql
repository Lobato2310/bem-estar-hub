-- Create storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-videos', 'exercise-videos', true);

-- Create policies for exercise video uploads
CREATE POLICY "Anyone can view exercise videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'exercise-videos');

CREATE POLICY "Professionals can upload exercise videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'exercise-videos' AND is_professional());

CREATE POLICY "Professionals can update exercise videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'exercise-videos' AND is_professional());

CREATE POLICY "Professionals can delete exercise videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'exercise-videos' AND is_professional());