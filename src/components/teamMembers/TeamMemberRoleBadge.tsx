
import { Badge } from "@/components/ui/badge";

interface TeamMemberRoleBadgeProps {
  role: string;
}

export function TeamMemberRoleBadge({ role }: TeamMemberRoleBadgeProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'HR':
        return 'default';
      case 'Team_Lead':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatRoleDisplay = (role: string) => {
    switch (role) {
      case 'Team_Lead':
        return 'Team Lead';
      case 'Team_Member':
        return 'Team Member';
      default:
        return role;
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)}>
      {formatRoleDisplay(role)}
    </Badge>
  );
}
