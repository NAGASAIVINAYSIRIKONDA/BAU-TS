
import { supabase } from "@/integrations/supabase/client";
import { CheckinFollowupTask } from "@/types/hrCheckin";

export const taskService = {
  // New method for Tasks tab - gets all tasks across all check-ins
  async getAllTasks(): Promise<CheckinFollowupTask[]> {
    console.log('Fetching all tasks...');
    
    const { data, error } = await supabase
      .from('checkin_followup_tasks')
      .select(`
        *,
        hr_checkins (
          id,
          member_id,
          department,
          checkin_date,
          profiles!hr_checkins_member_id_fkey (
            first_name,
            last_name,
            department
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all tasks:', error);
      throw error;
    }

    console.log('Fetched tasks data:', data);

    const mappedTasks = (data || []).map(item => ({
      ...item,
      status: item.status as 'Pending' | 'Done' | 'Not Done'
    }));

    console.log('Mapped tasks:', mappedTasks);
    return mappedTasks;
  },

  // Get follow-up tasks for a check-in
  async getFollowupTasks(checkinId: string): Promise<CheckinFollowupTask[]> {
    const { data, error } = await supabase
      .from('checkin_followup_tasks')
      .select('*')
      .eq('checkin_id', checkinId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Pending' | 'Done' | 'Not Done'
    }));
  },

  // Get pending follow-up tasks for a member (for individual continuity)
  async getPendingTasksForMember(memberId: string): Promise<CheckinFollowupTask[]> {
    const { data, error } = await supabase
      .from('checkin_followup_tasks')
      .select(`
        *,
        hr_checkins!inner(member_id, department)
      `)
      .eq('hr_checkins.member_id', memberId)
      .is('hr_checkins.department', null) // Individual check-ins have null department
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Pending' | 'Done' | 'Not Done'
    }));
  },

  // Get pending follow-up tasks for a department (for department-wide continuity)
  async getPendingTasksForDepartment(departmentName: string): Promise<CheckinFollowupTask[]> {
    const { data, error } = await supabase
      .from('checkin_followup_tasks')
      .select(`
        *,
        hr_checkins!inner(member_id, department)
      `)
      .eq('hr_checkins.department', departmentName)
      .not('hr_checkins.department', 'is', null) // Department-wide check-ins have non-null department
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as 'Pending' | 'Done' | 'Not Done'
    }));
  },

  // Update task status
  async updateTaskStatus(taskId: string, newStatus: 'Done' | 'Not Done', newCheckinId: string): Promise<void> {
    // Get the current task to record the previous status
    const { data: currentTask, error: getError } = await supabase
      .from('checkin_followup_tasks')
      .select('status')
      .eq('id', taskId)
      .single();

    if (getError) throw getError;

    // Update the task status
    const { error: updateError } = await supabase
      .from('checkin_followup_tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // Record the status change
    const { error: trackError } = await supabase
      .from('checkin_task_updates')
      .insert({
        original_task_id: taskId,
        new_checkin_id: newCheckinId,
        previous_status: currentTask.status,
        new_status: newStatus
      });

    if (trackError) throw trackError;
  },

  // Update task assignment
  async updateTaskAssignment(taskId: string, assignedTo: string | null): Promise<void> {
    const { error } = await supabase
      .from('checkin_followup_tasks')
      .update({
        assigned_to: assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task assignment:', error);
      throw error;
    }
  }
};
