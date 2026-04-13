-- ============================================
-- REVIEWS TABLE + RLS + AVERAGE RATING
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add user_name if missing (run if table already exists)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- 2. ROW LEVEL SECURITY
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Logged-in users can insert own review" ON reviews;
CREATE POLICY "Logged-in users can insert own review" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review" ON reviews;
CREATE POLICY "Users can update own review" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review" ON reviews;
CREATE POLICY "Users can delete own review" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- 3. AVERAGE RATING FUNCTION (call via supabase.rpc('get_reviews_summary'))
CREATE OR REPLACE FUNCTION get_reviews_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'avg_rating', COALESCE(ROUND(AVG(rating)::numeric, 2), 0),
    'total_reviews', COUNT(*)
  ) INTO result
  FROM reviews;
  RETURN result;
END;
$$;

-- Grant execute to anon and authenticated (for public read of summary)
GRANT EXECUTE ON FUNCTION get_reviews_summary() TO anon;
GRANT EXECUTE ON FUNCTION get_reviews_summary() TO authenticated;
