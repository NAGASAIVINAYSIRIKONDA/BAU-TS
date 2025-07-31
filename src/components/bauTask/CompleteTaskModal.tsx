
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BAUTaskWithDetails, CreateTaskKPIRecordData } from "@/types/bauTask";

interface CompleteTaskModalProps {
  task: BAUTaskWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (taskId: string, kpiRecords: CreateTaskKPIRecordData[]) => Promise<boolean>;
}

export function CompleteTaskModal({ task, open, onOpenChange, onComplete }: CompleteTaskModalProps) {
  const [kpiValues, setKpiValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const kpiRecords: CreateTaskKPIRecordData[] = [];
    
    if (task.bau_templates?.template_kpis) {
      for (const kpi of task.bau_templates.template_kpis) {
        const value = kpiValues[kpi.id];
        if (value !== undefined) {
          kpiRecords.push({
            template_kpi_id: kpi.id,
            recorded_value: value,
            task_instance_id: task.id,
            recorded_by: '' // Will be set in the service
          });
        }
      }
    }

    const success = await onComplete(task.id, kpiRecords);
    if (success) {
      onOpenChange(false);
      setKpiValues({});
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{task.title}</h4>
            <p className="text-sm text-muted-foreground">
              Please enter the KPI values for this task completion.
            </p>
          </div>

          {task.bau_templates?.template_kpis && task.bau_templates.template_kpis.length > 0 ? (
            <div className="space-y-4">
              {task.bau_templates.template_kpis.map((kpi) => (
                <div key={kpi.id} className="space-y-2">
                  <Label htmlFor={kpi.id}>
                    {kpi.name}
                    <span className="text-sm text-muted-foreground ml-2">
                      (Target: {kpi.operator === 'GreaterThanEqual' ? '≥' : '≤'} {kpi.target_value}
                      {kpi.unit === 'Percentage' ? '%' : ''})
                    </span>
                  </Label>
                  <Input
                    id={kpi.id}
                    type="number"
                    step="0.01"
                    value={kpiValues[kpi.id] || ''}
                    onChange={(e) => setKpiValues(prev => ({
                      ...prev,
                      [kpi.id]: parseFloat(e.target.value) || 0
                    }))}
                    placeholder={`Enter ${kpi.name.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No KPIs defined for this task template.
            </p>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Completing..." : "Complete Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
