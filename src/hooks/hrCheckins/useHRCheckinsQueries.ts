
import { useQuery } from "@tanstack/react-query";
import { hrCheckinService } from "./hrCheckinService";
import { getDepartmentAwareCheckins, getAccessibleDepartments, getAccessibleTeamMembers } from "./departmentAwareDataFetchers";
import { useUserRole } from "../useUserRole";

export function useHRCheckinsQueries(selectedDepartment: string) {
  const { role, department: userDepartment } = useUserRole();
  
  // Get department-aware check-ins
  const {
    data: checkins = [],
    isLoading: checkinsLoading,
    error: checkinsError
  } = useQuery({
    queryKey: ['hr-checkins', role, userDepartment, selectedDepartment],
    queryFn: () => getDepartmentAwareCheckins(selectedDepartment, role, userDepartment)
  });

  // Get accessible departments
  const {
    data: departments = [],
    isLoading: departmentsLoading
  } = useQuery({
    queryKey: ['departments-dropdown', role, userDepartment],
    queryFn: () => getAccessibleDepartments(role, userDepartment)
  });

  // Get accessible team members (filtered by department and role)
  const {
    data: teamMembers = [],
    isLoading: membersLoading
  } = useQuery({
    queryKey: ['team-members-dropdown', selectedDepartment, role, userDepartment],
    queryFn: () => getAccessibleTeamMembers(selectedDepartment || undefined, role, userDepartment),
    enabled: !!selectedDepartment
  });

  // Get check-in stats
  const {
    data: stats = { completed: 0, pending: 0 },
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['checkin-stats', role, userDepartment, selectedDepartment],
    queryFn: () => hrCheckinService.getCheckinStats(role, userDepartment, selectedDepartment)
  });

  return {
    checkins,
    departments,
    teamMembers,
    stats,
    loading: checkinsLoading || departmentsLoading || membersLoading || statsLoading,
    error: checkinsError
  };
}
