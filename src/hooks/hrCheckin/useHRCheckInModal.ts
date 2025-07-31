
import { useState, useEffect } from "react";
import { CreateHRCheckinData, CheckinFollowupTask } from "@/types/hrCheckin";
import { format } from "date-fns";

interface UseHRCheckInModalProps {
  open: boolean;
  onSubmit: (data: CreateHRCheckinData) => Promise<string>;
  onTaskStatusChange: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
  onDepartmentChange: (department: string) => void;
}

interface QueuedTaskUpdate {
  taskId: string;
  status: 'Done' | 'Not Done';
}

export function useHRCheckInModal({
  open,
  onSubmit,
  onTaskStatusChange,
  onDepartmentChange
}: UseHRCheckInModalProps) {
  const [formData, setFormData] = useState({
    department: "",
    checkin_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ""
  });

  const [newTasks, setNewTasks] = useState<Array<{ description: string; assignedTo?: string }>>([]);
  const [queuedTaskUpdates, setQueuedTaskUpdates] = useState<QueuedTaskUpdate[]>([]);

  // Handle department change
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({ ...prev, department }));
    onDepartmentChange(department);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        department: "",
        checkin_date: format(new Date(), 'yyyy-MM-dd'),
        notes: ""
      });
      setNewTasks([]);
      setQueuedTaskUpdates([]);
    }
  }, [open]);

  // Queue task status changes instead of applying them immediately
  const handleTaskStatusChange = (taskId: string, status: 'Done' | 'Not Done') => {
    setQueuedTaskUpdates(prev => {
      // Remove any existing update for this task
      const filtered = prev.filter(update => update.taskId !== taskId);
      // Add the new update
      return [...filtered, { taskId, status }];
    });
  };

  const handleSubmit = async () => {
    if (!formData.department) {
      return;
    }

    const submitData: CreateHRCheckinData = {
      type: 'department',
      member_id: "", // Empty string for department-wide check-in (will be converted to null)
      checkin_date: formData.checkin_date,
      department: formData.department,
      notes: formData.notes,
      followup_tasks: newTasks
    };

    try {
      // First create the check-in
      const checkinId = await onSubmit(submitData);
      
      // Then apply all queued task status changes
      for (const update of queuedTaskUpdates) {
        await onTaskStatusChange(update.taskId, update.status, checkinId);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      throw error;
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Helper function to get the current status of a task (either from queue or original)
  const getTaskStatus = (taskId: string, originalStatus: 'Pending' | 'Done' | 'Not Done') => {
    const queuedUpdate = queuedTaskUpdates.find(update => update.taskId === taskId);
    return queuedUpdate ? queuedUpdate.status : originalStatus;
  };

  return {
    formData,
    newTasks,
    queuedTaskUpdates,
    handleDepartmentChange,
    handleTaskStatusChange,
    handleSubmit,
    updateFormData,
    setNewTasks,
    getTaskStatus
  };
}
