
import { useState } from "react";
import { HRCheckin, CheckinFollowupTask } from "@/types/hrCheckin";
import { ViewCheckinModal } from "./ViewCheckinModal";
import { DeleteCheckinDialog } from "./DeleteCheckinDialog";

interface HRCheckInTableModalsProps {
  selectedCheckin: HRCheckin | null;
  followupTasks: CheckinFollowupTask[];
  viewModalOpen: boolean;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  onViewModalChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
}

export function HRCheckInTableModals({
  selectedCheckin,
  followupTasks,
  viewModalOpen,
  deleteDialogOpen,
  isDeleting,
  onViewModalChange,
  onDeleteDialogChange,
  onConfirmDelete,
  onTaskStatusChange
}: HRCheckInTableModalsProps) {
  return (
    <>
      <ViewCheckinModal
        open={viewModalOpen}
        onOpenChange={onViewModalChange}
        checkin={selectedCheckin}
        followupTasks={followupTasks}
        onTaskStatusChange={onTaskStatusChange}
      />

      <DeleteCheckinDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        checkin={selectedCheckin}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
