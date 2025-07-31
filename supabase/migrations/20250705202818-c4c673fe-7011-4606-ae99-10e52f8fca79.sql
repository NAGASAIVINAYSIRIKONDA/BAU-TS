
-- Create enum for BAU template status
CREATE TYPE public.bau_template_status AS ENUM ('Draft', 'Active', 'Deactivated');

-- Create enum for BAU frequency
CREATE TYPE public.bau_frequency AS ENUM ('Daily', 'Weekly', 'Monthly', 'Quarterly');

-- Create enum for KPI units
CREATE TYPE public.kpi_unit AS ENUM ('Percentage', 'Count');

-- Create enum for KPI operators
CREATE TYPE public.kpi_operator AS ENUM ('GreaterThanEqual', 'LessThanEqual');

-- Create BAU Templates table
CREATE TABLE public.bau_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  frequency bau_frequency NOT NULL,
  status bau_template_status NOT NULL DEFAULT 'Draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivated_by UUID REFERENCES public.profiles(id)
);

-- Create Template KPIs table
CREATE TABLE public.template_kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.bau_templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit kpi_unit NOT NULL,
  operator kpi_operator NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Template Assignments table (for assigning multiple team members to templates)
CREATE TABLE public.template_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.bau_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Add RLS policies for BAU Templates
ALTER TABLE public.bau_templates ENABLE ROW LEVEL SECURITY;

-- HR and Admins can manage all templates
CREATE POLICY "HR and Admins can manage bau templates" 
  ON public.bau_templates 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- All authenticated users can view active templates
CREATE POLICY "Users can view active bau templates" 
  ON public.bau_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL AND status = 'Active');

-- Add RLS policies for Template KPIs
ALTER TABLE public.template_kpis ENABLE ROW LEVEL SECURITY;

-- HR and Admins can manage KPIs
CREATE POLICY "HR and Admins can manage template kpis" 
  ON public.template_kpis 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- All authenticated users can view KPIs for active templates
CREATE POLICY "Users can view template kpis" 
  ON public.template_kpis 
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.bau_templates 
      WHERE id = template_id AND status = 'Active'
    )
  );

-- Add RLS policies for Template Assignments
ALTER TABLE public.template_assignments ENABLE ROW LEVEL SECURITY;

-- HR and Admins can manage assignments
CREATE POLICY "HR and Admins can manage template assignments" 
  ON public.template_assignments 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- Users can view their own assignments
CREATE POLICY "Users can view their template assignments" 
  ON public.template_assignments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_bau_templates_updated_at
  BEFORE UPDATE ON public.bau_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_bau_templates_department ON public.bau_templates(department);
CREATE INDEX idx_bau_templates_status ON public.bau_templates(status);
CREATE INDEX idx_bau_templates_created_by ON public.bau_templates(created_by);
CREATE INDEX idx_template_kpis_template_id ON public.template_kpis(template_id);
CREATE INDEX idx_template_assignments_template_id ON public.template_assignments(template_id);
CREATE INDEX idx_template_assignments_user_id ON public.template_assignments(user_id);
