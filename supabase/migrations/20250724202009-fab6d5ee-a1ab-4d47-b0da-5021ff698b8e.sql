
-- Phase 1: Add Missing Critical INSERT Policies

-- Allow HR/Admin to create BAU task instances
CREATE POLICY "HR and Admins can create task instances" 
ON public.bau_task_instances 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to create progress periods (usually auto-generated)
CREATE POLICY "HR and Admins can create progress periods" 
ON public.bau_progress_periods 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to create progress entries for any task, users for their own tasks
CREATE POLICY "Users can create progress entries for their tasks" 
ON public.bau_progress_entries 
FOR INSERT 
WITH CHECK (
  (auth.uid() = recorded_by) AND 
  (EXISTS (
    SELECT 1 FROM bau_progress_periods bp
    JOIN bau_task_instances bti ON bp.task_instance_id = bti.id
    WHERE bp.id = period_id AND (bti.assigned_to = auth.uid() OR is_hr_or_admin(auth.uid()))
  ))
);

-- Phase 2: Add Missing DELETE Policies

-- Allow HR/Admin to delete BAU task instances
CREATE POLICY "HR and Admins can delete task instances" 
ON public.bau_task_instances 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete progress periods
CREATE POLICY "HR and Admins can delete progress periods" 
ON public.bau_progress_periods 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow users to delete their own progress entries, HR/Admin to delete all
CREATE POLICY "Users can delete their own progress entries" 
ON public.bau_progress_entries 
FOR DELETE 
USING (recorded_by = auth.uid() OR is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete check-ins
CREATE POLICY "HR and Admins can delete checkins" 
ON public.hr_checkins 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete invitations
CREATE POLICY "HR and Admins can delete invitations" 
ON public.invitations 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete template assignments
CREATE POLICY "HR and Admins can delete template assignments" 
ON public.template_assignments 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Phase 3: Add Missing UPDATE Policies

-- Allow HR/Admin to update check-ins
CREATE POLICY "HR and Admins can update checkins" 
ON public.hr_checkins 
FOR UPDATE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to update template assignments
CREATE POLICY "HR and Admins can update template assignments" 
ON public.template_assignments 
FOR UPDATE 
USING (is_hr_or_admin(auth.uid()));

-- Phase 4: Tighten Security on User Roles

-- Remove the overly permissive "Users can view all roles" policy
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Add more restrictive policy for viewing roles
CREATE POLICY "Users can view their own role and HR/Admin can view all" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid() OR is_hr_or_admin(auth.uid()));

-- Add missing INSERT policy for user_roles (only Admin can assign roles)
CREATE POLICY "Admins can create user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Add missing UPDATE policy for user_roles (only Admin can update roles)
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Add missing DELETE policy for user_roles (only Admin can delete roles)
CREATE POLICY "Admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Phase 5: Add missing policies for BAU Templates

-- Allow HR/Admin to create BAU templates
CREATE POLICY "HR and Admins can create bau templates" 
ON public.bau_templates 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete BAU templates
CREATE POLICY "HR and Admins can delete bau templates" 
ON public.bau_templates 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to create template KPIs
CREATE POLICY "HR and Admins can create template kpis" 
ON public.template_kpis 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to update template KPIs
CREATE POLICY "HR and Admins can update template kpis" 
ON public.template_kpis 
FOR UPDATE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to delete template KPIs
CREATE POLICY "HR and Admins can delete template kpis" 
ON public.template_kpis 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Allow HR/Admin to create template assignments
CREATE POLICY "HR and Admins can create template assignments" 
ON public.template_assignments 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));
