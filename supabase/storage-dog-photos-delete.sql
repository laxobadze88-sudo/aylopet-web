-- ============================================
-- DOG PHOTOS: Allow users to delete own photos
-- Run in Supabase SQL Editor (if dog-photos bucket exists)
-- Path format: {user_id}/{dog_id}/{filename}
-- ============================================

DROP POLICY IF EXISTS "Users can delete own dog photos" ON storage.objects;
CREATE POLICY "Users can delete own dog photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'dog-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
