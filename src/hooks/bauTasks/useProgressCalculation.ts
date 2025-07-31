
import { useMemo } from "react";
import { BAUTaskWithProgress } from "@/types/bauTask";
import { calculateKPIScore, calculateAggregateProgress } from "./progressCalculation";

interface KPIEntry {
  value: number | null;
  notes: string;
  hasBeenEdited?: boolean;
}

export function useProgressCalculation(
  task: BAUTaskWithProgress | null,
  kpiEntries: Record<string, KPIEntry>
) {
  const currentProgress = useMemo(() => {
    if (!task?.bau_templates?.template_kpis || task.bau_templates.template_kpis.length === 0) {
      return task?.progress_percentage || 0;
    }

    const kpiScores = task.bau_templates.template_kpis.map(kpi => {
      const entry = kpiEntries[kpi.id];
      const recordedValue = entry?.hasBeenEdited ? entry.value : null;
      
      if (recordedValue === null || recordedValue === undefined || recordedValue < 0) {
        return { 
          kpiId: kpi.id,
          recordedValue: 0,
          targetValue: kpi.target_value,
          operator: kpi.operator as 'GreaterThanEqual' | 'LessThanEqual',
          score: 0
        };
      }

      const score = calculateKPIScore(
        recordedValue,
        kpi.target_value,
        kpi.operator as 'GreaterThanEqual' | 'LessThanEqual'
      );

      return {
        kpiId: kpi.id,
        recordedValue: recordedValue,
        targetValue: kpi.target_value,
        operator: kpi.operator as 'GreaterThanEqual' | 'LessThanEqual',
        score: score
      };
    });

    const entriesWithValues = kpiScores.filter(score => score.recordedValue !== null && score.recordedValue >= 0);
    if (entriesWithValues.length === 0) {
      return task?.progress_percentage || 0;
    }

    return calculateAggregateProgress(entriesWithValues);
  }, [kpiEntries, task?.bau_templates?.template_kpis, task?.progress_percentage]);

  const getKpiScore = (kpi: any) => {
    const entry = kpiEntries[kpi.id];
    if (!entry?.hasBeenEdited || entry.value === null || entry.value === undefined || entry.value < 0) return null;
    
    return calculateKPIScore(
      entry.value,
      kpi.target_value,
      kpi.operator as 'GreaterThanEqual' | 'LessThanEqual'
    );
  };

  const hasValidEntries = Object.values(kpiEntries).some(entry => 
    entry?.hasBeenEdited === true && entry.value !== null && entry.value !== undefined && entry.value >= 0
  );

  return {
    currentProgress,
    getKpiScore,
    hasValidEntries
  };
}
