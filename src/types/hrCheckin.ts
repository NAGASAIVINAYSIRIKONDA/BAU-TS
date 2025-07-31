
export interface HRCheckin {
  id: string;
  member_id: string | null;
  checked_in_by: string;
  checkin_date: string;
  department: string | null;
  notes: string | null;
  status: 'Normal' | 'Needs Support';
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    department: string | null;
  };
  checked_in_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CheckinFollowupTask {
  id: string;
  checkin_id: string;
  task_description: string;
  status: 'Pending' | 'Done' | 'Not Done';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckinTaskUpdate {
  id: string;
  original_task_id: string;
  new_checkin_id: string;
  previous_status: string;
  new_status: string;
  updated_at: string;
}

export interface MemberBAUSummary {
  active_baus_count: number;
  completed_baus_count: number;
  at_risk_count: number;
  avg_progress_percentage: number;
}

export interface DepartmentBAUSummary {
  department: string;
  total_members: number;
  active_baus_count: number;
  completed_baus_count: number;
  at_risk_count: number;
  avg_progress_percentage: number;
}

export interface CreateHRCheckinData {
  type: 'individual' | 'department';
  member_id?: string;
  checkin_date: string;
  department?: string;
  notes?: string;
  followup_tasks: Array<{ description: string; assignedTo?: string }>;
}

export interface TeamMemberOption {
  id: string;
  name: string;
  display_name: string;
  email: string;
  department: string | null;
}

export interface DepartmentOption {
  name: string;
  member_count: number;
}
