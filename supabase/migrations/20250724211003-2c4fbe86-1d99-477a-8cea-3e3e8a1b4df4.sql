-- Fix the RLS policies to properly handle Admin/HR access without department restrictions

-- Update BAU task instances viewing policy for Admins
DROP POLICY IF EXISTS "Users can view department tasks" ON public.bau_task_instances;
CREATE POLICY "Users can view department tasks" 
ON public.bau_task_instances 
FOR SELECT 
USING (
  -- Users can see their own tasks
  auth.uid() = assigned_to OR 
  -- HR/Admin can see ALL tasks regardless of department
  is_hr_or_admin(auth.uid()) OR
  -- Team leads can see tasks assigned to their department members (only if they have a department)
  (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update BAU templates viewing policy for Admins  
DROP POLICY IF EXISTS "Users can view department bau templates" ON public.bau_templates;
CREATE POLICY "Users can view department bau templates" 
ON public.bau_templates 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- HR/Admin can see ALL templates regardless of department
    is_hr_or_admin(auth.uid()) OR
    -- Team leads can see their department's templates (only if they have a department)
    (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND can_access_department_data(auth.uid(), department)) OR
    -- Regular users can only see active templates from their department (only if they have a department)
    (NOT is_hr_or_admin(auth.uid()) AND NOT is_team_lead(auth.uid()) AND 
     get_user_department(auth.uid()) IS NOT NULL AND
     status = 'Active' AND can_access_department_data(auth.uid(), department))
  )
);

-- Update task creation policy for Admins
DROP POLICY IF EXISTS "HR, Admins and Team Leads can create task instances" ON public.bau_task_instances;
CREATE POLICY "HR, Admins and Team Leads can create task instances" 
ON public.bau_task_instances 
FOR INSERT 
WITH CHECK (
  -- HR/Admin can create tasks for anyone
  is_hr_or_admin(auth.uid()) OR 
  -- Team leads can create tasks for their department members (only if they have a department)
  (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update task management policy for Admins
DROP POLICY IF EXISTS "HR, Admins and Team Leads can manage department tasks" ON public.bau_task_instances;
CREATE POLICY "HR, Admins and Team Leads can manage department tasks" 
ON public.bau_task_instances 
FOR UPDATE 
USING (
  -- HR/Admin can manage all tasks
  is_hr_or_admin(auth.uid()) OR 
  -- Team leads can manage tasks for their department members (only if they have a department)
  (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update template creation policy for Admins
DROP POLICY IF EXISTS "HR, Admins and Team Leads can create bau templates" ON public.bau_templates;
CREATE POLICY "HR, Admins and Team Leads can create bau templates" 
ON public.bau_templates 
FOR INSERT 
WITH CHECK (
  -- HR/Admin can create templates for any department
  is_hr_or_admin(auth.uid()) OR 
  -- Team leads can create templates for their department (only if they have a department)
  (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND can_access_department_data(auth.uid(), department))
);

-- Update template management policy for Admins
DROP POLICY IF EXISTS "HR, Admins and Team Leads can manage bau templates" ON public.bau_templates;
CREATE POLICY "HR, Admins and Team Leads can manage bau templates" 
ON public.bau_templates 
FOR UPDATE 
USING (
  -- HR/Admin can manage all templates
  is_hr_or_admin(auth.uid()) OR 
  -- Team leads can manage their department templates (only if they have a department)
  (is_team_lead(auth.uid()) AND get_user_department(auth.uid()) IS NOT NULL AND can_access_department_data(auth.uid(), department))
);