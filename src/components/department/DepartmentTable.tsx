import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TruncatedText } from "@/components/ui/truncated-text";
import { Edit } from "lucide-react";
import { Department } from "@/types/department";
import { DepartmentForm } from "./DepartmentForm";
import { DeleteDepartmentDialog } from "./DeleteDepartmentDialog";

interface DepartmentTableProps {
  departments: Department[];
  loading: boolean;
  onUpdate: (departmentId: string, name: string, description: string) => Promise<boolean>;
  onDelete: (departmentId: string, memberCount: number) => Promise<boolean>;
}

export function DepartmentTable({ departments, loading, onUpdate, onDelete }: DepartmentTableProps) {
  const handleEdit = (department: Department) => {
    return onUpdate(department.id, department.name, department.description || "");
  };

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading departments...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (departments.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No departments created yet. Click "Add Department" to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-lg border-0">
          <Table className="table-professional">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4 min-w-[200px]">Name</TableHead>
                <TableHead className="w-2/5 min-w-[300px]">Description</TableHead>
                <TableHead className="w-1/6 min-w-[120px]">Total Members</TableHead>
                <TableHead className="w-1/6 min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id} className="h-20 min-h-[80px]">
                  <TableCell className="font-medium p-4 align-top">
                    <div className="max-w-[180px]">
                      <p className="break-words line-clamp-2 leading-tight">
                        {department.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 align-top">
                    <div className="max-w-[280px]">
                      <TruncatedText 
                        text={department.description} 
                        maxLines={2}
                        className="text-sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-4 align-top">
                    <span className="font-medium">{department.member_count || 0}</span>
                  </TableCell>
                  <TableCell className="p-4 align-top">
                    <div className="flex space-x-2">
                      <DepartmentForm
                        isEdit
                        department={department}
                        onSubmit={(name, description) => onUpdate(department.id, name, description)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteDepartmentDialog
                        department={department}
                        onDelete={(departmentId) => onDelete(departmentId, department.member_count || 0)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}