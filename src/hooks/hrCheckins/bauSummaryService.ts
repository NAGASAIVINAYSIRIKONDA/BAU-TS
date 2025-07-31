
import { supabase } from "@/integrations/supabase/client";
import { MemberBAUSummary, DepartmentBAUSummary } from "@/types/hrCheckin";

export const bauSummaryService = {
  // Get member BAU summary
  async getMemberBAUSummary(memberId: string): Promise<MemberBAUSummary> {
    const { data, error } = await supabase
      .rpc('get_member_bau_summary', { p_member_id: memberId });

    if (error) throw error;
    return data?.[0] || {
      active_baus_count: 0,
      completed_baus_count: 0,
      at_risk_count: 0,
      avg_progress_percentage: 0
    };
  },

  // Get department BAU summary
  async getDepartmentBAUSummary(departmentName: string): Promise<DepartmentBAUSummary> {
    // Get all members in the department
    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('department', departmentName)
      .eq('is_active', true);

    if (membersError) throw membersError;

    if (!members || members.length === 0) {
      return {
        department: departmentName,
        total_members: 0,
        active_baus_count: 0,
        completed_baus_count: 0,
        at_risk_count: 0,
        avg_progress_percentage: 0
      };
    }

    // Get BAU summary for all members in the department
    const memberIds = members.map(m => m.id);
    const { data: bauTasks, error: bauError } = await supabase
      .from('bau_task_instances')
      .select('status, progress_percentage, due_date')
      .in('assigned_to', memberIds);

    if (bauError) throw bauError;

    const tasks = bauTasks || [];
    const activeBaus = tasks.filter(t => ['Pending', 'In Progress'].includes(t.status)).length;
    const completedBaus = tasks.filter(t => t.status === 'Completed').length;
    const atRiskBaus = tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Completed').length;
    const avgProgress = tasks.length > 0 
      ? tasks.reduce((sum, t) => sum + (Number(t.progress_percentage) || 0), 0) / tasks.length 
      : 0;

    return {
      department: departmentName,
      total_members: members.length,
      active_baus_count: activeBaus,
      completed_baus_count: completedBaus,
      at_risk_count: atRiskBaus,
      avg_progress_percentage: avgProgress
    };
  }
};
