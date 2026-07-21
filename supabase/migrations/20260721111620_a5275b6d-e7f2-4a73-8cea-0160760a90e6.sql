CREATE POLICY "public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "authenticated upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "authenticated update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media');
CREATE POLICY "authenticated delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');