
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";

export interface TeamMemberStats {
  activeMembers: number;
  pendingInvitations: number;
  teamLeads: number;
  newThisMonth: number;
}

export interface UseTeamMembersReturn extends TeamMemberStats {
  teamMembers: TeamMember[];
  loading: boolean;
  createTeamMember: (memberData: CreateTeamMemberData) => Promise<boolean>;
  updateTeamMember: (memberId: string, memberData: Partial<CreateTeamMemberData & { isActive?: boolean }>) => Promise<boolean>;
  deleteTeamMember: (memberId: string) => Promise<boolean>;
  resendInvitation: (memberId: string) => Promise<boolean>;
  refreshTeamMembers: () => Promise<void>;
}
