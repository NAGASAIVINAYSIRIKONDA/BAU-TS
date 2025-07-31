-- Soft Reset for Morning Sanity Check
-- This truncates operational data while preserving configuration

-- Clear BAU task instances and all related progress data
TRUNCATE TABLE public.bau_task_instances CASCADE;

-- Clear BAU progress entries (should be cleared by CASCADE but being explicit)
TRUNCATE TABLE public.bau_progress_entries CASCADE;

-- Clear BAU progress periods (should be cleared by CASCADE but being explicit)
TRUNCATE TABLE public.bau_progress_periods CASCADE;

-- Clear task KPI records (should be cleared by CASCADE but being explicit)
TRUNCATE TABLE public.task_kpi_records CASCADE;

-- Clear HR check-ins and all related follow-up data
TRUNCATE TABLE public.hr_checkins CASCADE;

-- Clear follow-up tasks (should be cleared by CASCADE but being explicit)
TRUNCATE TABLE public.checkin_followup_tasks CASCADE;

-- Clear task updates (should be cleared by CASCADE but being explicit)
TRUNCATE TABLE public.checkin_task_updates CASCADE;

-- Configuration data preserved:
-- - profiles (user accounts)
-- - departments (organizational structure)
-- - bau_templates (BAU template definitions)
-- - template_assignments (user-template relationships)
-- - template_kpis (KPI definitions for templates)
-- - user_roles (user permissions)
-- - invitations (pending invitations)