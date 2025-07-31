
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, TrendingUp, AlertTriangle, CheckCircle, User } from "lucide-react";
import { DepartmentBAUSummary, TeamMemberOption } from "@/types/hrCheckin";

interface DepartmentOverviewProps {
  summary: DepartmentBAUSummary | null;
  teamMembers: TeamMemberOption[];
}

export function DepartmentOverview({ summary, teamMembers }: DepartmentOverviewProps) {
  if (!summary) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Select a department to view comprehensive overview
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressHealth = summary.at_risk_count === 0 ? 'Healthy' : 'At Risk';

  return (
    <div className="space-y-4">
      {/* Department BAU Summary */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {summary.department} Department
          </CardTitle>
          <p className="text-sm text-muted-foreground">{summary.total_members} team members</p>
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
              <span className="font-medium">Department Health</span>
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
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No team members found in this department
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
