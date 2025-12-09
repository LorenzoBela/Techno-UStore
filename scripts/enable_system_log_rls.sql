-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON SystemLog
-- ============================================================

-- Enable RLS
ALTER TABLE "SystemLog" ENABLE ROW LEVEL SECURITY;

-- create policy "Service role can do anything on SystemLog"
-- on "SystemLog"
-- for all
-- using ( auth.role() = 'service_role' );

-- NOTE: By enabling RLS and NOT creating any policies for the 'public' or 'authenticated' roles,
-- we effectively deny access to everyone EXCEPT the service role (superuser/admin).
-- This is what we want for an internal logging table.
