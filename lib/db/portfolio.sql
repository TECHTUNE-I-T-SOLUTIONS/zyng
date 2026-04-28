-- Portfolio table and notifications migration

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  skills TEXT[],
  entries JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION fn_portfolios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_portfolios_updated_at ON portfolios;
CREATE TRIGGER tr_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION fn_portfolios_updated_at();

-- Notification function on create/update
CREATE OR REPLACE FUNCTION fn_notify_portfolio_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (NEW.user_id, 'portfolio_created', 'Portfolio Created', 'Your professional portfolio has been created.', '/z-pro/portfolio/' || NEW.id);

    INSERT INTO admin_notifications (target_level, type, title, message)
    VALUES ('moderator', 'portfolio_created', 'Portfolio Created', 'User ' || COALESCE(NEW.user_id::text, '') || ' created their portfolio.');

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (NEW.user_id, 'portfolio_updated', 'Portfolio Updated', 'Your professional portfolio was updated.', '/z-pro/portfolio/' || NEW.id);

    INSERT INTO admin_notifications (target_level, type, title, message)
    VALUES ('moderator', 'portfolio_updated', 'Portfolio Updated', 'User ' || COALESCE(NEW.user_id::text, '') || ' updated their portfolio.');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure triggers do not already exist
DROP TRIGGER IF EXISTS tr_on_portfolios_change ON portfolios;
CREATE TRIGGER tr_on_portfolios_change AFTER INSERT OR UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION fn_notify_portfolio_change();

-- RLS policies: owners only
ALTER TABLE IF EXISTS portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS portfolios_select_owner ON portfolios;
CREATE POLICY portfolios_select_owner ON portfolios FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS portfolios_insert_owner ON portfolios;
CREATE POLICY portfolios_insert_owner ON portfolios FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS portfolios_update_owner ON portfolios;
CREATE POLICY portfolios_update_owner ON portfolios FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Optional: grant select to anon (adjust as needed)
-- GRANT SELECT ON portfolios TO anon;

-- End of portfolio migration
