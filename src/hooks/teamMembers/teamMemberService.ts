import { supabase } from "@/integrations/supabase/client";
import { TeamMember, CreateTeamMemberData } from "@/types/teamMember";

export const fetchTeamMembersData = async (): Promise<TeamMember[]> => {
  // Fetch all profiles with their roles (both active and inactive) - exclude Admin users
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      first_name,
      last_name,
      display_name,
      department,
      position,
      is_active,
      created_at
    `);

  if (profilesError) throw profilesError;

  // Get user roles to identify admins - include all users, just identify admins to exclude
  const profileIds = (profilesData || []).map(p => p.id);
  
  const { data: allRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', profileIds);

  if (rolesError) throw rolesError;

  // Create a set of Admin user IDs to exclude and a map of all roles
  const adminUserIds = new Set(
    allRoles?.filter(r => r.role === 'Admin')?.map(r => r.user_id) || []
  );
  
  const rolesMap = new Map();
  (allRoles || []).forEach(role => {
    rolesMap.set(role.user_id, role.role);
  });

  // Include all active users except Admins
  const allMembers = (profilesData || [])
    .filter(profile => !adminUserIds.has(profile.id))
    .map(profile => ({
      ...profile,
      role: rolesMap.get(profile.id) || 'Team_Member', // Default role for users without explicit role
      isPendingInvitation: false, // These are real users from profiles table
    } as TeamMember));

  // Fetch pending invitations (also filter out admin invitations)
  const { data: invitationsData, error: invitationsError } = await supabase
    .from('invitations')
    .select(`
      id,
      email,
      role,
      invited_at,
      is_accepted
    `)
    .eq('is_accepted', false)
    .in('role', ['HR', 'Team_Lead', 'Team_Member'])
    .order('invited_at', { ascending: false });

  if (invitationsError) throw invitationsError;

  // Convert invitations to TeamMember format
  const pendingInvitations: TeamMember[] = (invitationsData || []).map(invitation => ({
    id: invitation.id,
    email: invitation.email,
    first_name: null,
    last_name: null,
    display_name: `Invited: ${invitation.email}`,
    department: null,
    position: null,
    is_active: false,
    created_at: invitation.invited_at,
    role: invitation.role,
    isPendingInvitation: true, // These are pending invitations
  }));

  // Combine members and pending invitations
  return [...allMembers, ...pendingInvitations];
};

export const createInvitation = async (memberData: CreateTeamMemberData): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create invitation
  const { data: invitationData, error: invitationError } = await supabase
    .from('invitations')
    .insert([
      {
        email: memberData.email,
        role: memberData.role,
        invited_by: user.id
      }
    ])
    .select()
    .single();

  if (invitationError) throw invitationError;
  return invitationData.id;
};

export const updateProfileData = async (memberId: string, memberData: Partial<CreateTeamMemberData & { isActive?: boolean }>) => {
  // Update profile
  const profileUpdate: any = {
    first_name: memberData.firstName,
    last_name: memberData.lastName,
    display_name: memberData.firstName && memberData.lastName 
      ? `${memberData.firstName} ${memberData.lastName}` 
      : undefined,
    department: memberData.department,
    position: memberData.position || null,
  };

  // Include is_active if provided
  if (memberData.isActive !== undefined) {
    profileUpdate.is_active = memberData.isActive;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', memberId);

  if (profileError) throw profileError;

  // Update role if provided
  if (memberData.role) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: memberData.role })
      .eq('user_id', memberId);

    if (roleError) throw roleError;
  }
};

export const deleteTeamMemberData = async (member: { id: string; isPendingInvitation: boolean; is_active: boolean | null }) => {
  console.log('Processing team member action:', member);
  
  if (member.isPendingInvitation) {
    // This is a pending invitation, delete from invitations table
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', member.id);

    if (error) {
      console.error('Error deleting invitation:', error);
      throw error;
    }
    console.log('Successfully deleted invitation');
  } else if (member.is_active === false) {
    // This is an inactive user, reactivate them
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('id', member.id);

    if (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
    console.log('Successfully reactivated user');
  } else {
    // This is an active user, deactivate it
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('id', member.id);

    if (error) {
      console.error('Error deactivating profile:', error);
      throw error;
    }
    console.log('Successfully deactivated profile');
  }
};
