-- Fix RLS policies for bau_task_instances to allow Team Leads to update department tasks

-- Drop existing restrictive update policy for Team Leads
DROP POLICY IF EXISTS "HR, Admins and Team Leads can manage department tasks" ON public.bau_task_instances;

-- Create new policy that properly allows Team Leads to update department tasks
CREATE POLICY "HR, Admins and Team Leads can manage department tasks" 
ON public.bau_task_instances 
FOR UPDATE 
USING (
  is_hr_or_admin(auth.uid()) OR 
  (
    is_team_lead(auth.uid()) AND 
    get_user_department(auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = bau_task_instances.assigned_to 
      AND can_access_department_data(auth.uid(), p.department)
    )
  )
);