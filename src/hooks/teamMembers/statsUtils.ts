
import { TeamMember } from "@/types/teamMember";
import { TeamMemberStats } from "./types";

export const calculateTeamMemberStats = (teamMembers: TeamMember[]): TeamMemberStats => {
  const activeMembers = teamMembers.filter(m => m.is_active && !m.isPendingInvitation).length;
  const pendingInvitations = teamMembers.filter(m => m.isPendingInvitation).length;
  const teamLeads = teamMembers.filter(m => m.role === 'Team_Lead' && m.is_active).length;
  const newThisMonth = teamMembers.filter(m => {
    if (!m.created_at || !m.is_active) return false;
    const memberDate = new Date(m.created_at);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return memberDate >= thisMonth;
  }).length;

  return {
    activeMembers,
    pendingInvitations,
    teamLeads,
    newThisMonth
  };
};
