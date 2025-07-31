
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Target, Calendar, Building } from "lucide-react";
import { BAUTemplateWithDetails } from "@/types/bauTemplate";
import { format } from "date-fns";

interface BAUTemplateDetailsModalProps {
  template: BAUTemplateWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BAUTemplateDetailsModal({ template, open, onOpenChange }: BAUTemplateDetailsModalProps) {
  if (!template) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Draft':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Deactivated':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Daily':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Weekly':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'Bi-Weekly':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      case 'Monthly':
        return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            <Badge className={getStatusColor(template.status)}>
              {template.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed information about this BAU template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{template.department}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <Badge className={getFrequencyColor(template.frequency)}>
                    {template.frequency}
                  </Badge>
                </div>
              </div>
            </div>

            {template.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{template.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* KPIs Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Key Performance Indicators</h3>
              <Badge variant="outline">{template.template_kpis?.length || 0} KPIs</Badge>
            </div>
            
            {template.template_kpis && template.template_kpis.length > 0 ? (
              <div className="space-y-3">
                {template.template_kpis.map((kpi) => (
                  <div key={kpi.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{kpi.name}</h4>
                      <Badge variant="outline">
                        {kpi.operator === 'GreaterThanEqual' ? '≥' : '≤'} {kpi.target_value}
                        {kpi.unit === 'Percentage' ? '%' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: {kpi.operator === 'GreaterThanEqual' ? 'Greater than or equal to' : 'Less than or equal to'} {kpi.target_value}
                      {kpi.unit === 'Percentage' ? '%' : ' ' + kpi.unit.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No KPIs defined for this template.</p>
            )}
          </div>

          <Separator />

          {/* Assigned Members Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Assigned Members</h3>
              <Badge variant="outline">{template.assigned_member_count} Members</Badge>
            </div>
            
            {template.template_assignments && template.template_assignments.length > 0 ? (
              <div className="space-y-2">
                {template.template_assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.profiles?.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assigned {format(new Date(assignment.assigned_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No members assigned to this template.</p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Template Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{format(new Date(template.created_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{format(new Date(template.updated_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p>v{template.version}</p>
              </div>
              {template.deactivated_at && (
                <div>
                  <p className="text-muted-foreground">Deactivated</p>
                  <p>{format(new Date(template.deactivated_at), 'PPpp')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
