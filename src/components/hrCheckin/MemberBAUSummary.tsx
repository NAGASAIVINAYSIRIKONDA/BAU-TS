import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { MemberBAUSummary } from "@/types/hrCheckin";

interface MemberBAUSummaryProps {
  summary: MemberBAUSummary | null;
  memberName: string;
}

export function MemberBAUSummaryComponent({ summary, memberName }: MemberBAUSummaryProps) {
  if (!summary) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Current BAU Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Select a member to view their BAU summary
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTasks = summary.active_baus_count + summary.completed_baus_count;
  const progressHealth = summary.at_risk_count === 0 ? 'Healthy' : 'At Risk';
  const healthColor = progressHealth === 'Healthy' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Current BAU Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">{memberName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Health Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {progressHealth === 'Healthy' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-medium">Progress Health</span>
          </div>
          <Badge className={`${progressHealth === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {progressHealth}
          </Badge>
        </div>

        {/* BAU Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.active_baus_count}</div>
            <div className="text-sm text-muted-foreground">Active BAUs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.completed_baus_count}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* At Risk Count */}
        {summary.at_risk_count > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">At Risk BAUs</span>
            </div>
            <Badge variant="destructive">{summary.at_risk_count}</Badge>
          </div>
        )}

        {/* Average Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(Number(summary.avg_progress_percentage))}%
            </span>
          </div>
          <Progress value={Number(summary.avg_progress_percentage)} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Based on last 30 days activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Keep the original export for backward compatibility
export { MemberBAUSummaryComponent as MemberBAUSummary };
