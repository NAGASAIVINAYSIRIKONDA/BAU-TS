
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TeamMember } from "@/types/teamMember";

interface TeamMemberActiveToggleProps {
  isActive: boolean;
  teamMember?: TeamMember;
  onToggle: (checked: boolean) => void;
}

export function TeamMemberActiveToggle({ isActive, teamMember, onToggle }: TeamMemberActiveToggleProps) {
  if (!teamMember || teamMember.isPendingInvitation) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="space-y-0.5">
        <Label htmlFor="activeStatus" className="text-sm font-medium">
          Account Status
        </Label>
        <p className="text-xs text-muted-foreground">
          {isActive ? "Active - User can access the system" : "Inactive - User access is disabled"}
        </p>
      </div>
      <Switch
        id="activeStatus"
        checked={isActive}
        onCheckedChange={onToggle}
      />
    </div>
  );
}
