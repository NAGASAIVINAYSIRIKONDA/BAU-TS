
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface BAUTaskStatsProps {
  activeTasks: number;
  completedTasks: number;
  overallProgress: number;
  completionRate: number;
}

export function BAUTaskStats({ activeTasks, completedTasks, overallProgress, completionRate }: BAUTaskStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Checked-In</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{completedTasks}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeTasks}</div>
          <p className="text-xs text-muted-foreground">In progress</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${overallProgress >= 80 ? 'text-green-600' : 'text-foreground'}`}>
            {overallProgress}%
          </div>
          <p className="text-xs text-muted-foreground">Average task progress quality</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Task Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completionRate >= 90 ? "Excellent completion" : completionRate >= 70 ? "Good completion" : "Tasks pending"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
