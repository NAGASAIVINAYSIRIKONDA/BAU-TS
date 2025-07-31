
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HRCheckInModalContent } from "./HRCheckInModalContent";
import { HRCheckInModalActions } from "./HRCheckInModalActions";
import { CreateHRCheckinData, CheckinFollowupTask, DepartmentOption, TeamMemberOption } from "@/types/hrCheckin";
import { format } from "date-fns";

interface QueuedTaskUpdate {
  taskId: string;
  status: 'Done' | 'Not Done';
}

interface HRCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentOption[];
  teamMembers: TeamMemberOption[];
  departmentBAUSummary: any;
  pendingTasks: CheckinFollowupTask[];
  onSubmit: (data: CreateHRCheckinData) => Promise<string>;
  onDepartmentChange: (department: string) => void;
  onTaskStatusChange: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
  isSubmitting: boolean;
}

export function HRCheckInModal({
  open,
  onOpenChange,
  departments,
  teamMembers,
  departmentBAUSummary,
  pendingTasks,
  onSubmit,
  onDepartmentChange,
  onTaskStatusChange,
  isSubmitting
}: HRCheckInModalProps) {
  const [formData, setFormData] = useState({
    type: 'department' as 'individual' | 'department',
    department: '',
    memberId: '',
    status: 'Normal' as 'Normal' | 'Needs Support',
    notes: '',
    followUpTasks: [] as Array<{ description: string; assignedTo?: string }>,
    checkin_date: format(new Date(), 'yyyy-MM-dd')
  });

  const [queuedTaskUpdates, setQueuedTaskUpdates] = useState<QueuedTaskUpdate[]>([]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        type: 'department',
        department: '',
        memberId: '',
        status: 'Normal',
        notes: '',
        followUpTasks: [],
        checkin_date: format(new Date(), 'yyyy-MM-dd')
      });
      setQueuedTaskUpdates([]);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.department && formData.type === 'department') return;
    if (!formData.memberId && formData.type === 'individual') return;

    const checkinData: CreateHRCheckinData = {
      type: formData.type,
      department: formData.type === 'department' ? formData.department : undefined,
      member_id: formData.type === 'individual' ? formData.memberId : undefined,
      checkin_date: formData.checkin_date,
      notes: formData.notes.trim() || undefined,
      followup_tasks: formData.followUpTasks
    };

    try {
      // First create the check-in
      const checkinId = await onSubmit(checkinData);
      
      // Then apply all queued task status changes with the actual check-in ID
      for (const update of queuedTaskUpdates) {
        await onTaskStatusChange(update.taskId, update.status, checkinId);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating check-in:', error);
    }
  };

  const handleTaskStatusChange = (taskId: string, status: 'Done' | 'Not Done') => {
    // Queue the task status change instead of applying immediately
    setQueuedTaskUpdates(prev => {
      // Remove any existing update for this task
      const filtered = prev.filter(update => update.taskId !== taskId);
      // Add the new update
      return [...filtered, { taskId, status }];
    });
  };

  // Ensure canSubmit is properly calculated as a boolean
  const canSubmit: boolean = Boolean(
    (formData.type === 'department' && formData.department) ||
    (formData.type === 'individual' && formData.memberId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create HR Check-In</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <HRCheckInModalContent
            formData={formData}
            setFormData={setFormData}
            departments={departments}
            teamMembers={teamMembers}
            departmentBAUSummary={departmentBAUSummary}
            pendingTasks={pendingTasks}
            onDepartmentChange={onDepartmentChange}
            onTaskStatusChange={handleTaskStatusChange}
            currentCheckinId={null}
            queuedTaskUpdates={queuedTaskUpdates}
          />
          
          <HRCheckInModalActions
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
