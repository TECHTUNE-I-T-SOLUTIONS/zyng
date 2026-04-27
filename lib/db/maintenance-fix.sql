-- ZYNG MAINTENANCE FK FIX
-- Run this after the original maintenance.sql if you already created the table

ALTER TABLE maintenance_settings
DROP CONSTRAINT IF EXISTS maintenance_settings_updated_by_fkey;

ALTER TABLE maintenance_settings
ADD CONSTRAINT maintenance_settings_updated_by_fkey
FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL;
