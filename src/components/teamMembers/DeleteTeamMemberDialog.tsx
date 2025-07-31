
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TeamMember } from "@/types/teamMember";

interface DeleteTeamMemberDialogProps {
  teamMember: TeamMember;
  onDelete: (memberId: string) => Promise<boolean>;
}

export function DeleteTeamMemberDialog({ teamMember, onDelete }: DeleteTeamMemberDialogProps) {
  const handleDelete = async () => {
    await onDelete(teamMember.id);
  };

  const memberName = teamMember.display_name || `${teamMember.first_name || ''} ${teamMember.last_name || ''}`.trim() || teamMember.email;
  const isPendingInvitation = teamMember.isPendingInvitation;
  const isInactiveUser = !isPendingInvitation && teamMember.is_active === false;
  const isActiveUser = !isPendingInvitation && teamMember.is_active === true;

  const getDialogContent = () => {
    if (isPendingInvitation) {
      return {
        title: "Delete Invitation",
        description: `Are you sure you want to delete the invitation for "${memberName}"? The invitation will be permanently removed and they will no longer be able to join the team.`,
        action: "Delete Invitation"
      };
    } else if (isInactiveUser) {
      return {
        title: "Reactivate User",
        description: `Are you sure you want to reactivate "${memberName}"? This will enable their account and add them back to the active team members list.`,
        action: "Reactivate User"
      };
    } else {
      return {
        title: "Deactivate User",
        description: `Are you sure you want to deactivate "${memberName}"? This will disable their account and remove them from the active team members list.`,
        action: "Deactivate User"
      };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {dialogContent.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
