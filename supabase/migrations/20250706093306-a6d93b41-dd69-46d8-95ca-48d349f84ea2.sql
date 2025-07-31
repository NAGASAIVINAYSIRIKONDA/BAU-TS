
-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron job to run on the 1st of every month at 00:00 UTC
SELECT cron.schedule(
  'auto-generate-bau-tasks-monthly',
  '0 0 1 * *', -- At 00:00 on day-of-month 1
  $$
  SELECT
    net.http_post(
        url:='https://pxngehbakkaeqqmbjxlt.supabase.co/functions/v1/auto-generate-bau-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bmdlaGJha2thZXFxbWJqeGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTUxMjYsImV4cCI6MjA2NzAzMTEyNn0.vxF9Uo7F4rusx_05VIg0XDpKYJeL2jKjhBh5R2q7P7s"}'::jsonb,
        body:='{"trigger": "monthly_cron"}'::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'auto-generate-bau-tasks-monthly';
