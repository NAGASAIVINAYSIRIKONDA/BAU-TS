import { useState } from "react";
import { BAUTaskWithProgress, CreateBAUProgressEntryData } from "@/types/bauTask";
import { BAUTaskCard } from "./BAUTaskCard";
import { ProgressTrackingModal } from "./ProgressTrackingModal";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

interface BAUTaskListProps {
  tasks: BAUTaskWithProgress[];
  loading: boolean;
  onUpdateStatus: (taskId: string, status: string) => Promise<boolean>;
  onSubmitProgress: (periodId: string, entries: CreateBAUProgressEntryData[]) => Promise<boolean>;
  onUpdateProgress: (entryId: string, updates: { recorded_value: number; notes?: string | null }) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
}

export function BAUTaskList({ tasks, loading, onUpdateStatus, onSubmitProgress, onUpdateProgress, onDeleteTask }: BAUTaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());
  
  const [progressModal, setProgressModal] = useState<{ open: boolean; task: BAUTaskWithProgress | null }>({
    open: false,
    task: null
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; taskId: string; taskTitle: string }>({
    open: false,
    taskId: "",
    taskTitle: ""
  });

  const handleUpdateStatus = async (taskId: string, status: string) => {
    // Add optimistic update
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    
    try {
      const success = await onUpdateStatus(taskId, status);
      if (!success) {
        // If update failed, we could show an error toast here
        console.error('Failed to update task status');
      }
    } finally {
      // Remove loading state after update completes
      setTimeout(() => {
        setUpdatingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 500); // Small delay to show the animation
    }
  };

  const handleOpenProgress = (task: BAUTaskWithProgress) => {
    setProgressModal({ open: true, task });
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setDeleteDialog({ open: true, taskId, taskTitle });
  };

  const handleDeleteConfirm = async () => {
    const success = await onDeleteTask(deleteDialog.taskId);
    if (success) {
      setDeleteDialog({ open: false, taskId: "", taskTitle: "" });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading tasks...
      </div>
    );
  }

  return (
    <>
      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No BAU tasks found. Tasks will appear here when they are created from templates or when filters are cleared.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <BAUTaskCard
              key={task.id}
              task={task}
              onUpdateStatus={handleUpdateStatus}
              onOpenProgress={handleOpenProgress}
              onDelete={handleDeleteTask}
              isUpdatingStatus={updatingTasks.has(task.id)}
            />
          ))}
        </div>
      )}

      <ProgressTrackingModal
        task={progressModal.task}
        open={progressModal.open}
        onOpenChange={(open) => setProgressModal({ open, task: open ? progressModal.task : null })}
        onSubmitProgress={onSubmitProgress}
        onUpdateProgress={onUpdateProgress}
      />

      <DeleteTaskDialog
        open={deleteDialog.open}
        taskTitle={deleteDialog.taskTitle}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}