
import { useState } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BAUTemplateWithDetails, BAUTemplateStatus, CreateBAUTemplateFormData } from "@/types/bauTemplate";
import { BAUTemplateDetailsModal } from "./BAUTemplateDetailsModal";
import { BAUTemplateTableRow } from "./BAUTemplateTableRow";
import { BAUTemplateDeleteDialog } from "./BAUTemplateDeleteDialog";
import { BAUTemplateEditForm } from "./BAUTemplateEditForm";

interface BAUTemplateTableProps {
  templates: BAUTemplateWithDetails[];
  loading: boolean;
  onUpdateStatus: (templateId: string, status: BAUTemplateStatus) => Promise<boolean>;
  onDelete: (templateId: string, status: BAUTemplateStatus) => Promise<boolean>;
  onEdit: (templateId: string, data: CreateBAUTemplateFormData) => Promise<boolean>;
}

export function BAUTemplateTable({ templates, loading, onUpdateStatus, onDelete, onEdit }: BAUTemplateTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; templateId: string; templateName: string; status: BAUTemplateStatus }>({
    open: false,
    templateId: "",
    templateName: "",
    status: "Draft"
  });
  const [detailsModal, setDetailsModal] = useState<{ open: boolean; template: BAUTemplateWithDetails | null }>({
    open: false,
    template: null
  });
  const [editModal, setEditModal] = useState<{ open: boolean; template: BAUTemplateWithDetails | null }>({
    open: false,
    template: null
  });

  const handleDelete = async () => {
    const success = await onDelete(deleteDialog.templateId, deleteDialog.status);
    if (success) {
      setDeleteDialog({ open: false, templateId: "", templateName: "", status: "Draft" });
    }
  };

  const handleViewDetails = (template: BAUTemplateWithDetails) => {
    setDetailsModal({ open: true, template });
  };

  const handleDeleteClick = (templateId: string, templateName: string, status: BAUTemplateStatus) => {
    setDeleteDialog({ open: true, templateId, templateName, status });
  };

  const handleEditClick = (template: BAUTemplateWithDetails) => {
    setEditModal({ open: true, template });
  };

  const handleEditSubmit = async (templateId: string, data: CreateBAUTemplateFormData) => {
    const success = await onEdit(templateId, data);
    if (success) {
      setEditModal({ open: false, template: null });
    }
    return success;
  };

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading templates...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No templates found. Create your first BAU template to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-elevated">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KPIs</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <BAUTemplateTableRow
                  key={template.id}
                  template={template}
                  onViewDetails={handleViewDetails}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={handleDeleteClick}
                  onEdit={handleEditClick}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BAUTemplateDetailsModal
        template={detailsModal.template}
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ open, template: open ? detailsModal.template : null })}
      />

      <BAUTemplateDeleteDialog
        open={deleteDialog.open}
        templateName={deleteDialog.templateName}
        status={deleteDialog.status}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
      />

      <BAUTemplateEditForm
        template={editModal.template}
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, template: open ? editModal.template : null })}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
