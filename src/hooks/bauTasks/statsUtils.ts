
import { BAUTaskWithDetails } from "@/types/bauTask";

export interface BAUTaskStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  overallProgress: number;
  completionRate: number;
}

export function calculateBAUTaskStats(tasks: BAUTaskWithDetails[]): BAUTaskStats {
  const totalTasks = tasks.length;
  
  // Count tasks by their actual status
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const activeTasks = tasks.filter(task => 
    task.status === 'Pending' || task.status === 'In Progress'
  ).length;
  
  // Task completion rate is based on status, not progress percentage
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate overall progress (average of all task progress percentages)
  const overallProgress = totalTasks > 0 
    ? Math.round(tasks.reduce((sum, task) => sum + (task.progress_percentage || 0), 0) / totalTasks)
    : 0;

  console.log('BAU Task Stats Debug:', {
    totalTasks,
    activeTasks,
    completedTasks,
    overallProgress,
    completionRate,
    taskStatuses: tasks.map(t => ({ id: t.id, status: t.status, progress: t.progress_percentage }))
  });

  return {
    totalTasks,
    activeTasks,
    completedTasks,
    overallProgress,
    completionRate
  };
}
