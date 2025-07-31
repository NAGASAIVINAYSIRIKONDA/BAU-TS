
import { TeamMemberStats } from "@/components/teamMembers/TeamMemberStats";
import { TeamMemberForm } from "@/components/teamMembers/TeamMemberForm";
import { TeamMemberTable } from "@/components/teamMembers/TeamMemberTable";
import { TeamMemberSearch } from "@/components/teamMembers/TeamMemberSearch";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useState, useMemo } from "react";

export function TeamMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    teamMembers,
    loading,
    activeMembers,
    pendingInvitations,
    teamLeads,
    newThisMonth,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    resendInvitation
  } = useTeamMembers();

  // Filter team members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return teamMembers;
    
    return teamMembers.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim().toLowerCase();
      const displayName = (member.display_name || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      const department = (member.department || '').toLowerCase();
      
      return fullName.includes(searchLower) || 
             displayName.includes(searchLower) || 
             email.includes(searchLower) || 
             department.includes(searchLower);
    });
  }, [teamMembers, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <TeamMemberStats 
        activeMembers={activeMembers}
        teamLeads={teamLeads}
        newThisMonth={newThisMonth}
        pendingInvitations={pendingInvitations}
      />

      {/* Team Members List with Search and Add Button */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
          <div className="flex items-center gap-4">
            <TeamMemberSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <TeamMemberForm onSubmit={createTeamMember} />
          </div>
        </div>

        {/* Team Members List */}
        <TeamMemberTable
          teamMembers={filteredMembers}
          loading={loading}
          onUpdate={updateTeamMember}
          onDelete={deleteTeamMember}
          onResendInvitation={resendInvitation}
        />
      </div>
    </div>
  );
}
