-- Clean up backup tables that are causing RLS security warnings
DROP TABLE IF EXISTS public.backup_profiles;
DROP TABLE IF EXISTS public.backup_user_roles;
DROP TABLE IF EXISTS public.backup_departments;
DROP TABLE IF EXISTS public.backup_bau_templates;
DROP TABLE IF EXISTS public.backup_template_kpis;
DROP TABLE IF EXISTS public.backup_template_assignments;
DROP TABLE IF EXISTS public.backup_bau_task_instances;
DROP TABLE IF EXISTS public.backup_hr_checkins;
DROP TABLE IF EXISTS public.backup_checkin_followup_tasks;
DROP TABLE IF EXISTS public.backup_invitations;

-- Update all functions with proper security settings
CREATE OR REPLACE FUNCTION public.handle_department_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Update all team members assigned to this department to have NULL department
  UPDATE public.profiles 
  SET department = NULL 
  WHERE department = OLD.name;
  
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_department(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT department FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_team_lead(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = user_id AND role = 'Team_Lead'
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_access_department_data(user_id uuid, target_department text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    -- Admin and HR can access all departments
    public.is_hr_or_admin(user_id) OR 
    -- Team leads and members can only access their own department
    (public.get_user_department(user_id) = target_department);
$function$;

CREATE OR REPLACE FUNCTION public.handle_department_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- If department name changed, update all profiles that reference the old name
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public.profiles 
    SET department = NEW.name 
    WHERE department = OLD.name;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_task_periods(task_instance_id uuid, frequency bau_frequency, start_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  period_count INTEGER;
  period_name TEXT;
  current_start DATE;
  current_end DATE;
  i INTEGER;
BEGIN
  -- Determine period count and naming based on frequency
  CASE frequency
    WHEN 'Daily', 'Weekly' THEN
      period_count := 4;
      period_name := 'Week';
    WHEN 'Bi-Weekly' THEN
      period_count := 2;
      period_name := 'Bi-Week';
    WHEN 'Monthly' THEN
      period_count := 1;
      period_name := 'Month';
  END CASE;

  -- Update task instance with total periods
  UPDATE public.bau_task_instances 
  SET total_periods = period_count 
  WHERE id = task_instance_id;

  -- Create periods
  FOR i IN 1..period_count LOOP
    CASE frequency
      WHEN 'Daily', 'Weekly' THEN
        current_start := start_date + (i - 1) * INTERVAL '7 days';
        current_end := start_date + i * INTERVAL '7 days' - INTERVAL '1 day';
      WHEN 'Bi-Weekly' THEN
        current_start := start_date + (i - 1) * INTERVAL '14 days';
        current_end := start_date + i * INTERVAL '14 days' - INTERVAL '1 day';
      WHEN 'Monthly' THEN
        current_start := start_date;
        current_end := start_date + INTERVAL '1 month' - INTERVAL '1 day';
    END CASE;

    INSERT INTO public.bau_progress_periods (
      task_instance_id,
      period_number,
      period_name,
      start_date,
      end_date
    ) VALUES (
      task_instance_id,
      i,
      period_name || ' ' || i,
      current_start,
      current_end
    );
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_member_bau_summary(p_member_id uuid, p_date_range_start date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_date_range_end date DEFAULT CURRENT_DATE)
 RETURNS TABLE(active_baus_count bigint, completed_baus_count bigint, at_risk_count bigint, avg_progress_percentage numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('Pending', 'In Progress')) as active_baus_count,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_baus_count,
    COUNT(*) FILTER (WHERE due_date < current_date AND status != 'Completed') as at_risk_count,
    COALESCE(AVG(progress_percentage), 0) as avg_progress_percentage
  FROM public.bau_task_instances
  WHERE assigned_to = p_member_id
    AND created_at::date BETWEEN p_date_range_start AND p_date_range_end;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'Admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_hr_or_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role IN ('Admin', 'HR')
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Check if user was invited and assign role
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE email = NEW.email AND is_accepted = false AND expires_at > NOW();

  IF FOUND THEN
    -- Assign the role from invitation
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, invitation_record.role, invitation_record.invited_by);
    
    -- Mark invitation as accepted
    UPDATE public.invitations 
    SET is_accepted = true, accepted_at = NOW()
    WHERE id = invitation_record.id;
  ELSE
    -- Default role for users without invitation (shouldn't happen in invite-only system)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Team_Member');
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 ORDER BY assigned_at DESC LIMIT 1;
$function$;