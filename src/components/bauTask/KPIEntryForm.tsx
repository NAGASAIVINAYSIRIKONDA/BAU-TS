
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { BAUTaskWithProgress } from "@/types/bauTask";

interface KPIEntry {
  value: number | null; // Changed to allow null for empty state
  notes: string;
  hasBeenEdited?: boolean; // Track if user has actually entered a value
}

interface KPIEntryFormProps {
  task: BAUTaskWithProgress;
  kpiEntries: Record<string, KPIEntry>;
  onUpdateKpiValue: (kpiId: string, field: 'value' | 'notes', value: string | number) => void;
  onSubmit: () => void;
  submitting: boolean;
  hasValidEntries: boolean;
  getKpiScore: (kpi: any) => number | null;
  selectedPeriod?: any;
  isEditMode?: boolean;
}

export function KPIEntryForm({ 
  task, 
  kpiEntries, 
  onUpdateKpiValue, 
  onSubmit, 
  submitting, 
  hasValidEntries, 
  getKpiScore,
  selectedPeriod,
  isEditMode = false
}: KPIEntryFormProps) {
  if (!task.bau_templates?.template_kpis || task.bau_templates.template_kpis.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No KPIs defined for this task</p>
        </CardContent>
      </Card>
    );
  }

  // Check if we have any KPI entries with valid values (including zero)
  const hasAnyValidValues = Object.values(kpiEntries).some(entry => 
    entry?.hasBeenEdited === true && entry.value !== null && entry.value !== undefined
  );

  const handleInputChange = (kpiId: string, value: string) => {
    // Handle empty string - set to null to indicate no value entered
    if (value === '') {
      onUpdateKpiValue(kpiId, 'value', null);
      return;
    }
    
    // Parse the value and ensure it's not negative
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      // Mark as edited and set the actual value (including zero)
      onUpdateKpiValue(kpiId, 'value', numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent scroll wheel from changing values
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent scroll wheel from changing input values
    e.preventDefault();
    (e.target as HTMLElement).blur();
  };

  return (
    <Card className={isEditMode ? "border-orange-200 bg-orange-50/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {isEditMode ? "Edit KPI Values" : "Record KPI Values"} - {selectedPeriod?.period_name}
          {isEditMode && <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Edit Mode</span>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isEditMode 
            ? "Edit the recorded values for this completed period. Changes will update the existing entries." 
            : `Enter the current values for your ${task.bau_templates.frequency.toLowerCase()} KPIs for this period. You can enter 0 if no progress was made on a specific KPI. All fields must have values to proceed.`
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {task.bau_templates.template_kpis.map((kpi) => {
          const kpiScore = getKpiScore(kpi);
          const entry = kpiEntries[kpi.id];
          const displayValue = entry?.value !== null && entry?.value !== undefined ? entry.value.toString() : '';
          
          return (
            <div key={kpi.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {kpi.name} (Target: {kpi.operator === 'GreaterThanEqual' ? '≥' : '≤'} {kpi.target_value} {kpi.unit})
                </Label>
                {kpiScore !== null && (
                  <span className="text-sm font-medium text-green-600">
                    Score: {Math.round(kpiScore)}%
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Enter value (0 for no progress)"
                    value={displayValue}
                    onChange={(e) => handleInputChange(kpi.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onWheel={handleWheel}
                    className={`[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      !entry?.hasBeenEdited ? 'border-yellow-300 bg-yellow-50' : ''
                    }`}
                  />
                  {!entry?.hasBeenEdited && (
                    <p className="text-xs text-yellow-600 mt-1">Please enter a value (including 0)</p>
                  )}
                </div>
                <div className="w-20 flex items-center justify-center bg-muted rounded-md px-3 text-sm text-muted-foreground">
                  {kpi.unit}
                </div>
              </div>
              <Textarea
                placeholder="Comments (optional)"
                value={kpiEntries[kpi.id]?.notes || ''}
                onChange={(e) => onUpdateKpiValue(kpi.id, 'notes', e.target.value)}
                rows={2}
              />
            </div>
          );
        })}
        
        <Button 
          onClick={onSubmit} 
          disabled={submitting || !hasAnyValidValues}
          className={`w-full font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
            isEditMode 
              ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white" 
              : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          }`}
          size="lg"
        >
          {submitting ? (isEditMode ? "Updating..." : "Saving Progress...") : (isEditMode ? "Update Progress" : "Save Progress")}
        </Button>
        
        {!hasAnyValidValues && (
          <p className="text-sm text-red-600 text-center">
            Please enter values for all KPIs before saving. You can enter 0 if there was no progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
