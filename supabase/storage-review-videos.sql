-- ============================================
-- REVIEW VIDEOS STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- ============================================
-- Creates a public bucket for review video uploads (mp4, mov)
-- Max file size: 50MB

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-videos',
  'review-videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/quicktime']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Authenticated users can upload review videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload review videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-videos');

-- Public read for review videos
DROP POLICY IF EXISTS "Public read for review videos" ON storage.objects;
CREATE POLICY "Public read for review videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-videos');
