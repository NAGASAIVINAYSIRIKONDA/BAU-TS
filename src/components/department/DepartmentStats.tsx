import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";

interface DepartmentStatsProps {
  totalDepartments: number;
  totalEmployees: number;
}

export function DepartmentStats({ totalDepartments, totalEmployees }: DepartmentStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Departments</CardTitle>
          <Building2 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalDepartments}</div>
          <p className="text-xs text-muted-foreground">
            {totalDepartments === 0 ? "No departments yet" : "Active departments"}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">
            {totalEmployees === 0 ? "No employees assigned" : "Across all departments"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}