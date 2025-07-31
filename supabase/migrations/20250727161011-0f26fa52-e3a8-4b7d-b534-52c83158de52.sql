-- Fix RLS policies to prioritize Admin/HR access over Team Lead checks
-- This resolves the issue where Admins with NULL departments get forbidden errors

-- First, drop existing problematic policies for hr_checkins
DROP POLICY IF EXISTS "HR and Admins can manage all checkins" ON public.hr_checkins;
DROP POLICY IF EXISTS "HR and Admins can update checkins" ON public.hr_checkins;
DROP POLICY IF EXISTS "HR and Admins can delete checkins" ON public.hr_checkins;
DROP POLICY IF EXISTS "Team Leads can manage department checkins" ON public.hr_checkins;
DROP POLICY IF EXISTS "Team members can view relevant checkins" ON public.hr_checkins;

-- Create new hierarchical policies for hr_checkins
-- Priority 1: Admin/HR get full access (no department check needed)
CREATE POLICY "Admins and HR can manage all checkins"
ON public.hr_checkins
FOR ALL
USING (is_hr_or_admin(auth.uid()))
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Priority 2: Team Leads can manage department checkins (with department check)
CREATE POLICY "Team Leads can manage department checkins"
ON public.hr_checkins
FOR ALL
USING (
  is_team_lead(auth.uid()) 
  AND get_user_department(auth.uid()) IS NOT NULL 
  AND (
    can_access_department_data(auth.uid(), department) 
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = hr_checkins.member_id 
      AND can_access_department_data(auth.uid(), p.department)
    )
  )
);

-- Priority 3: Team members can view their own checkins
CREATE POLICY "Users can view their own checkins"
ON public.hr_checkins
FOR SELECT
USING (auth.uid() = member_id OR auth.uid() = checked_in_by);

-- Now fix checkin_followup_tasks policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "HR and Admins can manage all followup tasks" ON public.checkin_followup_tasks;
DROP POLICY IF EXISTS "Team Leads can manage department followup tasks" ON public.checkin_followup_tasks;
DROP POLICY IF EXISTS "Assigned users can view and update their tasks" ON public.checkin_followup_tasks;
DROP POLICY IF EXISTS "Users can view followup tasks for their checkins" ON public.checkin_followup_tasks;

-- Create new hierarchical policies for checkin_followup_tasks
-- Priority 1: Admin/HR get full access
CREATE POLICY "Admins and HR can manage all followup tasks"
ON public.checkin_followup_tasks
FOR ALL
USING (is_hr_or_admin(auth.uid()))
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Priority 2: Team Leads can manage department followup tasks
CREATE POLICY "Team Leads can manage department followup tasks"
ON public.checkin_followup_tasks
FOR ALL
USING (
  is_team_lead(auth.uid()) 
  AND get_user_department(auth.uid()) IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM hr_checkins hc 
    WHERE hc.id = checkin_followup_tasks.checkin_id 
    AND (
      can_access_department_data(auth.uid(), hc.department) 
      OR EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = hc.member_id 
        AND can_access_department_data(auth.uid(), p.department)
      )
    )
  )
);

-- Priority 3: Users can manage their assigned tasks
CREATE POLICY "Users can manage their assigned tasks"
ON public.checkin_followup_tasks
FOR ALL
USING (
  auth.uid() = assigned_to 
  OR EXISTS (
    SELECT 1 FROM hr_checkins hc 
    WHERE hc.id = checkin_followup_tasks.checkin_id 
    AND (hc.member_id = auth.uid() OR hc.checked_in_by = auth.uid())
  )
);