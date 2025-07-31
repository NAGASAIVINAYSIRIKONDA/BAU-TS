
-- Create table for BAU progress periods
CREATE TABLE public.bau_progress_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_instance_id UUID NOT NULL REFERENCES public.bau_task_instances(id) ON DELETE CASCADE,
  period_number INTEGER NOT NULL,
  period_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for progress entries within each period
CREATE TABLE public.bau_progress_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_id UUID NOT NULL REFERENCES public.bau_progress_periods(id) ON DELETE CASCADE,
  template_kpi_id UUID NOT NULL REFERENCES public.template_kpis(id) ON DELETE CASCADE,
  recorded_value NUMERIC NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Add indexes for better performance
CREATE INDEX idx_bau_progress_periods_task_instance_id ON public.bau_progress_periods(task_instance_id);
CREATE INDEX idx_bau_progress_periods_period_number ON public.bau_progress_periods(period_number);
CREATE INDEX idx_bau_progress_entries_period_id ON public.bau_progress_entries(period_id);
CREATE INDEX idx_bau_progress_entries_template_kpi_id ON public.bau_progress_entries(template_kpi_id);

-- Add new columns to bau_task_instances for progress tracking
ALTER TABLE public.bau_task_instances 
ADD COLUMN progress_percentage NUMERIC DEFAULT 0,
ADD COLUMN score NUMERIC DEFAULT 0,
ADD COLUMN periods_completed INTEGER DEFAULT 0,
ADD COLUMN total_periods INTEGER DEFAULT 1;

-- Enable RLS on new tables
ALTER TABLE public.bau_progress_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bau_progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for bau_progress_periods
CREATE POLICY "Users can view periods for their assigned tasks" 
  ON public.bau_progress_periods 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bau_task_instances 
      WHERE id = bau_progress_periods.task_instance_id 
      AND (assigned_to = auth.uid() OR is_hr_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can update periods for their assigned tasks" 
  ON public.bau_progress_periods 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.bau_task_instances 
      WHERE id = bau_progress_periods.task_instance_id 
      AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "HR and Admins can manage all periods" 
  ON public.bau_progress_periods 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- RLS policies for bau_progress_entries
CREATE POLICY "Users can view entries for their task periods" 
  ON public.bau_progress_entries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bau_progress_periods bp
      JOIN public.bau_task_instances bti ON bp.task_instance_id = bti.id
      WHERE bp.id = bau_progress_entries.period_id 
      AND (bti.assigned_to = auth.uid() OR is_hr_or_admin(auth.uid()))
    )
  );

CREATE POLICY "Users can create entries for their task periods" 
  ON public.bau_progress_entries 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bau_progress_periods bp
      JOIN public.bau_task_instances bti ON bp.task_instance_id = bti.id
      WHERE bp.id = bau_progress_entries.period_id 
      AND bti.assigned_to = auth.uid()
    ) AND recorded_by = auth.uid()
  );

CREATE POLICY "Users can update their own entries" 
  ON public.bau_progress_entries 
  FOR UPDATE 
  USING (recorded_by = auth.uid());

CREATE POLICY "HR and Admins can manage all entries" 
  ON public.bau_progress_entries 
  FOR ALL 
  USING (is_hr_or_admin(auth.uid()));

-- Function to create periods based on task frequency
CREATE OR REPLACE FUNCTION public.create_task_periods(
  task_instance_id UUID,
  frequency bau_frequency,
  start_date DATE
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
