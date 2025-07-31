
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { BAUTaskWithProgress } from "@/types/bauTask";

interface ProgressSummaryCardProps {
  task: BAUTaskWithProgress;
  currentProgress: number;
  selectedPeriodId?: string | null;
  onPeriodSelect?: (periodId: string) => void;
  onViewCompletedPeriod?: (period: any) => void;
}

export function ProgressSummaryCard({ task, currentProgress, selectedPeriodId, onPeriodSelect, onViewCompletedPeriod }: ProgressSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              BAU Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Frequency: {task.bau_templates?.frequency}
            </p>
          </div>
          <Badge className={task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Period:</span>
            <span className="text-sm">
              {task.bau_progress_periods?.find(p => !p.is_completed)?.period_name || 'Not Started'}
            </span>
          </div>
          
          {/* Period Selection */}
          {task.bau_progress_periods && task.bau_progress_periods.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Select Period:</span>
              <div className="grid grid-cols-2 gap-2">
                {task.bau_progress_periods.map((period) => (
                  <div
                    key={period.id}
                    onClick={() => {
                      if (period.is_completed) {
                        onViewCompletedPeriod?.(period);
                      } else {
                        onPeriodSelect?.(period.id);
                      }
                    }}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-colors ${
                      selectedPeriodId === period.id
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : period.is_completed
                        ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                    title={`${period.period_name}: ${period.is_completed ? 'Click to view entered values' : 'Available for recording'}`}
                  >
                    <div className="text-sm font-medium">{period.period_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedPeriodId === period.id ? '● Selected' : period.is_completed ? '✓ Complete' : 'Record KPIs'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {task.periods_completed || 0}/{task.total_periods || 1} periods
            </span>
          </div>
          <Progress value={task.progress_percentage || 0} className="h-3" />
          
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(task.progress_percentage || 0)}% complete
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
