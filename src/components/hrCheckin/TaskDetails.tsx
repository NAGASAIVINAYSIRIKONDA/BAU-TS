import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckinFollowupTask, TeamMemberOption } from "@/types/hrCheckin";
import { CheckCircle, XCircle, Clock, Calendar, User, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailsProps {
  task: CheckinFollowupTask | null;
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
  onTaskAssignmentChange?: (taskId: string, assignedTo: string | null) => void;
  teamMembers?: TeamMemberOption[];
}

export function TaskDetails({ task, onTaskStatusChange, onTaskAssignmentChange, teamMembers = [] }: TaskDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  if (!task) {
    return (
      <>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          Select a task to view details
        </CardContent>
      </>
    );
  }

  const handleStatusChange = async (newStatus: 'Done' | 'Not Done') => {
    if (!onTaskStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onTaskStatusChange(task.id, newStatus, task.checkin_id);
      toast({
        title: "Task Updated",
        description: `Task marked as ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignmentChange = async (assignedTo: string) => {
    if (!onTaskAssignmentChange || !task) return;
    
    setIsAssigning(true);
    try {
      await onTaskAssignmentChange(task.id, assignedTo === "unassigned" ? null : assignedTo);
      toast({
        title: "Task Assignment Updated",
        description: assignedTo ? "Task assigned successfully" : "Task unassigned",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task assignment",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Not Done':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'Not Done':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          Task Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-muted-foreground">{task.task_description}</p>
        </div>

        <div className="flex items-center gap-2">
          <h3 className="font-medium">Status:</h3>
          <Badge className={getStatusColor(task.status)} variant="secondary">
            {task.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Created: {new Date(task.created_at).toLocaleString()}
          </div>
          
          {task.updated_at !== task.created_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Updated: {new Date(task.updated_at).toLocaleString()}
            </div>
          )}
        </div>

        {/* Task Assignment */}
        <div className="space-y-2">
          <h3 className="font-medium flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Assignment
          </h3>
          <Select 
            value={task.assigned_to || "unassigned"} 
            onValueChange={handleAssignmentChange}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.display_name || member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {task.status === 'Pending' && (
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-medium mb-3">Actions</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusChange('Done')}
                disabled={isUpdating}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Done
              </Button>
              <Button
                onClick={() => handleStatusChange('Not Done')}
                disabled={isUpdating}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark Not Done
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}