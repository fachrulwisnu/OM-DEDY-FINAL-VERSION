-- 1. Refresh Supabase Schema Cache
NOTIFY pgrst, 'reload schema';

-- 2. Clean up redundant columns and ensure detail_task is the main field
-- We'll rename keterangan if it has data, otherwise just drop it if we prefer detail_task
-- Based on the error, let's keep it simple and just use detail_task as the standard.
ALTER TABLE tasks 
DROP COLUMN IF EXISTS keterangan;

-- If detail_task doesn't exist for some reason, ensure it does
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS detail_task TEXT;
