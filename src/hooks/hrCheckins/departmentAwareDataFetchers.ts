
import { supabase } from "@/integrations/supabase/client";
import { HRCheckin, TeamMemberOption, DepartmentOption } from "@/types/hrCheckin";

// Get check-ins filtered by user role and department
export async function getDepartmentAwareCheckins(
  selectedDepartment?: string,
  userRole?: string,
  userDepartment?: string,
  userId?: string
): Promise<HRCheckin[]> {
    let query = supabase
      .from('hr_checkins')
      .select(`
        *,
        profiles!hr_checkins_member_id_fkey(id, first_name, last_name, email, department),
        checked_in_by_profile:profiles!hr_checkins_checked_in_by_fkey(first_name, last_name)
      `);

    // Apply role-based filtering
    if (userRole === 'Team_Member' && userId) {
      // Team members only see their own check-ins
      query = query.eq('member_id', userId);
    } else if (userRole === 'Team_Lead' && userDepartment) {
      // Team leads see check-ins for their department
      // Filter by department field directly since that's where we store the department
      query = query.eq('department', userDepartment);
    }
    // Admin and HR see all check-ins (no additional filtering)

    // Apply additional department filter if provided (unless "all" is selected)
    if (selectedDepartment && selectedDepartment !== "all") {
      query = query.eq('department', selectedDepartment);
    }

    const { data, error } = await query.order('checkin_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Normal' | 'Needs Support'
    }));
}

// Get departments that the user can access
export async function getAccessibleDepartments(
  userRole?: string,
  userDepartment?: string
): Promise<DepartmentOption[]> {
    let query = supabase
      .from('departments')
      .select('name, description')
      .order('name', { ascending: true });

    // Team leads can only see their own department
    if (userRole === 'Team_Lead' && userDepartment) {
      query = query.eq('name', userDepartment);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get member counts for each department
    const departmentsWithCounts = await Promise.all(
      (data || []).map(async (dept) => {
        let memberQuery = supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.name)
          .eq('is_active', true);

        const { count } = await memberQuery;
        
        return {
          name: dept.name,
          member_count: count || 0
        };
      })
    );

    return departmentsWithCounts.filter(dept => dept.member_count > 0);
}

// Get team members that the user can access
export async function getAccessibleTeamMembers(
  departmentName?: string,
  userRole?: string,
  userDepartment?: string,
  userId?: string
): Promise<TeamMemberOption[]> {
    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, department')
      .eq('is_active', true);

    // Apply role-based filtering
    if (userRole === 'Team_Member' && userId) {
      // Team members can only see themselves
      query = query.eq('id', userId);
    } else if (userRole === 'Team_Lead' && userDepartment) {
      // Team leads can only see their department members
      query = query.eq('department', userDepartment);
    } else if (departmentName) {
      // Filter by specific department if provided
      query = query.eq('department', departmentName);
    }

    const { data, error } = await query.order('first_name', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(member => ({
      id: member.id,
      name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
      display_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
      email: member.email,
      department: member.department
    }));
}
