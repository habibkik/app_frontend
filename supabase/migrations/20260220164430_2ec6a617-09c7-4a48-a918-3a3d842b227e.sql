
-- Create storage bucket for publisher media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('publisher-media', 'publisher-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Users can upload publisher media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'publisher-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read
CREATE POLICY "Publisher media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'publisher-media');

-- Allow users to delete their own media
CREATE POLICY "Users can delete own publisher media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'publisher-media' AND auth.uid()::text = (storage.foldername(name))[1]);
