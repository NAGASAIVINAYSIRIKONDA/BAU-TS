
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Edit, XCircle } from "lucide-react";

interface BAUTemplateStatsProps {
  totalTemplates: number;
  activeTemplates: number;
  draftTemplates: number;
  deactivatedTemplates: number;
}

export function BAUTemplateStats({ 
  totalTemplates, 
  activeTemplates, 
  draftTemplates, 
  deactivatedTemplates 
}: BAUTemplateStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Templates</CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalTemplates}</div>
          <p className="text-xs text-muted-foreground">All templates</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Templates</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeTemplates}</div>
          <p className="text-xs text-muted-foreground">Ready for use</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Draft Templates</CardTitle>
          <Edit className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{draftTemplates}</div>
          <p className="text-xs text-muted-foreground">In progress</p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Deactivated</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{deactivatedTemplates}</div>
          <p className="text-xs text-muted-foreground">Archived</p>
        </CardContent>
      </Card>
    </div>
  );
}
