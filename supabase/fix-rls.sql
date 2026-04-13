-- ============================================
-- RLS Fix / Debug Script
-- Run in Supabase SQL Editor if inserts are failing
-- ============================================

-- 1. Ensure policies exist (re-create if needed)
DROP POLICY IF EXISTS "Users can insert weight history for own dogs" ON weight_history;
CREATE POLICY "Users can insert weight history for own dogs" ON weight_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM dogs WHERE dogs.id = weight_history.dog_id AND dogs.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert medical records for own dogs" ON medical_records;
CREATE POLICY "Users can insert medical records for own dogs" ON medical_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM dogs WHERE dogs.id = medical_records.dog_id AND dogs.owner_id = auth.uid())
  );

-- 2. Grant usage (authenticated users = logged-in via Supabase Auth)
GRANT ALL ON weight_history TO authenticated;
GRANT ALL ON medical_records TO authenticated;

-- 3. Verify: Run this to check your dogs (replace YOUR_USER_ID with auth.uid() from browser console)
-- SELECT id, name, owner_id FROM dogs WHERE owner_id = auth.uid();
