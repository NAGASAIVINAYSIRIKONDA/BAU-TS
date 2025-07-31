
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, TrendingUp, Users, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";
import { useDepartments } from "@/hooks/useDepartments";
import { useUserRole } from "@/hooks/useUserRole";

interface ReportingSectionProps {
  teamMembers: Array<{ id: string; display_name: string; department: string | null }>;
  onFilterChange: (filters: ReportingFilters) => void;
  dashboardStats: {
    overallProgress: number;
    taskCompletionRate: number;
    tasksCompleted: number;
  };
  loading: boolean;
  reportingFilters: ReportingFilters;
  individualProgress: Array<{
    id: string;
    display_name: string;
    department: string | null;
    progressData: {
      overallProgress: number;
      tasksCompleted: number;
      totalTasks: number;
      avgScore: number;
      taskCompletionRate: number;
    };
  }>;
}

export interface ReportingFilters {
  dateRange?: DateRange;
  memberId?: string;
  department?: string;
}

export function ReportingSection({ teamMembers, onFilterChange, dashboardStats, loading, reportingFilters, individualProgress }: ReportingSectionProps) {
  const [filters, setFilters] = useState<ReportingFilters>({});
  const { departments } = useDepartments();
  const { role, department: userDepartment, isTeamLead } = useUserRole();

  // Filter departments for Team Leads
  const visibleDepartments = isTeamLead && userDepartment 
    ? departments.filter(dept => dept.name === userDepartment)
    : departments;

  // Auto-apply department filter for Team Leads on mount
  useEffect(() => {
    if (isTeamLead && userDepartment && !filters.department) {
      const newFilters = { ...filters, department: userDepartment };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  }, [isTeamLead, userDepartment]);

  const handleFilterChange = (key: keyof ReportingFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // If department is selected, clear team member filter
    if (key === 'department') {
      newFilters.memberId = undefined;
    }
    
    // If team member is selected, auto-select their department
    if (key === 'memberId' && value) {
      const selectedMember = teamMembers.find(member => member.id === value);
      if (selectedMember?.department) {
        newFilters.department = selectedMember.department;
      }
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    // For Team Leads, maintain their department filter requirement
    const clearedFilters: ReportingFilters = isTeamLead && userDepartment 
      ? { department: userDepartment }
      : {};
    
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Check if any filters are applied (excluding auto-applied Team Lead department filter)
  const hasActiveFilters = () => {
    if (isTeamLead) {
      // For Team Leads, only count non-department filters
      return !!(filters.dateRange || filters.memberId);
    }
    return !!(filters.dateRange || filters.memberId || filters.department);
  };

  const handleExportReport = () => {
    // Create CSV content
    const headers = ['Name', 'Department', 'Overall Progress (%)', 'Tasks Checked-In', 'Total Tasks', 'Average Score', 'Completion Rate (%)'];
    
    const csvContent = [
      headers.join(','),
      ...individualProgress.map(member => [
        `"${member.display_name}"`,
        `"${member.department || 'N/A'}"`,
        member.progressData.overallProgress,
        member.progressData.tasksCompleted,
        member.progressData.totalTasks,
        member.progressData.avgScore.toFixed(2),
        member.progressData.taskCompletionRate
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.setAttribute('download', `bau-tracker-report-${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reporting & Analytics</h2>
          <p className="text-muted-foreground">Track performance and generate salary processing reports</p>
        </div>
        <Button className="btn-primary" onClick={handleExportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters - Show for Admin, HR, and Team_Lead. Limited filters for Team_Member */}
      {role && (role === 'Admin' || role === 'HR' || role === 'Team_Lead') && (
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Report Filters
                </CardTitle>
                <CardDescription>Filter data for specific analysis and salary processing</CardDescription>
              </div>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(range) => handleFilterChange('dateRange', range)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Team Member</label>
                <Select 
                  value={filters.memberId || 'all'} 
                  onValueChange={(value) => handleFilterChange('memberId', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {teamMembers
                      .filter(member => !filters.department || member.department === filters.department)
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.display_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select 
                  value={filters.department || (isTeamLead ? userDepartment : 'all')} 
                  onValueChange={(value) => handleFilterChange('department', value === 'all' ? undefined : value)}
                  disabled={isTeamLead} // Disable for Team Leads since they can only see their department
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isTeamLead && <SelectItem value="all">All Departments</SelectItem>}
                    {visibleDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats - Now Using Filtered Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elevated card-interactive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Overall Progress
            </CardTitle>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : `${dashboardStats.overallProgress}%`}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className={dashboardStats.overallProgress >= 80 ? "text-primary font-medium" : "text-muted-foreground"}>
                Average task progress quality
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated card-interactive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Task Completion Rate
            </CardTitle>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : `${dashboardStats.taskCompletionRate}%`}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">Tasks marked as completed</span>
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated card-interactive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Tasks Checked-In
            </CardTitle>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : dashboardStats.tasksCompleted}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">This period</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
