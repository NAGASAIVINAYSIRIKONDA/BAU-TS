
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Users, AlertTriangle } from "lucide-react";
import { Department } from "@/types/department";

interface DeleteDepartmentDialogProps {
  department: Department;
  onDelete: (departmentId: string) => Promise<boolean>;
}

export function DeleteDepartmentDialog({ department, onDelete }: DeleteDepartmentDialogProps) {
  const handleDelete = async () => {
    await onDelete(department.id);
  };

  const memberCount = department.member_count || 0;
  const hasMembersAssigned = memberCount > 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          disabled={hasMembersAssigned}
          title={hasMembersAssigned ? `Cannot delete department with ${memberCount} active member${memberCount !== 1 ? 's' : ''}` : 'Delete department'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasMembersAssigned && <AlertTriangle className="h-5 w-5 text-orange-500" />}
            {hasMembersAssigned ? 'Cannot Delete Department' : 'Delete Department'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {hasMembersAssigned ? (
              <>
                <p>
                  Cannot delete "{department.name}" because it has active team members assigned.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-800 font-medium mb-1">
                    <Users className="h-4 w-4" />
                    Active Team Members
                  </div>
                  <p className="text-sm text-orange-700">
                    <strong>{memberCount}</strong> team member{memberCount !== 1 ? 's are' : ' is'} currently assigned to this department.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please reassign or deactivate all team members before deleting this department.
                </p>
              </>
            ) : (
              <>
                <p>
                  Are you sure you want to delete "{department.name}"? This action cannot be undone.
                </p>
                <p className="text-sm text-muted-foreground">
                  The department will be permanently removed from your organization.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!hasMembersAssigned && (
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Department
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
