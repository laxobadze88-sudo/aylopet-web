-- ============================================
-- Clear old 40% promo records for testing 20% Early Bird flow
-- Run in Supabase SQL Editor (uncomment ONE option)
-- ============================================

-- Option A: Delete ALL promo codes (clean slate for testing)
-- DELETE FROM promo_codes;

-- Option B: Delete only 40% codes (removes Ambassador/old test data; Early Bird 20% codes stay)
-- DELETE FROM promo_codes WHERE discount_percent = 40;

-- Option C: Delete promo for a SPECIFIC user by UUID
-- Get user_id from: Supabase Dashboard → Authentication → Users
-- DELETE FROM promo_codes WHERE user_id = 'YOUR-USER-UUID-HERE';

-- Option D: Delete promo for user by EMAIL
-- DELETE FROM promo_codes
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-test@email.com' LIMIT 1);

-- Option E: Downgrade your 40% code to 20% (for re-testing Early Bird flow without deleting)
-- UPDATE promo_codes SET code = 'BIRD_20', discount_percent = 20, user_tier = 'early_bird'
-- WHERE user_id = 'YOUR-USER-UUID-HERE' AND discount_percent = 40;
