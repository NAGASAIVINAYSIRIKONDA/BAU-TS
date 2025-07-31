
import { supabase } from "@/integrations/supabase/client";
import { BAUTaskWithProgress } from "@/types/bauTask";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function fetchDepartmentAwareBAUTasks(
  selectedDate?: Date,
  userRole?: string,
  userDepartment?: string,
  userId?: string
): Promise<BAUTaskWithProgress[]> {
  console.log('Fetching department-aware BAU tasks with filters:', {
    selectedDate,
    userRole,
    userDepartment,
    userId
  });

  let query = supabase
    .from('bau_task_instances')
    .select(`
      *,
      bau_templates (
        id,
        name,
        frequency,
        department,
        template_kpis (
          id,
          name,
          unit,
          operator,
          target_value
        )
      ),
      profiles!bau_task_instances_assigned_to_fkey (
        id,
        first_name,
        last_name,
        email,
        department
      ),
      task_kpi_records (*),
      bau_progress_periods (
        *,
        bau_progress_entries (
          *,
          template_kpis (
            id,
            name,
            unit,
            operator,
            target_value
          )
        )
      )
    `);

  // Apply role-based filtering
  if (userRole === 'Team_Member' && userId) {
    // Team members only see their own tasks
    query = query.eq('assigned_to', userId);
  } else if (userRole === 'Team_Lead' && userDepartment) {
    // Team leads see tasks for their department members
    // First get all users from the department
    const { data: departmentUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('department', userDepartment);
    
    if (departmentUsers && departmentUsers.length > 0) {
      const userIds = departmentUsers.map(user => user.id);
      query = query.in('assigned_to', userIds);
    } else {
      // If no department users found, return empty result
      query = query.eq('assigned_to', 'no-users-found');
    }
  }
  // Admin and HR see all tasks (no additional filtering)

  // Filter by selected month if provided
  if (selectedDate) {
    const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    
    query = query
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z');
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching department-aware BAU tasks:', error);
    throw error;
  }

  console.log('Department-aware BAU tasks loaded:', data?.length || 0, 'tasks');
  return data || [];
}

export async function fetchDepartmentAwareAvailableMonths(
  userRole?: string,
  userDepartment?: string,
  userId?: string
): Promise<string[]> {
  let query = supabase
    .from('bau_task_instances')
    .select('created_at');

  // Apply same role-based filtering
  if (userRole === 'Team_Member' && userId) {
    query = query.eq('assigned_to', userId);
  } else if (userRole === 'Team_Lead' && userDepartment) {
    // For Team_Lead, get department users first then filter
    const { data: departmentUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('department', userDepartment);
    
    if (departmentUsers && departmentUsers.length > 0) {
      const userIds = departmentUsers.map(user => user.id);
      query = query.in('assigned_to', userIds);
    } else {
      // If no department users found, return empty result
      query = query.eq('assigned_to', 'no-users-found');
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) return [];

  // Extract unique months from the created_at dates
  const months = new Set<string>();
  data.forEach(task => {
    const date = new Date(task.created_at);
    const monthYear = format(date, 'yyyy-MM');
    months.add(monthYear);
  });

  return Array.from(months).sort().reverse();
}
