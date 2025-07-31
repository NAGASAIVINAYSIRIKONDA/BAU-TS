
import { useToast } from "@/hooks/use-toast";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";
import { UseTeamMembersReturn } from "./teamMembers/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "./useUserRole";
import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTeamMembersData, createInvitation, updateProfileData, deleteTeamMemberData } from "./teamMembers/teamMemberService";
import { sendInvitationEmail } from "./teamMembers/emailService";
import { calculateTeamMemberStats } from "./teamMembers/statsUtils";

export function useTeamMembers(): UseTeamMembersReturn {
  const { toast } = useToast();
  const { user } = useAuth();
  const { role, department, isTeamLead } = useUserRole();
  const queryClient = useQueryClient();

  const { data: allTeamMembers = [], isLoading: loading } = useAuthenticatedQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      console.log('Fetching team members for user:', user?.id);
      const members = await fetchTeamMembersData();
      console.log('Team members loaded:', members.length);
      return members;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Apply department filtering for Team Leads
  const teamMembers = isTeamLead && department 
    ? allTeamMembers.filter(member => member.department === department)
    : allTeamMembers;

  const createTeamMemberMutation = useMutation({
    mutationFn: async (memberData: CreateTeamMemberData) => {
      await createInvitation(memberData);
      const emailSent = await sendInvitationEmail(
        memberData.email, 
        memberData.role, 
        memberData.firstName, 
        memberData.lastName, 
        memberData.department, 
        memberData.position
      );
      return { emailSent, memberData };
    },
    onSuccess: ({ emailSent, memberData }) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'teamMembers'] });
      toast({
        title: "Success",
        description: emailSent 
          ? `Invitation sent to ${memberData.email}. They will receive an email to join the team.`
          : `Invitation created for ${memberData.email}. Email sending failed - you can resend it.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
      console.error('Error creating invitation:', error);
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ memberId, memberData }: { memberId: string; memberData: Partial<CreateTeamMemberData & { isActive?: boolean }> }) => {
      const member = allTeamMembers.find(m => m.id === memberId);
      if (!member || member.isPendingInvitation) {
        throw new Error('Cannot update invited members');
      }
      await updateProfileData(memberId, memberData);
      return memberData;
    },
    onSuccess: (memberData) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'teamMembers'] });
      const statusMessage = memberData.isActive !== undefined 
        ? (memberData.isActive ? "Team member activated successfully" : "Team member deactivated successfully")
        : "Team member updated successfully";

      toast({
        title: "Success",
        description: statusMessage,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const member = allTeamMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Team member not found');

      console.log('Deleting member:', member);
      await deleteTeamMemberData({
        id: memberId,
        isPendingInvitation: member.isPendingInvitation,
        is_active: member.is_active
      });
      return member;
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'teamMembers'] });
      
      let description = "Team member removed successfully";
      if (member.isPendingInvitation) {
        description = "Invitation deleted successfully";
      } else if (member.is_active === false) {
        description = "User account deleted successfully";
      } else {
        description = "User deactivated successfully";
      }
      
      toast({
        title: "Success",
        description,
      });
    },
    onError: (error: any) => {
      console.error('Error in deleteTeamMember hook:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const resendInvitation = async (memberId: string) => {
    try {
      const invitation = allTeamMembers.find(m => m.id === memberId && !m.is_active);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const emailSent = await sendInvitationEmail(
        invitation.email, 
        invitation.role, 
        invitation.first_name || '', 
        invitation.last_name || '', 
        invitation.department || '', 
        invitation.position || ''
      );

      if (emailSent) {
        toast({
          title: "Success",
          description: `Invitation resent to ${invitation.email}`,
        });
      } else {
        toast({
          title: "Warning",
          description: "Failed to resend invitation email",
          variant: "destructive",
        });
      }

      return emailSent;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
      console.error('Error resending invitation:', error);
      return false;
    }
  };

  const stats = calculateTeamMemberStats(teamMembers);

  return {
    teamMembers,
    loading,
    ...stats,
    createTeamMember: async (memberData: CreateTeamMemberData) => {
      try {
        await createTeamMemberMutation.mutateAsync(memberData);
        return true;
      } catch {
        return false;
      }
    },
    updateTeamMember: async (memberId: string, memberData: Partial<CreateTeamMemberData & { isActive?: boolean }>) => {
      try {
        await updateTeamMemberMutation.mutateAsync({ memberId, memberData });
        return true;
      } catch {
        return false;
      }
    },
    deleteTeamMember: async (memberId: string) => {
      try {
        await deleteTeamMemberMutation.mutateAsync(memberId);
        return true;
      } catch {
        return false;
      }
    },
    resendInvitation,
    refreshTeamMembers: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authenticated', 'teamMembers'] });
    }
  };
}
