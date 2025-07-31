
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HRCheckin } from "@/types/hrCheckin";
import { format } from "date-fns";

interface DeleteCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkin: HRCheckin | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteCheckinDialog({
  open,
  onOpenChange,
  checkin,
  onConfirm,
  isDeleting
}: DeleteCheckinDialogProps) {
  if (!checkin) return null;

  const isDepartmentWide = checkin.department && !checkin.profiles;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Check-In</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this check-in from{" "}
            <strong>{format(new Date(checkin.checkin_date), 'MMMM dd, yyyy')}</strong>
            {isDepartmentWide ? (
              <> for the <strong>{checkin.department}</strong> department</>
            ) : (
              <> for <strong>{checkin.profiles?.first_name} {checkin.profiles?.last_name}</strong></>
            )}?
            <br /><br />
            This action cannot be undone and will also delete all associated follow-up tasks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Check-In"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
