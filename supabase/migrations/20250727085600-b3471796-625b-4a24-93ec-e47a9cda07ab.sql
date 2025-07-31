-- Update RLS policies for template_kpis to allow Team Leads to create KPIs for their department templates

-- Drop existing restrictive policies for template_kpis
DROP POLICY IF EXISTS "HR and Admins can create template kpis" ON public.template_kpis;
DROP POLICY IF EXISTS "HR and Admins can update template kpis" ON public.template_kpis;
DROP POLICY IF EXISTS "HR and Admins can delete template kpis" ON public.template_kpis;

-- Create new policies that include Team Leads with department restrictions
CREATE POLICY "HR, Admins and Team Leads can create template kpis" 
ON public.template_kpis 
FOR INSERT 
WITH CHECK (
  is_hr_or_admin(auth.uid()) OR 
  (
    is_team_lead(auth.uid()) AND 
    get_user_department(auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.bau_templates 
      WHERE bau_templates.id = template_kpis.template_id 
      AND can_access_department_data(auth.uid(), bau_templates.department)
    )
  )
);

CREATE POLICY "HR, Admins and Team Leads can update template kpis" 
ON public.template_kpis 
FOR UPDATE 
USING (
  is_hr_or_admin(auth.uid()) OR 
  (
    is_team_lead(auth.uid()) AND 
    get_user_department(auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.bau_templates 
      WHERE bau_templates.id = template_kpis.template_id 
      AND can_access_department_data(auth.uid(), bau_templates.department)
    )
  )
);

CREATE POLICY "HR, Admins and Team Leads can delete template kpis" 
ON public.template_kpis 
FOR DELETE 
USING (
  is_hr_or_admin(auth.uid()) OR 
  (
    is_team_lead(auth.uid()) AND 
    get_user_department(auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.bau_templates 
      WHERE bau_templates.id = template_kpis.template_id 
      AND can_access_department_data(auth.uid(), bau_templates.department)
    )
  )
);