/**
 * Fair Progress Calculation Utilities
 * Implements graduated scoring to reward effort and avoid harsh 0% penalties
 */

export interface KPIPerformanceScore {
  kpiId: string;
  recordedValue: number;
  targetValue: number;
  operator: 'GreaterThanEqual' | 'LessThanEqual';
  score: number; // 0-100
}

/**
 * Calculate individual KPI performance score using fair graduated formula
 */
export function calculateKPIScore(
  recordedValue: number,
  targetValue: number,
  operator: 'GreaterThanEqual' | 'LessThanEqual'
): number {
  if (targetValue === 0) {
    // Avoid division by zero
    return recordedValue === 0 ? 100 : 0;
  }

  if (operator === 'LessThanEqual') {
    // Target is "less than or equal to" (lower is better)
    if (recordedValue <= targetValue) {
      return 100; // Perfect score
    } else {
      // Proportional penalty for exceeding target
      const exceedRatio = recordedValue / targetValue;
      const score = Math.max(0, 200 - (exceedRatio * 100)); // Linear penalty
      return Math.min(100, score);
    }
  } else if (operator === 'GreaterThanEqual') {
    // Target is "greater than or equal to" (higher is better)
    if (recordedValue >= targetValue) {
      return 100; // Perfect score
    } else {
      // Direct proportional scoring - no artificial minimum
      const achievementRatio = recordedValue / targetValue;
      return Math.round(achievementRatio * 100);
    }
  }

  return 0; // Fallback score
}

/**
 * Calculate aggregate progress from multiple KPI scores
 */
export function calculateAggregateProgress(scores: KPIPerformanceScore[]): number {
  if (scores.length === 0) return 0;
  
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  return Math.round(totalScore / scores.length);
}

/**
 * Calculate period progress based on KPI entries
 */
export function calculatePeriodProgress(
  entries: Array<{
    recorded_value: number;
    template_kpi: {
      target_value: number;
      operator: string;
    };
  }>
): number {
  const scores: KPIPerformanceScore[] = entries.map((entry, index) => ({
    kpiId: `kpi-${index}`,
    recordedValue: entry.recorded_value,
    targetValue: entry.template_kpi.target_value,
    operator: entry.template_kpi.operator as 'GreaterThanEqual' | 'LessThanEqual',
    score: calculateKPIScore(
      entry.recorded_value,
      entry.template_kpi.target_value,
      entry.template_kpi.operator as 'GreaterThanEqual' | 'LessThanEqual'
    )
  }));

  return calculateAggregateProgress(scores);
}
