
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface BAUTemplateDeleteDialogProps {
  open: boolean;
  templateName: string;
  status: 'Draft' | 'Active' | 'Deactivated';
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function BAUTemplateDeleteDialog({ open, templateName, status, onOpenChange, onConfirm }: BAUTemplateDeleteDialogProps) {
  const isDraft = status === 'Draft';
  const actionText = isDraft ? 'Delete' : 'Deactivate';
  const title = isDraft ? 'Delete Template' : 'Deactivate Template';
  const description = isDraft 
    ? `Are you sure you want to delete "${templateName}"? This action cannot be undone and will remove all associated KPIs and assignments.`
    : `Are you sure you want to deactivate "${templateName}"? This will preserve historical data while making the template inactive.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
