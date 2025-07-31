
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Clock } from "lucide-react";

interface TeamMemberStatsProps {
  activeMembers: number;
  teamLeads: number;
  newThisMonth: number;
  pendingInvitations: number;
}

export function TeamMemberStats({ activeMembers, teamLeads, newThisMonth, pendingInvitations }: TeamMemberStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{activeMembers}</div>
          <p className="text-xs text-muted-foreground">
            {activeMembers === 0 ? "No active members yet" : "Currently active"}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Team Leads</CardTitle>
          <UserCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{teamLeads}</div>
          <p className="text-xs text-muted-foreground">
            {teamLeads === 0 ? "No team leads assigned" : "Leadership roles"}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
          <UserPlus className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{newThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {newThisMonth === 0 ? "No new members" : "Recent additions"}
          </p>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invitations</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{pendingInvitations}</div>
          <p className="text-xs text-muted-foreground">
            {pendingInvitations === 0 ? "No pending invitations" : "Awaiting response"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
