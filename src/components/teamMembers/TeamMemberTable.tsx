
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";
import { TeamMemberRow } from "./TeamMemberRow";

interface TeamMemberTableProps {
  teamMembers: TeamMember[];
  loading: boolean;
  onUpdate: (memberId: string, memberData: Partial<CreateTeamMemberData>) => Promise<boolean>;
  onDelete: (memberId: string) => Promise<boolean>;
  onResendInvitation: (memberId: string) => Promise<boolean>;
}

export function TeamMemberTable({ teamMembers, loading, onUpdate, onDelete, onResendInvitation }: TeamMemberTableProps) {

  if (loading) {
    return (
      <Card className="card-elevated">
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardContent className="p-0">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No team members or invitations yet.</p>
            <p className="text-sm text-muted-foreground">
              Send your first invitation to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onResendInvitation={onResendInvitation}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
