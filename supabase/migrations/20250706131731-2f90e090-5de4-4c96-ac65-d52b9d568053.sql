
-- First, let's check the current state and fix the constraint issue
-- Drop the existing constraint that might be causing issues
ALTER TABLE public.hr_checkins DROP CONSTRAINT IF EXISTS check_member_or_department;

-- Make sure member_id is nullable
ALTER TABLE public.hr_checkins ALTER COLUMN member_id DROP NOT NULL;

-- Add the correct constraint that allows either member_id OR department (but not both null)
ALTER TABLE public.hr_checkins ADD CONSTRAINT check_member_or_department 
CHECK (
  (member_id IS NOT NULL AND department IS NULL) OR 
  (member_id IS NULL AND department IS NOT NULL)
);

-- Update any existing records that might have invalid data
UPDATE public.hr_checkins 
SET member_id = NULL 
WHERE member_id = '' AND department IS NOT NULL;
