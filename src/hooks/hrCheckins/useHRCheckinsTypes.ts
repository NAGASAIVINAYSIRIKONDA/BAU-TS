
import { HRCheckin, CreateHRCheckinData, TeamMemberOption, MemberBAUSummary, DepartmentBAUSummary, CheckinFollowupTask, DepartmentOption } from "@/types/hrCheckin";
import { HRCheckinServiceStats } from "./types";

export interface UseHRCheckinsState {
  selectedDepartment: string;
  selectedMember: string;
  memberBAUSummary: MemberBAUSummary | null;
  departmentBAUSummary: DepartmentBAUSummary | null;
  pendingTasks: CheckinFollowupTask[];
}

export interface UseHRCheckinsReturn {
  checkins: HRCheckin[];
  departments: DepartmentOption[];
  teamMembers: TeamMemberOption[];
  stats: HRCheckinServiceStats;
  selectedDepartment: string;
  selectedMember: string;
  memberBAUSummary: MemberBAUSummary | null;
  departmentBAUSummary: DepartmentBAUSummary | null;
  pendingTasks: CheckinFollowupTask[];
  loading: boolean;
  createCheckin: (data: CreateHRCheckinData) => Promise<HRCheckin>;
  updateTaskStatus: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => Promise<void>;
  deleteCheckin: (checkinId: string) => Promise<void>;
  onDepartmentChange: (department: string) => void;
  onMemberChange: (memberId: string) => void;
  isCreating: boolean;
  isUpdatingTask: boolean;
  isDeleting: boolean;
  error: Error | null;
}
