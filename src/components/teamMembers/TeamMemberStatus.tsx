
import { UserCheck, Clock, UserX } from "lucide-react";
import { TeamMember } from "@/types/teamMember";

interface TeamMemberStatusProps {
  member: TeamMember;
}

export function TeamMemberStatus({ member }: TeamMemberStatusProps) {
  if (member.isPendingInvitation) {
    return (
      <div className="flex items-center space-x-1">
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-amber-700 text-sm">Invited</span>
      </div>
    );
  }
  
  if (member.is_active) {
    return (
      <div className="flex items-center space-x-1">
        <UserCheck className="h-4 w-4 text-green-500" />
        <span className="text-green-700 text-sm">Active</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-1">
      <UserX className="h-4 w-4 text-gray-500" />
      <span className="text-gray-700 text-sm">Inactive</span>
    </div>
  );
}
