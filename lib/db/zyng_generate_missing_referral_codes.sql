-- zyng_generate_missing_referral_codes.sql
-- This script will generate a referral code for all users who do not have one yet.

UPDATE users
SET referral_code = 'Z' || substr(md5(random()::text), 1, 7)
WHERE referral_code IS NULL OR referral_code = '';

-- If you want to ensure uniqueness, you can run this multiple times or use a DO block for more safety.
-- For most cases, the above is sufficient if your user count is not huge and the code is short.
