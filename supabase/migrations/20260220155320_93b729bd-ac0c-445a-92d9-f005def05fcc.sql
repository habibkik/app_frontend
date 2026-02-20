-- Create storage bucket for published landing pages
INSERT INTO storage.buckets (id, name, public) VALUES ('landing-pages', 'landing-pages', true);

-- Allow anyone to view published landing pages
CREATE POLICY "Public read access for landing pages"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-pages');

-- Allow authenticated users to upload landing pages
CREATE POLICY "Authenticated users can upload landing pages"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'landing-pages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own landing pages
CREATE POLICY "Users can update their own landing pages"
ON storage.objects FOR UPDATE
USING (bucket_id = 'landing-pages' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own landing pages
CREATE POLICY "Users can delete their own landing pages"
ON storage.objects FOR DELETE
USING (bucket_id = 'landing-pages' AND auth.uid()::text = (storage.foldername(name))[1]);
