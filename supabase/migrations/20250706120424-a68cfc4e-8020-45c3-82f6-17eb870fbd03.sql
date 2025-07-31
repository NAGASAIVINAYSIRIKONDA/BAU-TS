
-- Create HR Check-ins table
CREATE TABLE public.hr_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT current_date,
  department text,
  notes text,
  status text NOT NULL DEFAULT 'Normal' CHECK (status IN ('Normal', 'Needs Support')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create Follow-up tasks table
CREATE TABLE public.checkin_followup_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkin_id uuid NOT NULL REFERENCES public.hr_checkins(id) ON DELETE CASCADE,
  task_description text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Done', 'Not Done')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table to track task updates across check-ins
CREATE TABLE public.checkin_task_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_task_id uuid NOT NULL REFERENCES public.checkin_followup_tasks(id) ON DELETE CASCADE,
  new_checkin_id uuid NOT NULL REFERENCES public.hr_checkins(id) ON DELETE CASCADE,
  previous_status text NOT NULL,
  new_status text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for hr_checkins
ALTER TABLE public.hr_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and Admins can manage all checkins"
  ON public.hr_checkins
  FOR ALL
  USING (is_hr_or_admin(auth.uid()));

CREATE POLICY "Team members can view their own checkins"
  ON public.hr_checkins
  FOR SELECT
  USING (auth.uid() = member_id);

-- Add RLS policies for checkin_followup_tasks
ALTER TABLE public.checkin_followup_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and Admins can manage followup tasks"
  ON public.checkin_followup_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hr_checkins 
      WHERE hr_checkins.id = checkin_followup_tasks.checkin_id 
      AND (is_hr_or_admin(auth.uid()) OR hr_checkins.member_id = auth.uid())
    )
  );

-- Add RLS policies for checkin_task_updates
ALTER TABLE public.checkin_task_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and Admins can manage task updates"
  ON public.checkin_task_updates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.hr_checkins 
      WHERE hr_checkins.id = checkin_task_updates.new_checkin_id 
      AND (is_hr_or_admin(auth.uid()) OR hr_checkins.member_id = auth.uid())
    )
  );

-- Create function to get member BAU summary
CREATE OR REPLACE FUNCTION public.get_member_bau_summary(
  p_member_id uuid,
  p_date_range_start date DEFAULT (current_date - interval '30 days')::date,
  p_date_range_end date DEFAULT current_date
)
RETURNS TABLE (
  active_baus_count bigint,
  completed_baus_count bigint,
  at_risk_count bigint,
  avg_progress_percentage numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('Pending', 'In Progress')) as active_baus_count,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed_baus_count,
    COUNT(*) FILTER (WHERE due_date < current_date AND status != 'Completed') as at_risk_count,
    COALESCE(AVG(progress_percentage), 0) as avg_progress_percentage
  FROM public.bau_task_instances
  WHERE assigned_to = p_member_id
    AND created_at::date BETWEEN p_date_range_start AND p_date_range_end;
$$;

-- Create indexes for performance
CREATE INDEX idx_hr_checkins_member_date ON public.hr_checkins(member_id, checkin_date DESC);
CREATE INDEX idx_hr_checkins_checked_in_by ON public.hr_checkins(checked_in_by);
CREATE INDEX idx_followup_tasks_checkin ON public.checkin_followup_tasks(checkin_id);
CREATE INDEX idx_task_updates_original_task ON public.checkin_task_updates(original_task_id);

-- Add updated_at triggers
CREATE TRIGGER update_hr_checkins_updated_at
  BEFORE UPDATE ON public.hr_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_followup_tasks_updated_at
  BEFORE UPDATE ON public.checkin_followup_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
