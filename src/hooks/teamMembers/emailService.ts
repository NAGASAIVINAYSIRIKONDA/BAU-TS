
import { supabase } from "@/integrations/supabase/client";

export const sendInvitationEmail = async (email: string, role: string, firstName?: string, lastName?: string, department?: string, position?: string): Promise<boolean> => {
  try {
    // Get current user info for the invitation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get inviter's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.display_name || 
      `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
      'Team Admin';

    console.log('Calling send-invitation function with:', { email, inviterName, role, firstName, lastName, department, position });

    // Call the edge function to send invitation email with additional user data
    const { data, error } = await supabase.functions.invoke('send-invitation', {
      body: {
        email,
        inviterName,
        role,
        companyName: 'BAU Tracker',
        firstName: firstName || '',
        lastName: lastName || '',
        department: department || '',
        position: position || ''
      }
    });

    if (error) {
      console.error('Supabase function invoke error:', error);
      throw error;
    }
    
    console.log('Invitation email sent:', data);
    return true;
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};
