import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckinFollowupTask, TeamMemberOption } from "@/types/hrCheckin";
import { taskService } from "@/hooks/hrCheckins/taskService";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface TaskListProps {
  filters: {
    status: string;
    department: string;
    search: string;
  };
  selectedTask: CheckinFollowupTask | null;
  onTaskSelect: (task: CheckinFollowupTask) => void;
}

export function TaskList({ filters, selectedTask, onTaskSelect }: TaskListProps) {
  const [tasks, setTasks] = useState<CheckinFollowupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    console.log('TaskList: Starting to fetch tasks with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      const allTasks = await taskService.getAllTasks();
      console.log('TaskList: Received tasks:', allTasks);
      
      let filteredTasks = allTasks;
      
      // Filter by status
      if (filters.status !== "all") {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
      
      // Filter by search
      if (filters.search) {
        filteredTasks = filteredTasks.filter(task => 
          task.task_description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Filter by department
      if (filters.department && filters.department !== "all") {
        filteredTasks = filteredTasks.filter(task => {
          const hrCheckin = (task as any).hr_checkins;
          if (hrCheckin) {
            return hrCheckin.department === filters.department ||
                   (hrCheckin.profiles && hrCheckin.profiles.department === filters.department);
          }
          return false;
        });
      }
      
      console.log('TaskList: Filtered tasks:', filteredTasks);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('TaskList: Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  // Set up real-time subscription for task updates
  useEffect(() => {
    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkin_followup_tasks'
        },
        (payload) => {
          console.log('TaskList: Real-time update received:', payload);
          fetchTasks(); // Refresh tasks when any change occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Not Done':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
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

  if (loading) {
    return (
      <>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Tasks
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {error ? (
          <div className="text-center py-8 text-red-500">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={fetchTasks}
            >
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found matching your filters
          </div>
        ) : (
          tasks.map((task) => (
            <Button
              key={task.id}
              variant={selectedTask?.id === task.id ? "secondary" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onTaskSelect(task)}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3">
                  {getStatusIcon(task.status)}
                  <div className="text-left">
                    <div className="font-medium line-clamp-2">
                      {task.task_description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(task.status)} variant="secondary">
                  {task.status}
                </Badge>
              </div>
            </Button>
          ))
        )}
      </CardContent>
    </>
  );
}