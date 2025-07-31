
import { useState, useEffect } from "react";
import { useReportingData } from "./useReportingData";
import { ReportingFilters } from "@/components/dashboard/ReportingSection";

interface TeamMemberProgress {
  id: string;
  display_name: string;
  department: string | null;
  avatar_url?: string | null;
  progressData: {
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    avgScore: number;
    taskCompletionRate: number;
    recentTrend: 'up' | 'down' | 'stable';
  };
}

interface DashboardStats {
  overallProgress: number;
  taskCompletionRate: number;
  tasksCompleted: number;
}

export function useReporting(filters: ReportingFilters) {
  const { data, isLoading, error } = useReportingData(filters);

  if (error) {
    console.error('Error fetching reporting data:', error);
  }

  return {
    teamMembers: data?.teamMembers || [],
    individualProgress: data?.individualProgress || [],
    dashboardStats: data?.dashboardStats || {
      overallProgress: 0,
      taskCompletionRate: 0,
      tasksCompleted: 0
    },
    loading: isLoading
  };
}
