
import { Database } from "@/integrations/supabase/types";

export type BAUTaskInstance = Database["public"]["Tables"]["bau_task_instances"]["Row"];
export type CreateBAUTaskInstanceData = Database["public"]["Tables"]["bau_task_instances"]["Insert"];
export type UpdateBAUTaskInstanceData = Database["public"]["Tables"]["bau_task_instances"]["Update"];

export type TaskKPIRecord = Database["public"]["Tables"]["task_kpi_records"]["Row"];
export type CreateTaskKPIRecordData = Database["public"]["Tables"]["task_kpi_records"]["Insert"];

export type BAUProgressPeriod = Database["public"]["Tables"]["bau_progress_periods"]["Row"];
export type BAUProgressEntry = Database["public"]["Tables"]["bau_progress_entries"]["Row"];
export type CreateBAUProgressEntryData = Database["public"]["Tables"]["bau_progress_entries"]["Insert"];

export type BAUTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
export type BAUTaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface BAUTaskWithDetails extends BAUTaskInstance {
  bau_templates: {
    id: string;
    name: string;
    frequency: string;
    template_kpis: {
      id: string;
      name: string;
      unit: string;
      operator: string;
      target_value: number;
    }[];
  } | null;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    department: string | null;
  } | null;
  task_kpi_records: TaskKPIRecord[];
  bau_progress_periods?: BAUProgressPeriod[];
}

export interface BAUTaskWithProgress extends BAUTaskWithDetails {
  bau_progress_periods: (BAUProgressPeriod & {
    bau_progress_entries: BAUProgressEntry[];
  })[];
}

export interface CreateBAUTaskFormData {
  templateId: string;
  assignedTo: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: BAUTaskPriority;
}

export interface ProgressEntryFormData {
  periodId: string;
  entries: {
    templateKpiId: string;
    recordedValue: number;
    notes?: string;
  }[];
}
