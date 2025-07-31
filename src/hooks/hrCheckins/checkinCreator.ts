
import { supabase } from "@/integrations/supabase/client";
import { HRCheckin, CreateHRCheckinData } from "@/types/hrCheckin";

export const checkinCreator = {
  // Create a new check-in
  async createCheckin(checkinData: CreateHRCheckinData): Promise<HRCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('Creating check-in with data:', checkinData);

    // For department-wide check-ins, we need to use a placeholder member_id
    // since the database still requires this field to be non-null
    let actualMemberId = null;
    let actualDepartment = null;

    if (checkinData.member_id && checkinData.member_id.trim() !== "") {
      // Individual member check-in
      actualMemberId = checkinData.member_id;
    } else if (checkinData.department) {
      // Department-wide check-in - use the current user's ID as placeholder
      // This is a workaround until the database schema is properly updated
      actualMemberId = user.id;
      actualDepartment = checkinData.department;
    } else {
      throw new Error('Either member or department must be specified for check-in');
    }

    console.log('Processing check-in with:', { actualMemberId, actualDepartment });

    // Create the check-in with the workaround
    const { data: checkin, error: checkinError } = await supabase
      .from('hr_checkins')
      .insert({
        member_id: actualMemberId,
        checked_in_by: user.id,
        checkin_date: checkinData.checkin_date,
        department: actualDepartment,
        notes: checkinData.notes,
        status: 'Normal'
      })
      .select(`
        *,
        profiles!hr_checkins_member_id_fkey(id, first_name, last_name, email, department),
        checked_in_by_profile:profiles!hr_checkins_checked_in_by_fkey(first_name, last_name)
      `)
      .single();

    if (checkinError) {
      console.error('Checkin creation error:', checkinError);
      throw checkinError;
    }

    // Create follow-up tasks if any
    if (checkinData.followup_tasks.length > 0) {
      const tasksToInsert = checkinData.followup_tasks.map(task => ({
        checkin_id: checkin.id,
        task_description: task.description,
        assigned_to: task.assignedTo || null,
        status: 'Pending' as const
      }));

      const { error: tasksError } = await supabase
        .from('checkin_followup_tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Tasks creation error:', tasksError);
        throw tasksError;
      }
    }

    return {
      ...checkin,
      status: checkin.status as 'Normal' | 'Needs Support'
    };
  }
};
