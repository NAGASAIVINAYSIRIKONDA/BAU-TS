
import { useUserProfile } from './useUserProfile';
import { AppRole } from '@/types/teamMember';

export function useUserRole() {
  const { data: userProfile, isLoading } = useUserProfile();
  
  const role = userProfile?.user_roles?.[0]?.role as AppRole | undefined;
  const department = userProfile?.department;
  
  const isAdmin = role === 'Admin';
  const isHR = role === 'HR';
  const isTeamLead = role === 'Team_Lead';
  const isTeamMember = role === 'Team_Member';
  
  const isHROrAdmin = isAdmin || isHR;
  const canManageTemplates = isAdmin || isHR || isTeamLead;
  const canManageDepartments = isAdmin || isHR;
  const canManageTeamMembers = isAdmin || isHR;
  
  return {
    role,
    department,
    isAdmin,
    isHR,
    isTeamLead,
    isTeamMember,
    isHROrAdmin,
    canManageTemplates,
    canManageDepartments,
    canManageTeamMembers,
    isLoading
  };
}
