
import { supabase } from "@/integrations/supabase/client";
import { HRCheckinServiceStats } from "./types";

export const statsUtils = {
  // Get check-in statistics
  async getCheckinStats(userRole?: string, userDepartment?: string, selectedDepartment?: string): Promise<HRCheckinServiceStats> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Get this week's check-ins
    let checkinsQuery = supabase
      .from('hr_checkins')
      .select('id, status, department')
      .gte('checkin_date', oneWeekAgo.toISOString().split('T')[0]);

    // Filter by department based on selection or role
    if (selectedDepartment && selectedDepartment !== "all") {
      checkinsQuery = checkinsQuery.eq('department', selectedDepartment);
    } else if (userRole === 'Team_Lead' && userDepartment) {
      checkinsQuery = checkinsQuery.eq('department', userDepartment);
    }

    const { data: thisWeekCheckins, error: thisWeekError } = await checkinsQuery;

    if (thisWeekError) throw thisWeekError;

    // Get pending follow-up tasks
    let pendingTasksQuery;
    
    if (selectedDepartment && selectedDepartment !== "all") {
      // Filter pending tasks by selected department
      pendingTasksQuery = supabase
        .from('checkin_followup_tasks')
        .select('id, checkin_id, hr_checkins!inner(department)')
        .eq('status', 'Pending')
        .eq('hr_checkins.department', selectedDepartment);
    } else if (userRole === 'Team_Lead' && userDepartment) {
      // For Team Leads, filter pending tasks by department
      pendingTasksQuery = supabase
        .from('checkin_followup_tasks')
        .select('id, checkin_id, hr_checkins!inner(department)')
        .eq('status', 'Pending')
        .eq('hr_checkins.department', userDepartment);
    } else {
      // For Admin/HR, get all pending tasks
      pendingTasksQuery = supabase
        .from('checkin_followup_tasks')
        .select('id')
        .eq('status', 'Pending');
    }

    const { data: pendingTasks, error: pendingError } = await pendingTasksQuery;

    if (pendingError) throw pendingError;

    // Get total active team members to calculate scheduled check-ins
    let membersQuery = supabase
      .from('profiles')
      .select('id')
      .eq('is_active', true);

    // Filter by department based on selection or role
    if (selectedDepartment && selectedDepartment !== "all") {
      membersQuery = membersQuery.eq('department', selectedDepartment);
    } else if (userRole === 'Team_Lead' && userDepartment) {
      membersQuery = membersQuery.eq('department', userDepartment);
    }

    const { data: activeMembers, error: membersError } = await membersQuery;

    if (membersError) throw membersError;

    const completed = thisWeekCheckins?.length || 0;
    const pending = pendingTasks?.length || 0;

    return {
      completed,
      pending
    };
  }
};
