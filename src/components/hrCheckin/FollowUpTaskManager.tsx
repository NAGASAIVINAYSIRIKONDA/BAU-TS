
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle2, XCircle, Clock, History, Info, User } from "lucide-react";
import { CheckinFollowupTask } from "@/types/hrCheckin";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface FollowUpTaskManagerProps {
  pendingTasks: CheckinFollowupTask[];
  newTasks: Array<{ description: string; assignedTo?: string }>;
  onNewTasksChange: (tasks: Array<{ description: string; assignedTo?: string }>) => void;
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done') => void;
  readonly?: boolean;
  currentCheckinId?: string;
  queuedTaskUpdates?: Array<{ taskId: string; status: 'Done' | 'Not Done' }>;
  teamMembers?: Array<{ id: string; name: string; display_name: string }>;
}

export function FollowUpTaskManager({ 
  pendingTasks, 
  newTasks, 
  onNewTasksChange, 
  onTaskStatusChange,
  readonly = false,
  currentCheckinId,
  queuedTaskUpdates = [],
  teamMembers = []
}: FollowUpTaskManagerProps) {
  const [newTaskInput, setNewTaskInput] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const addNewTask = () => {
    if (newTaskInput.trim()) {
      const newTask = {
        description: newTaskInput.trim(),
        assignedTo: selectedAssignee === "unassigned" ? undefined : selectedAssignee
      };
      onNewTasksChange([...newTasks, newTask]);
      setNewTaskInput("");
      setSelectedAssignee("unassigned");
    }
  };

  const removeNewTask = (index: number) => {
    onNewTasksChange(newTasks.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Not Done':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Not Done':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getTaskBackgroundClass = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-50 border-green-200';
      case 'Not Done':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Handle task status update - queue the change instead of requiring current check-in ID
  const handleTaskStatusUpdate = (taskId: string, status: 'Done' | 'Not Done') => {
    if (onTaskStatusChange) {
      onTaskStatusChange(taskId, status);
    }
  };

  // Get the current status of a task (either queued or original)
  const getTaskCurrentStatus = (taskId: string, originalStatus: string) => {
    const queuedUpdate = queuedTaskUpdates.find(update => update.taskId === taskId);
    return queuedUpdate ? queuedUpdate.status : originalStatus;
  };

  return (
    <TooltipProvider>
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Follow-Up Tasks
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Tasks continue across check-ins. Mark them as Done/Not Done to track progress.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Carry-over Tasks Summary */}
          {pendingTasks.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <History className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} carried over from previous check-ins
              </span>
            </div>
          )}

          {/* Previous Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4" />
                Previous Tasks
              </h4>
              {pendingTasks.map((task) => {
                const currentStatus = getTaskCurrentStatus(task.id, task.status);
                const isQueued = queuedTaskUpdates.some(update => update.taskId === task.id);
                
                return (
                  <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getTaskBackgroundClass(currentStatus)}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(currentStatus)}
                      <div className="flex-1 space-y-1">
                        <span className={`text-sm break-words ${currentStatus === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task_description}
                        </span>
                        {task.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            Assigned to member
                          </div>
                        )}
                      </div>
                      {isQueued && (
                        <Badge variant="outline" className="ml-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 flex-shrink-0">
                          Queued
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge className={`${getStatusColor(currentStatus)} text-xs whitespace-nowrap`}>
                            {currentStatus}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}</p>
                          {isQueued && <p className="text-yellow-600">Will be updated on save</p>}
                        </TooltipContent>
                      </Tooltip>
                      {!readonly && onTaskStatusChange && !isQueued && currentStatus === 'Pending' && (
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskStatusUpdate(task.id, 'Done')}
                            className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 whitespace-nowrap"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Done
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskStatusUpdate(task.id, 'Not Done')}
                            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Done
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Tasks */}
          {!readonly && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {pendingTasks.length > 0 ? 'Additional Tasks' : 'New Tasks'}
              </h4>
              
              {/* Add new task input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter follow-up task..."
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                    className="flex-1"
                  />
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign to..." />
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
                  <Button type="button" onClick={addNewTask} size="sm" disabled={!newTaskInput.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* New tasks list */}
              {newTasks.map((task, index) => {
                const assignedMember = task.assignedTo ? teamMembers.find(m => m.id === task.assignedTo) : null;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div className="flex-1 space-y-1">
                      <span className="text-sm">{task.description}</span>
                      {assignedMember && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          Assigned to: {assignedMember.display_name || assignedMember.name}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNewTask(index)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {pendingTasks.length === 0 && newTasks.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              {readonly ? 'No follow-up tasks recorded' : 'No pending tasks. Add new tasks as needed.'}
            </div>
          )}

          {/* Help text */}
          {!readonly && (
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border">
              💡 <strong>Task Continuity:</strong> Task status changes are queued and will be applied when the check-in is saved. 
              New tasks will be created for future follow-up.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
