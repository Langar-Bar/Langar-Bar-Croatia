-- Langar Bar V4.5.10 — Mobile Order Tabs + Admin Reviews Login Hotfix
-- No new schema changes are required after V4.5.9.
-- This SQL file is intentionally safe/no-op.
--
-- Required baseline for Reviews & Cancellation:
-- 1) Run langar_v459_sql_only.sql if it has not already been run.
-- 2) Upload the V4.5.10 ZIP to refresh CSS/JS and service-worker cache.

notify pgrst, 'reload schema';
