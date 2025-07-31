import { useToast } from "@/hooks/use-toast";
import { BAUTaskWithProgress, CreateBAUTaskInstanceData, UpdateBAUTaskInstanceData, CreateBAUProgressEntryData } from "@/types/bauTask";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  createBAUTask, 
  updateBAUTask, 
  deleteBAUTask,
  submitProgressEntry,
  updateBAUProgressEntry
} from "./bauTasks/bauTaskService";
import { 
  fetchDepartmentAwareBAUTasks,
  fetchDepartmentAwareAvailableMonths
} from "./bauTasks/departmentAwareBauTaskService";
import { calculateBAUTaskStats, BAUTaskStats } from "./bauTasks/statsUtils";
import { TOAST_MESSAGES } from "./bauTasks/toastMessages";
import { useUserRole } from "./useUserRole";

export function useBAUTasks(selectedDate?: Date) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { role, department } = useUserRole();

  const { data: tasks = [], isLoading: loading } = useAuthenticatedQuery({
    queryKey: ['bauTasks', selectedDate?.toISOString(), role, department],
    queryFn: async () => {
      console.log('Fetching department-aware BAU tasks for user:', user?.id, 'role:', role, 'department:', department);
      const tasksData = await fetchDepartmentAwareBAUTasks(selectedDate, role, department || undefined, user?.id);
      console.log('Department-aware BAU tasks loaded:', tasksData.length);
      return tasksData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: availableMonths = [] } = useAuthenticatedQuery({
    queryKey: ['bauTasksAvailableMonths', role, department],
    queryFn: async () => {
      console.log('Fetching available months for user:', user?.id, 'role:', role, 'department:', department);
      const months = await fetchDepartmentAwareAvailableMonths(role, department || undefined, user?.id);
      console.log('Available months loaded:', months.length);
      return months;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTaskMutation = useMutation({
    mutationFn: createBAUTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTasks'] });
      toast({
        title: "Success",
        description: TOAST_MESSAGES.CREATE_SUCCESS,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.CREATE_ERROR,
        variant: "destructive",
      });
      console.error('Error creating BAU task:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateBAUTaskInstanceData }) => 
      updateBAUTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTasks'] });
      toast({
        title: "Success",
        description: TOAST_MESSAGES.UPDATE_SUCCESS,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.UPDATE_ERROR,
        variant: "destructive",
      });
      console.error('Error updating task:', error);
    },
  });

  const submitProgressMutation = useMutation({
    mutationFn: ({ periodId, entries }: { periodId: string; entries: CreateBAUProgressEntryData[] }) => 
      submitProgressEntry(periodId, entries),
    onSuccess: () => {
      // Invalidate all related queries to force fresh data
      queryClient.invalidateQueries({ queryKey: ['authenticated'] });
      queryClient.removeQueries({ queryKey: ['bauTasks'] }); // Force complete refresh
      toast({
        title: "Success",
        description: "Progress recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record progress",
        variant: "destructive",
      });
      console.error('Error submitting progress:', error);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: { recorded_value: number; notes?: string | null } }) => 
      updateBAUProgressEntry(entryId, updates),
    onSuccess: () => {
      // Invalidate all related queries to force fresh data
      queryClient.invalidateQueries({ queryKey: ['authenticated'] });
      queryClient.removeQueries({ queryKey: ['bauTasks'] }); // Force complete refresh
      toast({
        title: "Success",
        description: "Progress updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive",
      });
      console.error('Error updating progress:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteBAUTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTasks'] });
      toast({
        title: "Success",
        description: TOAST_MESSAGES.DELETE_SUCCESS,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.DELETE_ERROR,
        variant: "destructive",
      });
      console.error('Error deleting task:', error);
    },
  });

  const stats: BAUTaskStats = calculateBAUTaskStats(tasks);

  return {
    tasks,
    availableMonths,
    loading,
    stats,
    createTask: async (taskData: CreateBAUTaskInstanceData): Promise<boolean> => {
      try {
        await createTaskMutation.mutateAsync(taskData);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    updateTask: async (taskId: string, updates: UpdateBAUTaskInstanceData): Promise<boolean> => {
      try {
        await updateTaskMutation.mutateAsync({ taskId, updates });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    submitProgress: async (periodId: string, entries: CreateBAUProgressEntryData[]): Promise<boolean> => {
      try {
        await submitProgressMutation.mutateAsync({ periodId, entries });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    updateProgress: async (entryId: string, updates: { recorded_value: number; notes?: string | null }): Promise<boolean> => {
      try {
        await updateProgressMutation.mutateAsync({ entryId, updates });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    deleteTask: async (taskId: string): Promise<boolean> => {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    refreshTasks: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTasks'] });
    }
  };
}
