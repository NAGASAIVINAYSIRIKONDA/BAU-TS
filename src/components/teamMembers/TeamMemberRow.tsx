
import { TableCell, TableRow } from "@/components/ui/table";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";
import { TeamMemberStatus } from "./TeamMemberStatus";
import { TeamMemberRoleBadge } from "./TeamMemberRoleBadge";
import { TeamMemberActions } from "./TeamMemberActions";

interface TeamMemberRowProps {
  member: TeamMember;
  onUpdate: (memberId: string, memberData: Partial<CreateTeamMemberData>) => Promise<boolean>;
  onDelete: (memberId: string) => Promise<boolean>;
  onResendInvitation: (memberId: string) => Promise<boolean>;
}

export function TeamMemberRow({ member, onUpdate, onDelete, onResendInvitation }: TeamMemberRowProps) {
  const getDisplayName = (member: TeamMember) => {
    if (member.isPendingInvitation) {
      return member.email; // For invitations, show email
    }
    return member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A';
  };

  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        {getDisplayName(member)}
      </TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell>
        <TeamMemberRoleBadge role={member.role} />
      </TableCell>
      <TableCell>{member.department || 'Not assigned'}</TableCell>
      <TableCell>
        <TeamMemberStatus member={member} />
      </TableCell>
      <TableCell className="text-right">
        <TeamMemberActions
          member={member}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onResendInvitation={onResendInvitation}
        />
      </TableCell>
    </TableRow>
  );
}
