
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit2, Mail, MoreHorizontal, UserCheck, UserX, Trash2 } from "lucide-react";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";
import { TeamMemberForm } from "./TeamMemberForm";

interface TeamMemberActionsProps {
  member: TeamMember;
  onUpdate: (memberId: string, memberData: Partial<CreateTeamMemberData>) => Promise<boolean>;
  onDelete: (memberId: string) => Promise<boolean>;
  onResendInvitation: (memberId: string) => Promise<boolean>;
}

export function TeamMemberActions({ member, onUpdate, onDelete, onResendInvitation }: TeamMemberActionsProps) {
  const [resendingInvite, setResendingInvite] = useState(false);

  const handleResendInvitation = async () => {
    setResendingInvite(true);
    try {
      await onResendInvitation(member.id);
    } finally {
      setResendingInvite(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {member.isPendingInvitation ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
          onClick={handleResendInvitation}
          disabled={resendingInvite}
          title="Resend invitation email"
        >
          <Mail className="h-4 w-4" />
        </Button>
      ) : (
        <TeamMemberForm
          onSubmit={(data) => onUpdate(member.id, data)}
          isEdit={true}
          teamMember={member}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          }
        />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.isPendingInvitation ? (
            <DropdownMenuItem 
              onClick={() => onDelete(member.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invitation
            </DropdownMenuItem>
          ) : member.is_active === false ? (
            <DropdownMenuItem 
              onClick={() => onDelete(member.id)}
              className="text-green-600 focus:text-green-600"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activate User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => onDelete(member.id)}
              className="text-red-600 focus:text-red-600"
            >
              <UserX className="mr-2 h-4 w-4" />
              Deactivate User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
