
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hrCheckinService } from "./hrCheckinService";
import { CreateHRCheckinData, HRCheckin } from "@/types/hrCheckin";
import { useToast } from "@/hooks/use-toast";

export function useHRCheckinsMutations(
  selectedDepartment: string,
  selectedMember: string,
  loadDepartmentData: (department: string) => Promise<void>,
  loadMemberData: (memberId: string) => Promise<void>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create check-in mutation
  const createCheckinMutation = useMutation({
    mutationFn: hrCheckinService.createCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['checkin-stats'] });
      toast({
        title: "Success",
        description: "Check-in created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status, checkinId }: { taskId: string; status: 'Done' | 'Not Done'; checkinId: string }) =>
      hrCheckinService.updateTaskStatus(taskId, status, checkinId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
      // Refresh pending tasks for the selected department or member
      if (selectedDepartment && !selectedMember) {
        loadDepartmentData(selectedDepartment);
      } else if (selectedMember) {
        loadMemberData(selectedMember);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete check-in mutation
  const deleteCheckinMutation = useMutation({
    mutationFn: hrCheckinService.deleteCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['checkin-stats'] });
      toast({
        title: "Success",
        description: "Check-in deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createCheckin = async (data: CreateHRCheckinData): Promise<HRCheckin> => {
    return createCheckinMutation.mutateAsync(data);
  };

  const updateTaskStatus = async (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => {
    return updateTaskMutation.mutateAsync({ taskId, status, checkinId });
  };

  const deleteCheckin = async (checkinId: string) => {
    return deleteCheckinMutation.mutateAsync(checkinId);
  };

  return {
    createCheckin,
    updateTaskStatus,
    deleteCheckin,
    isCreating: createCheckinMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeleting: deleteCheckinMutation.isPending
  };
}
