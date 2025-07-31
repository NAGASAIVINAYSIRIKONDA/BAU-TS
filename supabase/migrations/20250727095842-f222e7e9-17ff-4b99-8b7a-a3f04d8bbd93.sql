-- Fix RLS policy for Team_Lead to view progress periods for department tasks
DROP POLICY IF EXISTS "Users can view periods for their assigned tasks" ON public.bau_progress_periods;

CREATE POLICY "Users can view periods for their assigned tasks" 
ON public.bau_progress_periods 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM bau_task_instances bti
    LEFT JOIN profiles p ON bti.assigned_to = p.id
    WHERE bti.id = bau_progress_periods.task_instance_id 
    AND (
      bti.assigned_to = auth.uid() OR 
      is_hr_or_admin(auth.uid()) OR
      (is_team_lead(auth.uid()) AND 
       get_user_department(auth.uid()) IS NOT NULL AND 
       can_access_department_data(auth.uid(), p.department))
    )
  )
);