
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, BarChart3, User, Calendar, Target, TrendingUp, Loader2 } from "lucide-react";
import { BAUTaskWithProgress } from "@/types/bauTask";
import { format } from "date-fns";

interface BAUTaskCardProps {
  task: BAUTaskWithProgress;
  onUpdateStatus: (taskId: string, status: string) => void;
  onOpenProgress: (task: BAUTaskWithProgress) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
  isUpdatingStatus?: boolean;
}

export function BAUTaskCard({ task, onUpdateStatus, onOpenProgress, onDelete, isUpdatingStatus = false }: BAUTaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200';
      case 'At Risk':
        return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200';
    }
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== 'Completed';
  const progressPercentage = task.progress_percentage || 0;
  const periodsCompleted = task.periods_completed || 0;
  const totalPeriods = task.total_periods || 1;
  const hasKPIs = task.bau_templates?.template_kpis && task.bau_templates.template_kpis.length > 0;
  
  const actualStatus = task.status;

  return (
    <Card className="card-elevated hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onOpenProgress(task)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{task.bau_templates?.name || task.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                className={`${getStatusColor(actualStatus)} transition-all duration-300 ease-in-out transform ${
                  isUpdatingStatus ? 'scale-105 animate-pulse' : 'scale-100'
                }`}
              >
                {isUpdatingStatus && (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                )}
                {actualStatus}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="transition-all duration-300">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors duration-200"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border shadow-lg">
              {task.status === 'Pending' && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(task.id, 'In Progress');
                  }}
                  className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  disabled={isUpdatingStatus}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Start Task
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id, task.title);
                }}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                disabled={isUpdatingStatus}
              >
                <Target className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
        )}
        
        {/* Progress Section */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{periodsCompleted}/{totalPeriods} periods</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 transition-all duration-500 ease-in-out" 
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercentage)}% complete</span>
            {task.score && <span>Score: {task.score}</span>}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>
              {task.profiles?.first_name} {task.profiles?.last_name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
          </div>
          
          {task.bau_templates && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>
                {task.bau_templates.frequency}
                {hasKPIs && ` • ${task.bau_templates.template_kpis.length} KPIs`}
              </span>
            </div>
          )}
        </div>

        {/* Period Status Indicators */}
        {task.bau_progress_periods && task.bau_progress_periods.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              {task.bau_progress_periods.map((period, index) => (
                <div
                  key={period.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    period.is_completed 
                      ? 'bg-green-500 scale-110' 
                      : new Date(period.end_date) < new Date() 
                        ? 'bg-red-500' 
                        : 'bg-gray-300'
                  }`}
                  title={`${period.period_name}: ${period.is_completed ? 'Completed' : 'Pending'}`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {task.bau_templates?.frequency} periods
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
