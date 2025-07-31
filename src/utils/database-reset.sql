-- Database Reset Script for Testing
-- WARNING: This will delete all test data. Use with caution!

-- Step 1: Disable foreign key constraints temporarily
-- (This is handled automatically by the deletion order)

-- Step 2: Delete data in the correct order to respect foreign key constraints

-- Delete follow-up task updates first
DELETE FROM public.checkin_task_updates;

-- Delete follow-up tasks
DELETE FROM public.checkin_followup_tasks;

-- Delete HR check-ins
DELETE FROM public.hr_checkins;

-- Delete BAU progress entries
DELETE FROM public.bau_progress_entries;

-- Delete BAU progress periods
DELETE FROM public.bau_progress_periods;

-- Delete BAU task instances
DELETE FROM public.bau_task_instances;

-- Delete task KPI records
DELETE FROM public.task_kpi_records;

-- Delete template assignments
DELETE FROM public.template_assignments;

-- Delete template KPIs
DELETE FROM public.template_kpis;

-- Delete BAU templates
DELETE FROM public.bau_templates;

-- Delete invitations (optional - keeps invitation history)
-- DELETE FROM public.invitations;

-- Delete user roles (optional - keeps role assignments)
-- DELETE FROM public.user_roles;

-- Delete departments (optional - keeps department structure)
-- DELETE FROM public.departments;

-- Delete profiles (optional - keeps user profiles)
-- DELETE FROM public.profiles;

-- Step 3: Reset sequences (optional)
-- This ensures IDs start from 1 again for auto-increment fields
-- Note: Most tables use UUID so this might not be necessary

-- Step 4: Verification queries
-- Run these to verify data has been deleted
SELECT 'hr_checkins' as table_name, COUNT(*) as remaining_records FROM public.hr_checkins
UNION ALL
SELECT 'checkin_followup_tasks', COUNT(*) FROM public.checkin_followup_tasks
UNION ALL
SELECT 'checkin_task_updates', COUNT(*) FROM public.checkin_task_updates
UNION ALL
SELECT 'bau_task_instances', COUNT(*) FROM public.bau_task_instances
UNION ALL
SELECT 'bau_templates', COUNT(*) FROM public.bau_templates
UNION ALL
SELECT 'template_assignments', COUNT(*) FROM public.template_assignments
UNION ALL
SELECT 'template_kpis', COUNT(*) FROM public.template_kpis
UNION ALL
SELECT 'bau_progress_entries', COUNT(*) FROM public.bau_progress_entries
UNION ALL
SELECT 'bau_progress_periods', COUNT(*) FROM public.bau_progress_periods;

-- Instructions for use:
-- 1. Copy the deletion commands above
-- 2. Run them in your Supabase SQL editor
-- 3. Run the verification queries to confirm data is deleted
-- 4. Your application should now have a clean state for testing