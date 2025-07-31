
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BAUTaskWithProgress, CreateBAUProgressEntryData } from "@/types/bauTask";
import { useProgressCalculation } from "@/hooks/bauTasks/useProgressCalculation";
import { calculateKPIScore } from "@/hooks/bauTasks/progressCalculation";
import { ProgressSummaryCard } from "./ProgressSummaryCard";
import { KPIEntryForm } from "./KPIEntryForm";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

interface ProgressTrackingModalProps {
  task: BAUTaskWithProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitProgress: (periodId: string, entries: CreateBAUProgressEntryData[]) => Promise<boolean>;
  onUpdateProgress: (entryId: string, updates: { recorded_value: number; notes?: string | null }) => Promise<boolean>;
}

interface KPIEntry {
  value: number | null;
  notes: string;
  hasBeenEdited?: boolean;
}

export function ProgressTrackingModal({ task, open, onOpenChange, onSubmitProgress, onUpdateProgress }: ProgressTrackingModalProps) {
  const [kpiEntries, setKpiEntries] = useState<Record<string, KPIEntry>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [viewingCompletedPeriod, setViewingCompletedPeriod] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [originalKpiEntries, setOriginalKpiEntries] = useState<Record<string, KPIEntry>>({});
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const { currentProgress, getKpiScore, hasValidEntries } = useProgressCalculation(task, kpiEntries);

  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      setKpiEntries({});
      setSubmitting(false);
      setSelectedPeriodId(null);
      setViewingCompletedPeriod(null);
      setEditMode(false);
      setOriginalKpiEntries({});
      setShowUnsavedChangesDialog(false);
      setPendingClose(false);
    }
  }, [open]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!editMode) return false;
    
    return Object.keys(kpiEntries).some(kpiId => {
      const current = kpiEntries[kpiId];
      const original = originalKpiEntries[kpiId];
      
      if (!current || !original) return false;
      
      return current.hasBeenEdited && (
        current.value !== original.value || 
        current.notes !== original.notes
      );
    });
  };

  // Handle modal close with unsaved changes check
  const handleModalClose = (shouldClose: boolean) => {
    if (shouldClose && editMode && hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true);
      setPendingClose(true);
      return;
    }
    
    onOpenChange(shouldClose);
  };

  // Handle unsaved changes confirmation
  const handleUnsavedChangesConfirm = () => {
    setShowUnsavedChangesDialog(false);
    setPendingClose(false);
    onOpenChange(false);
  };

  const handleUnsavedChangesCancel = () => {
    setShowUnsavedChangesDialog(false);
    setPendingClose(false);
  };

  if (!task) return null;

  // Auto-select the first incomplete period if none selected
  const incompletePeriods = task.bau_progress_periods?.filter(p => !p.is_completed) || [];
  const currentSelectedPeriod = selectedPeriodId 
    ? task.bau_progress_periods?.find(p => p.id === selectedPeriodId)
    : incompletePeriods[0];

  const handleSubmit = async () => {
    if (!task.bau_templates?.template_kpis || task.bau_templates.template_kpis.length === 0) {
      alert('No KPIs defined for this task template');
      return;
    }

    // Get selected or current incomplete period
    if (!currentSelectedPeriod || currentSelectedPeriod.is_completed) {
      if (incompletePeriods.length === 0) {
        alert('All progress periods have been completed for this task.');
        return;
      }
      alert('Please select an incomplete period to record KPIs for.');
      return;
    }

    // Validate that we have entries for all KPIs with explicit values (including zero)
    const allKPIsHaveValues = task.bau_templates.template_kpis.every(kpi => {
      const entry = kpiEntries[kpi.id];
      return entry?.hasBeenEdited === true && entry.value !== null && entry.value !== undefined && entry.value >= 0;
    });

    if (!allKPIsHaveValues) {
      alert('Please enter values for all KPIs (including 0 for no progress) before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const entries = task.bau_templates.template_kpis
        .map(kpi => {
          const entry = kpiEntries[kpi.id];
          
          // Only include entries that have been explicitly edited
          if (!entry?.hasBeenEdited || entry.value === null || entry.value === undefined || entry.value < 0) {
            return null;
          }
          
          return {
            period_id: currentSelectedPeriod.id,
            template_kpi_id: kpi.id,
            recorded_value: entry.value,
            notes: entry.notes || null,
            recorded_by: '' // This will be set by the service layer
          };
        })
        .filter(entry => entry !== null);

      if (entries.length !== task.bau_templates.template_kpis.length) {
        alert('Please enter values for all KPIs before submitting.');
        return;
      }

      const success = await onSubmitProgress(currentSelectedPeriod.id, entries);
      
      if (success) {
        setKpiEntries({});
        onOpenChange(false);
      }
    } catch (error: any) {
      alert(`Error saving progress: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMode = () => {
    if (viewingCompletedPeriod && task.bau_templates?.template_kpis) {
      // Pre-populate form with existing values OR defaults for all template KPIs
      const existingEntries: Record<string, KPIEntry> = {};
      
      // Initialize all template KPIs with defaults
      task.bau_templates.template_kpis.forEach((kpi: any) => {
        existingEntries[kpi.id] = {
          value: null,
          notes: '',
          hasBeenEdited: false
        };
      });
      
      // Override with actual recorded values if they exist
      viewingCompletedPeriod.bau_progress_entries?.forEach((entry: any) => {
        existingEntries[entry.template_kpi_id] = {
          value: entry.recorded_value,
          notes: entry.notes || '',
          hasBeenEdited: true
        };
      });
      
      setKpiEntries(existingEntries);
      setOriginalKpiEntries(JSON.parse(JSON.stringify(existingEntries))); // Deep copy
      setEditMode(true);
    }
  };

  const handleUpdateProgress = async () => {
    if (!viewingCompletedPeriod?.bau_progress_entries) return;

    setSubmitting(true);
    try {
      let allUpdatesSuccessful = true;

      for (const entry of viewingCompletedPeriod.bau_progress_entries) {
        const kpiEntry = kpiEntries[entry.template_kpi_id];
        if (kpiEntry?.hasBeenEdited && kpiEntry.value !== null && 
            (kpiEntry.value !== entry.recorded_value || kpiEntry.notes !== entry.notes)) {
          const success = await onUpdateProgress(entry.id, {
            recorded_value: kpiEntry.value,
            notes: kpiEntry.notes || null
          });
          if (!success) {
            allUpdatesSuccessful = false;
            break;
          }
        }
      }

      if (allUpdatesSuccessful) {
        setEditMode(false);
        setViewingCompletedPeriod(null);
        setOriginalKpiEntries({});
        onOpenChange(false);
      }
    } catch (error: any) {
      alert(`Error updating progress: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const updateKpiValue = (kpiId: string, field: 'value' | 'notes', value: string | number) => {
    console.log('Updating KPI value:', kpiId, field, value);
    setKpiEntries(prev => ({
      ...prev,
      [kpiId]: {
        value: field === 'value' ? (value === null ? null : Number(value)) : prev[kpiId]?.value || null,
        notes: field === 'notes' ? String(value) : prev[kpiId]?.notes || '',
        hasBeenEdited: field === 'value' ? true : (prev[kpiId]?.hasBeenEdited || false)
      }
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
            <DialogDescription>
              Track progress for this {task.bau_templates?.frequency.toLowerCase()} task
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <ProgressSummaryCard 
              task={task} 
              currentProgress={currentProgress} 
              selectedPeriodId={selectedPeriodId}
              onPeriodSelect={setSelectedPeriodId}
              onViewCompletedPeriod={setViewingCompletedPeriod}
            />
            
            {currentSelectedPeriod && !currentSelectedPeriod.is_completed && !editMode && (
              <KPIEntryForm
                task={task}
                kpiEntries={kpiEntries}
                onUpdateKpiValue={updateKpiValue}
                onSubmit={handleSubmit}
                submitting={submitting}
                hasValidEntries={hasValidEntries}
                getKpiScore={getKpiScore}
                selectedPeriod={currentSelectedPeriod}
                isEditMode={false}
              />
            )}

            {editMode && viewingCompletedPeriod && (
              <KPIEntryForm
                task={task}
                kpiEntries={kpiEntries}
                onUpdateKpiValue={updateKpiValue}
                onSubmit={handleUpdateProgress}
                submitting={submitting}
                hasValidEntries={hasValidEntries}
                getKpiScore={getKpiScore}
                selectedPeriod={viewingCompletedPeriod}
                isEditMode={true}
              />
            )}
            
            {currentSelectedPeriod?.is_completed && !editMode && (
              <div className="text-center py-8 text-muted-foreground">
                <p>This period has already been completed.</p>
                <p>Select an incomplete period to record KPIs.</p>
              </div>
            )}

            {viewingCompletedPeriod && !editMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Completed Values - {viewingCompletedPeriod.period_name}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEditMode}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => setViewingCompletedPeriod(null)}>
                      Close
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Show ALL template KPIs, not just ones with entries */}
                  {task.bau_templates?.template_kpis?.map((kpi: any) => {
                    // Find the progress entry for this KPI in this period
                    const entry = viewingCompletedPeriod.bau_progress_entries?.find((e: any) => e.template_kpi_id === kpi.id);
                    
                    if (!entry) {
                      // No entry means 0 progress
                      return (
                        <div key={kpi.id} className="p-4 border rounded-lg bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{kpi.name}</span>
                            <span className="text-sm text-muted-foreground font-medium">Score: 0%</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Target: {kpi.operator === 'GreaterThanEqual' ? '≥' : '≤'} {kpi.target_value} {kpi.unit}
                          </div>
                          <div className="text-lg font-medium mb-2 text-muted-foreground">
                            No entry recorded
                          </div>
                        </div>
                      );
                    }
                    
                    const score = calculateKPIScore(
                      entry.recorded_value,
                      kpi.target_value,
                      kpi.operator as 'GreaterThanEqual' | 'LessThanEqual'
                    );
                    
                    return (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{kpi.name}</span>
                          <span className="text-sm text-green-600 font-medium">Score: {Math.round(score)}%</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Target: {kpi.operator === 'GreaterThanEqual' ? '≥' : '≤'} {kpi.target_value} {kpi.unit}
                        </div>
                        <div className="text-lg font-medium mb-2">
                          {entry.recorded_value} {kpi.unit}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-muted-foreground">
                            Notes: {entry.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
        onConfirm={handleUnsavedChangesConfirm}
        onCancel={handleUnsavedChangesCancel}
      />
    </>
  );
}
