
import { checkinDataFetchers } from "./dataFetchers";
import { statsUtils } from "./statsUtils";
import { taskService } from "./taskService";
import { bauSummaryService } from "./bauSummaryService";
import { checkinCreator } from "./checkinCreator";
import { supabase } from "@/integrations/supabase/client";

export const hrCheckinService = {
  // Data fetching methods
  getCheckins: checkinDataFetchers.getCheckins,
  getMemberCheckins: checkinDataFetchers.getMemberCheckins,
  getDepartments: checkinDataFetchers.getDepartments,
  getTeamMembersByDepartment: checkinDataFetchers.getTeamMembersByDepartment,
  getTeamMembers: checkinDataFetchers.getTeamMembers,

  // Statistics methods
  getCheckinStats: (userRole?: string, userDepartment?: string, selectedDepartment?: string) => statsUtils.getCheckinStats(userRole, userDepartment, selectedDepartment),

  // Task management methods
  getFollowupTasks: taskService.getFollowupTasks,
  getPendingTasksForMember: taskService.getPendingTasksForMember,
  getPendingTasksForDepartment: taskService.getPendingTasksForDepartment,
  updateTaskStatus: taskService.updateTaskStatus,
  updateTaskAssignment: taskService.updateTaskAssignment,

  // BAU summary methods
  getMemberBAUSummary: bauSummaryService.getMemberBAUSummary,
  getDepartmentBAUSummary: bauSummaryService.getDepartmentBAUSummary,

  // Check-in creation
  createCheckin: checkinCreator.createCheckin,

  // Check-in deletion
  async deleteCheckin(checkinId: string): Promise<void> {
    const { error } = await supabase
      .from('hr_checkins')
      .delete()
      .eq('id', checkinId);

    if (error) throw error;
  }
};
