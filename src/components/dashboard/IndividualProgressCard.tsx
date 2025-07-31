
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Target, TrendingUp, CheckCircle } from "lucide-react";

interface IndividualProgressProps {
  member: {
    id: string;
    display_name: string;
    department: string | null;
    avatar_url?: string | null;
    is_active?: boolean;
  };
  progressData: {
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    avgScore: number;
    taskCompletionRate: number;
    recentTrend: 'up' | 'down' | 'stable';
  };
}

export function IndividualProgressCard({ member, progressData }: IndividualProgressProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingUp className="w-4 h-4 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <Card className="card-elevated card-interactive">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback>{getInitials(member.display_name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {member.display_name}
                {member.is_active === false && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </CardTitle>
              <CardDescription>{member.department || 'No Department'}</CardDescription>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor(progressData.recentTrend)}`}>
            {getTrendIcon(progressData.recentTrend)}
            <span className="text-sm font-medium capitalize">{progressData.recentTrend}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progressData.overallProgress}%</span>
          </div>
          <Progress value={progressData.overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Average task progress quality</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tasks</span>
            </div>
            <div className="font-semibold">{progressData.tasksCompleted}/{progressData.totalTasks}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
            <div className="font-semibold">{progressData.avgScore}%</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Completion</span>
            </div>
            <div className="font-semibold">{progressData.taskCompletionRate}%</div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={progressData.overallProgress >= 90 ? "default" : progressData.overallProgress >= 70 ? "secondary" : "destructive"}
          >
            {progressData.overallProgress >= 90 ? "Excellent" : progressData.overallProgress >= 70 ? "Good" : "Needs Improvement"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
