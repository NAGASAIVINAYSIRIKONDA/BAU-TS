import { supabase } from "@/integrations/supabase/client";
import { HRCheckin, TeamMemberOption, DepartmentOption } from "@/types/hrCheckin";

export const checkinDataFetchers = {
  // Get all check-ins
  async getCheckins(): Promise<HRCheckin[]> {
    const { data, error } = await supabase
      .from('hr_checkins')
      .select(`
        *,
        profiles!hr_checkins_member_id_fkey(id, first_name, last_name, email, department),
        checked_in_by_profile:profiles!hr_checkins_checked_in_by_fkey(first_name, last_name)
      `)
      .order('checkin_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Normal' | 'Needs Support'
    }));
  },

  // Get check-ins for a specific member
  async getMemberCheckins(memberId: string): Promise<HRCheckin[]> {
    const { data, error } = await supabase
      .from('hr_checkins')
      .select(`
        *,
        profiles!hr_checkins_member_id_fkey(id, first_name, last_name, email, department),
        checked_in_by_profile:profiles!hr_checkins_checked_in_by_fkey(first_name, last_name)
      `)
      .eq('member_id', memberId)
      .order('checkin_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Normal' | 'Needs Support'
    }));
  },

  // Get departments for dropdown
  async getDepartments(): Promise<DepartmentOption[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('name, description')
      .order('name', { ascending: true });

    if (error) throw error;

    // Get member counts for each department
    const departmentsWithCounts = await Promise.all(
      (data || []).map(async (dept) => {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('department', dept.name)
          .eq('is_active', true);
        
        return {
          name: dept.name,
          member_count: count || 0
        };
      })
    );

    return departmentsWithCounts.filter(dept => dept.member_count > 0);
  },

  // Get team members for dropdowns (filtered by department)
  async getTeamMembersByDepartment(departmentName?: string): Promise<TeamMemberOption[]> {
    let query = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, department')
      .eq('is_active', true);

    if (departmentName) {
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
  },

  // Get team members (all)
  async getTeamMembers(): Promise<TeamMemberOption[]> {
    return this.getTeamMembersByDepartment();
  }
};
