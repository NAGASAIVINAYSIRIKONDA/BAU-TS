import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TaskList } from "./TaskList";
import { TaskDetails } from "./TaskDetails";
import { TaskFilters } from "./TaskFilters";
import { CheckinFollowupTask, TeamMemberOption } from "@/types/hrCheckin";

interface TasksTabProps {
  onTaskStatusChange?: (taskId: string, status: 'Done' | 'Not Done', checkinId: string) => void;
  onTaskAssignmentChange?: (taskId: string, assignedTo: string | null) => void;
  teamMembers?: TeamMemberOption[];
}

export function TasksTab({ onTaskStatusChange, onTaskAssignmentChange, teamMembers = [] }: TasksTabProps) {
  const [selectedTask, setSelectedTask] = useState<CheckinFollowupTask | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    status: "all",
    department: "all",
    search: ""
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <TaskList 
            key={refreshKey}
            filters={filters}
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
          />
        </Card>
        
        <Card className="card-elevated">
          <TaskDetails 
            task={selectedTask}
            onTaskStatusChange={onTaskStatusChange}
            onTaskAssignmentChange={onTaskAssignmentChange}
            teamMembers={teamMembers}
          />
        </Card>
      </div>
    </div>
  );
}