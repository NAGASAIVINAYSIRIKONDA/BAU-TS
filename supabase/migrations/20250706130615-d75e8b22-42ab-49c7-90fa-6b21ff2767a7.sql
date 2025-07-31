
-- Phase 1: Database Schema Updates

-- Step 1: Make member_id nullable in hr_checkins table to support department-wide check-ins
ALTER TABLE public.hr_checkins ALTER COLUMN member_id DROP NOT NULL;

-- Step 2: Add a constraint to ensure either member_id OR department is specified (but not both null)
ALTER TABLE public.hr_checkins ADD CONSTRAINT check_member_or_department 
CHECK (
  (member_id IS NOT NULL AND department IS NULL) OR 
  (member_id IS NULL AND department IS NOT NULL)
);

-- Step 3: Update RLS policies to handle both individual and department-wide check-ins

-- Drop existing policies first
DROP POLICY IF EXISTS "HR and Admins can manage all checkins" ON public.hr_checkins;
DROP POLICY IF EXISTS "Team members can view their own checkins" ON public.hr_checkins;

-- Create updated policies
CREATE POLICY "HR and Admins can manage all checkins" 
ON public.hr_checkins 
FOR ALL 
TO authenticated 
USING (is_hr_or_admin(auth.uid()));

CREATE POLICY "Team members can view their own checkins" 
ON public.hr_checkins 
FOR SELECT 
TO authenticated 
USING (
  (member_id IS NOT NULL AND auth.uid() = member_id) OR
  (department IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND department = hr_checkins.department
  ))
);

-- Step 4: Update followup tasks policies to handle department-based check-ins

-- Drop existing policy first
DROP POLICY IF EXISTS "HR and Admins can manage followup tasks" ON public.checkin_followup_tasks;

-- Create updated policy
CREATE POLICY "HR and Admins can manage followup tasks" 
ON public.checkin_followup_tasks 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM hr_checkins 
    WHERE hr_checkins.id = checkin_followup_tasks.checkin_id 
    AND (
      is_hr_or_admin(auth.uid()) OR 
      hr_checkins.member_id = auth.uid() OR
      (hr_checkins.department IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND department = hr_checkins.department
      ))
    )
  )
);

-- Step 5: Update task updates policies similarly
DROP POLICY IF EXISTS "HR and Admins can manage task updates" ON public.checkin_task_updates;

CREATE POLICY "HR and Admins can manage task updates" 
ON public.checkin_task_updates 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM hr_checkins 
    WHERE hr_checkins.id = checkin_task_updates.new_checkin_id 
    AND (
      is_hr_or_admin(auth.uid()) OR 
      hr_checkins.member_id = auth.uid() OR
      (hr_checkins.department IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND department = hr_checkins.department
      ))
    )
  )
);
