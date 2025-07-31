
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Play, Pause, Trash2, Users, Pencil } from "lucide-react";
import { BAUTemplateWithDetails, BAUTemplateStatus } from "@/types/bauTemplate";
import { format } from "date-fns";

interface BAUTemplateTableRowProps {
  template: BAUTemplateWithDetails;
  onViewDetails: (template: BAUTemplateWithDetails) => void;
  onUpdateStatus: (templateId: string, status: BAUTemplateStatus) => Promise<boolean>;
  onDelete: (templateId: string, templateName: string, status: BAUTemplateStatus) => void;
  onEdit: (template: BAUTemplateWithDetails) => void;
}

export function BAUTemplateTableRow({ template, onViewDetails, onUpdateStatus, onDelete, onEdit }: BAUTemplateTableRowProps) {
  const getStatusColor = (status: BAUTemplateStatus) => {
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
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold">{template.name}</div>
          {template.description && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {template.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{template.department}</Badge>
      </TableCell>
      <TableCell>
        <Badge className={getFrequencyColor(template.frequency)}>
          {template.frequency}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(template.status)}>
          {template.status}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {template.template_kpis?.length || 0} KPIs
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{template.assigned_member_count}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {format(new Date(template.created_at), 'MMM dd, yyyy')}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(template)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {template.status === 'Draft' && (
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
            )}
            
            {template.status === 'Draft' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(template.id, 'Active')}>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            
            {template.status === 'Active' && (
              <DropdownMenuItem onClick={() => onUpdateStatus(template.id, 'Deactivated')}>
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
            
            {template.status === 'Active' && (
              <DropdownMenuItem 
                onClick={() => onDelete(template.id, template.name, template.status)}
                className="text-red-600"
              >
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            )}
            
            {template.status === 'Draft' && (
              <DropdownMenuItem 
                onClick={() => onDelete(template.id, template.name, template.status)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
