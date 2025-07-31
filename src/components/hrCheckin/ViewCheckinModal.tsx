
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HRCheckin, CheckinFollowupTask } from "@/types/hrCheckin";
import { format } from "date-fns";
import { Calendar, User, Building2, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { FollowUpTaskManager } from "./FollowUpTaskManager";

interface ViewCheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkin: HRCheckin | null;
  followupTasks: CheckinFollowupTask[];
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
}

export function ViewCheckinModal({
  open,
  onOpenChange,
  checkin,
  followupTasks,
  onTaskStatusChange
}: ViewCheckinModalProps) {
  if (!checkin) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Needs Support':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isDepartmentWide = checkin.department && !checkin.profiles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check-In Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Check-in Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Check-In Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(checkin.checkin_date), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(checkin.status)}>
                    {checkin.status}
                  </Badge>
                </div>

                {isDepartmentWide ? (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{checkin.department}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Team Member</p>
                      <p className="text-sm text-muted-foreground">
                        {checkin.profiles?.first_name} {checkin.profiles?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{checkin.profiles?.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Checked In By</p>
                    <p className="text-sm text-muted-foreground">
                      {checkin.checked_in_by_profile?.first_name} {checkin.checked_in_by_profile?.last_name}
                    </p>
                  </div>
                </div>
              </div>

              {checkin.notes && (
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{checkin.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Follow-up Tasks */}
          <FollowUpTaskManager
            pendingTasks={followupTasks}
            newTasks={[]}
            onNewTasksChange={() => {}}
            onTaskStatusChange={onTaskStatusChange ? (taskId, status) => onTaskStatusChange(taskId, status, checkin.id) : undefined}
            readonly={true}
          />

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
