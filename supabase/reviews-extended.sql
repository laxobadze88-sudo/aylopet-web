-- ============================================
-- REVIEWS EXTENDED: video_url + review_comments
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add video_url to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. REVIEW_COMMENTS TABLE (replies to reviews)
CREATE TABLE IF NOT EXISTS review_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created_at ON review_comments(created_at);

ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view review comments" ON review_comments;
CREATE POLICY "Anyone can view review comments" ON review_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Logged-in users can insert own comment" ON review_comments;
CREATE POLICY "Logged-in users can insert own comment" ON review_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
