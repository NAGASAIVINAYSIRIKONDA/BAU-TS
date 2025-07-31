
import { useUserRole } from './useUserRole';

export function useDepartmentAwareData() {
  const { role, department, isHROrAdmin, isTeamLead } = useUserRole();
  
  // Determine what data the user should see based on their role
  const shouldFilterByDepartment = isTeamLead && department;
  const shouldShowOnlyOwnData = role === 'Team_Member';
  
  // Get department filter for queries
  const getDepartmentFilter = () => {
    if (isHROrAdmin) return undefined; // Can see all departments
    if (isTeamLead && department) return department;
    return department; // Team members see their department data
  };
  
  // Get user filter for queries (Team_Member should only see their data)
  const getUserFilter = (userId?: string) => {
    if (isHROrAdmin) return undefined; // Can see all users
    if (isTeamLead) return undefined; // Can see department users (handled by department filter)
    return userId; // Team members see only their data
  };
  
  return {
    shouldFilterByDepartment,
    shouldShowOnlyOwnData,
    departmentFilter: getDepartmentFilter(),
    getUserFilter,
    canAccessAllDepartments: isHROrAdmin,
    canAccessDepartmentData: isHROrAdmin || isTeamLead,
    userDepartment: department
  };
}
