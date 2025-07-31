
-- Phase 1: Create department-aware helper functions and update RLS policies

-- Create helper function to get user's department
CREATE OR REPLACE FUNCTION public.get_user_department(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT department FROM public.profiles WHERE id = user_id;
$$;

-- Create helper function to check if user is team lead
CREATE OR REPLACE FUNCTION public.is_team_lead(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = user_id AND role = 'Team_Lead'
  );
$$;

-- Create helper function to check if user can access department data
CREATE OR REPLACE FUNCTION public.can_access_department_data(user_id uuid, target_department text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    -- Admin and HR can access all departments
    is_hr_or_admin(user_id) OR 
    -- Team leads and members can only access their own department
    (get_user_department(user_id) = target_department);
$$;

-- Update BAU Templates RLS to include Team_Lead access with department filtering
DROP POLICY IF EXISTS "Users can view active bau templates" ON public.bau_templates;
CREATE POLICY "Users can view department bau templates" 
ON public.bau_templates 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- HR/Admin can see all active templates
    (is_hr_or_admin(auth.uid()) AND status = 'Active') OR
    -- Team leads can see their department's templates (any status for management)
    (is_team_lead(auth.uid()) AND can_access_department_data(auth.uid(), department)) OR
    -- Regular users can only see active templates from their department
    (NOT is_hr_or_admin(auth.uid()) AND NOT is_team_lead(auth.uid()) AND 
     status = 'Active' AND can_access_department_data(auth.uid(), department))
  )
);

-- Allow Team_Lead to create BAU templates for their department
DROP POLICY IF EXISTS "HR and Admins can create bau templates" ON public.bau_templates;
CREATE POLICY "HR, Admins and Team Leads can create bau templates" 
ON public.bau_templates 
FOR INSERT 
WITH CHECK (
  is_hr_or_admin(auth.uid()) OR 
  (is_team_lead(auth.uid()) AND can_access_department_data(auth.uid(), department))
);

-- Allow Team_Lead to update BAU templates in their department
DROP POLICY IF EXISTS "HR and Admins can manage bau templates" ON public.bau_templates;
CREATE POLICY "HR, Admins and Team Leads can manage bau templates" 
ON public.bau_templates 
FOR UPDATE 
USING (
  is_hr_or_admin(auth.uid()) OR 
  (is_team_lead(auth.uid()) AND can_access_department_data(auth.uid(), department))
);

-- Update BAU Task Instances to allow Team_Lead to create tasks for their department
DROP POLICY IF EXISTS "HR and Admins can create task instances" ON public.bau_task_instances;
CREATE POLICY "HR, Admins and Team Leads can create task instances" 
ON public.bau_task_instances 
FOR INSERT 
WITH CHECK (
  is_hr_or_admin(auth.uid()) OR 
  (is_team_lead(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update task viewing to be department-aware
DROP POLICY IF EXISTS "Users can view their assigned tasks" ON public.bau_task_instances;
CREATE POLICY "Users can view department tasks" 
ON public.bau_task_instances 
FOR SELECT 
USING (
  -- Users can see their own tasks
  auth.uid() = assigned_to OR 
  -- HR/Admin can see all tasks
  is_hr_or_admin(auth.uid()) OR
  -- Team leads can see tasks assigned to their department members
  (is_team_lead(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Allow Team_Lead to update tasks for their department members
DROP POLICY IF EXISTS "HR and Admins can manage all task instances" ON public.bau_task_instances;
CREATE POLICY "HR, Admins and Team Leads can manage department tasks" 
ON public.bau_task_instances 
FOR UPDATE 
USING (
  is_hr_or_admin(auth.uid()) OR 
  (is_team_lead(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = assigned_to AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update HR check-ins to be department-aware
DROP POLICY IF EXISTS "HR and Admins can manage all checkins" ON public.hr_checkins;
CREATE POLICY "HR, Admins and Team Leads can manage department checkins" 
ON public.hr_checkins 
FOR ALL 
USING (
  is_hr_or_admin(auth.uid()) OR
  (is_team_lead(auth.uid()) AND (
    -- Can manage checkins in their department
    can_access_department_data(auth.uid(), department) OR
    -- Can manage checkins for members in their department
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = member_id AND can_access_department_data(auth.uid(), p.department)
    )
  ))
);

-- Update template assignments to allow Team_Lead to assign templates in their department
DROP POLICY IF EXISTS "HR and Admins can create template assignments" ON public.template_assignments;
CREATE POLICY "HR, Admins and Team Leads can create department assignments" 
ON public.template_assignments 
FOR INSERT 
WITH CHECK (
  is_hr_or_admin(auth.uid()) OR 
  (is_team_lead(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = user_id AND can_access_department_data(auth.uid(), p.department)
  ))
);

-- Update template assignment viewing
DROP POLICY IF EXISTS "HR and Admins can manage template assignments" ON public.template_assignments;
CREATE POLICY "HR, Admins and Team Leads can view department assignments" 
ON public.template_assignments 
FOR SELECT 
USING (
  -- Users can see their own assignments
  auth.uid() = user_id OR 
  -- HR/Admin can see all assignments
  is_hr_or_admin(auth.uid()) OR
  -- Team leads can see assignments for their department members
  (is_team_lead(auth.uid()) AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = user_id AND can_access_department_data(auth.uid(), p.department)
  ))
);
