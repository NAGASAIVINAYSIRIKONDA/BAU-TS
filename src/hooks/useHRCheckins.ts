
import { useHRCheckinsState } from "./hrCheckins/useHRCheckinsState";
import { useHRCheckinsQueries } from "./hrCheckins/useHRCheckinsQueries";
import { useHRCheckinsMutations } from "./hrCheckins/useHRCheckinsMutations";
import { UseHRCheckinsReturn } from "./hrCheckins/useHRCheckinsTypes";

export function useHRCheckins(): UseHRCheckinsReturn {
  const {
    selectedDepartment,
    selectedMember,
    memberBAUSummary,
    departmentBAUSummary,
    pendingTasks,
    handleDepartmentChange,
    handleMemberChange,
    loadMemberData,
    loadDepartmentData
  } = useHRCheckinsState();

  const {
    checkins,
    departments,
    teamMembers,
    stats,
    loading,
    error
  } = useHRCheckinsQueries(selectedDepartment);

  const {
    createCheckin,
    updateTaskStatus,
    deleteCheckin,
    isCreating,
    isUpdatingTask,
    isDeleting
  } = useHRCheckinsMutations(
    selectedDepartment,
    selectedMember,
    loadDepartmentData,
    loadMemberData
  );

  return {
    checkins,
    departments,
    teamMembers,
    stats,
    selectedDepartment,
    selectedMember,
    memberBAUSummary,
    departmentBAUSummary,
    pendingTasks,
    loading,
    createCheckin,
    updateTaskStatus,
    deleteCheckin,
    onDepartmentChange: handleDepartmentChange,
    onMemberChange: handleMemberChange,
    isCreating,
    isUpdatingTask,
    isDeleting,
    error
  };
}
