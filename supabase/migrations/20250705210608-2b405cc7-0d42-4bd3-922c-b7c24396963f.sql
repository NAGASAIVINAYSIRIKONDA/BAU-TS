
-- Create table for BAU task instances
CREATE TABLE public.bau_task_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.bau_templates(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for task KPI records
CREATE TABLE public.task_kpi_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID NOT NULL REFERENCES public.bau_task_instances(id) ON DELETE CASCADE,
  template_kpi_id UUID NOT NULL REFERENCES public.template_kpis(id) ON DELETE CASCADE,
  recorded_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Add indexes for better performance
CREATE INDEX idx_bau_task_instances_template_id ON public.bau_task_instances(template_id);
CREATE INDEX idx_bau_task_instances_assigned_to ON public.bau_task_instances(assigned_to);
CREATE INDEX idx_bau_task_instances_status ON public.bau_task_instances(status);
CREATE INDEX idx_bau_task_instances_due_date ON public.bau_task_instances(due_date);
CREATE INDEX idx_task_kpi_records_task_instance_id ON public.task_kpi_records(task_instance_id);

-- Enable RLS on both tables
ALTER TABLE public.bau_task_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_kpi_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for bau_task_instances
CREATE POLICY "Users can view their assigned tasks" 
  ON public.bau_task_instances 
  FOR SELECT 
  USING (auth.uid() = assigned_to OR is_hr_or_admin(auth.uid()));

CREATE POLICY "HR and Admins can manage all task instances" 
  ON public.bau_task_instances 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

CREATE POLICY "Users can update their assigned tasks" 
  ON public.bau_task_instances 
  FOR UPDATE 
  USING (auth.uid() = assigned_to);

-- RLS policies for task_kpi_records
CREATE POLICY "Users can view KPI records for their tasks" 
  ON public.task_kpi_records 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bau_task_instances 
      WHERE id = task_kpi_records.task_instance_id 
      AND (assigned_to = auth.uid() OR is_hr_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can create KPI records for their tasks" 
  ON public.task_kpi_records 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bau_task_instances 
      WHERE id = task_kpi_records.task_instance_id 
      AND assigned_to = auth.uid()
    ) AND recorded_by = auth.uid()
  );

CREATE POLICY "HR and Admins can manage all KPI records" 
  ON public.task_kpi_records 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- Add trigger for updating updated_at column
CREATE TRIGGER update_bau_task_instances_updated_at 
  BEFORE UPDATE ON public.bau_task_instances 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
