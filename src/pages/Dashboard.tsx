
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportingSection, ReportingFilters } from "@/components/dashboard/ReportingSection";
import { IndividualProgressCard } from "@/components/dashboard/IndividualProgressCard";
import { useReporting } from "@/hooks/useReporting";
import { useState } from "react";

export function Dashboard() {
  const [reportingFilters, setReportingFilters] = useState<ReportingFilters>({});
  const { teamMembers, individualProgress, dashboardStats, loading } = useReporting(reportingFilters);

  const handleFilterChange = (filters: ReportingFilters) => {
    console.log('Dashboard: Filter change received:', filters);
    setReportingFilters(filters);
  };

  return (
    <div className="space-y-6">
      {/* Reporting Section with Filtered Stats */}
      <ReportingSection 
        teamMembers={teamMembers}
        onFilterChange={handleFilterChange}
        dashboardStats={dashboardStats}
        loading={loading}
        reportingFilters={reportingFilters}
        individualProgress={individualProgress}
      />

      {/* Individual Progress Cards */}
      {!loading && individualProgress.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Individual Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualProgress.map((member) => (
              <IndividualProgressCard
                key={member.id}
                member={member}
                progressData={member.progressData}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show message when no data after filtering */}
      {!loading && individualProgress.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Individual Progress</h3>
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No data available for the selected filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filter criteria or check if BAU tasks have been created.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Individual Progress</h3>
          <Card className="card-elevated">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
