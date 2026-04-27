-- zyng_referral_and_rls.sql
-- 1. Function to auto-generate referral code starting with 'Z' and unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    new_code := 'Z' || substr(md5(random()::text), 1, 7);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE referral_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger to set referral_code on insert if not provided
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_referral_code ON users;
CREATE TRIGGER trg_set_referral_code
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- 3. RLS: Enable and add read policies for all relevant tables
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Allow read for all (adjust as needed for production)
CREATE POLICY users_read_all ON users FOR SELECT USING (true);
CREATE POLICY schools_read_all ON schools FOR SELECT USING (true);
CREATE POLICY faculties_read_all ON faculties FOR SELECT USING (true);
CREATE POLICY departments_read_all ON departments FOR SELECT USING (true);
CREATE POLICY personas_read_all ON personas FOR SELECT USING (true);
CREATE POLICY posts_read_all ON posts FOR SELECT USING (true);
CREATE POLICY replies_read_all ON replies FOR SELECT USING (true);
CREATE POLICY reactions_read_all ON reactions FOR SELECT USING (true);
