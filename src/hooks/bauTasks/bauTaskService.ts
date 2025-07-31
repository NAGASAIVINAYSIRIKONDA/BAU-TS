import { supabase } from "@/integrations/supabase/client";
import { BAUTaskWithDetails, BAUTaskWithProgress, CreateBAUTaskInstanceData, UpdateBAUTaskInstanceData, CreateTaskKPIRecordData, CreateBAUProgressEntryData } from "@/types/bauTask";
import { calculateKPIScore, calculateAggregateProgress, calculatePeriodProgress } from "./progressCalculation";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function fetchBAUTasks(selectedDate?: Date): Promise<BAUTaskWithProgress[]> {
  let query = supabase
    .from('bau_task_instances')
    .select(`
      *,
      bau_templates (
        id,
        name,
        frequency,
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

  // Filter by selected month if provided
  if (selectedDate) {
    const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    
    query = query
      .gte('created_at', startDate)
      .lte('created_at', endDate + 'T23:59:59.999Z');
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchAvailableMonths(): Promise<string[]> {
  const { data, error } = await supabase
    .from('bau_task_instances')
    .select('created_at')
    .order('created_at', { ascending: false });

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

export async function createBAUTask(taskData: CreateBAUTaskInstanceData): Promise<void> {
  const { error } = await supabase
    .from('bau_task_instances')
    .insert(taskData);

  if (error) throw error;
}

export async function updateBAUTask(taskId: string, updates: UpdateBAUTaskInstanceData): Promise<void> {
  const { error } = await supabase
    .from('bau_task_instances')
    .update(updates)
    .eq('id', taskId);

  if (error) throw error;
}

export async function completeBAUTask(
  taskId: string, 
  kpiRecords: CreateTaskKPIRecordData[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Start transaction by updating task status
  const { error: taskError } = await supabase
    .from('bau_task_instances')
    .update({
      status: 'Completed',
      completed_at: new Date().toISOString(),
      completed_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);

  if (taskError) throw taskError;

  // Insert KPI records if provided
  if (kpiRecords.length > 0) {
    const recordsWithDefaults = kpiRecords.map(record => ({
      ...record,
      task_instance_id: taskId,
      recorded_by: user.id
    }));

    const { error: kpiError } = await supabase
      .from('task_kpi_records')
      .insert(recordsWithDefaults);

    if (kpiError) throw kpiError;
  }
}

export async function submitProgressEntry(
  periodId: string,
  entries: CreateBAUProgressEntryData[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the period and task information with KPI data
  const { data: period, error: periodError } = await supabase
    .from('bau_progress_periods')
    .select(`
      id,
      task_instance_id,
      bau_task_instances!inner (
        id,
        bau_templates!inner (
          template_kpis (
            id,
            target_value,
            operator
          )
        )
      )
    `)
    .eq('id', periodId)
    .single();

  if (periodError || !period) {
    throw periodError || new Error('Period not found');
  }

  // Calculate KPI scores for this period's entries
  const kpiScores = entries.map(entry => {
    const kpi = period.bau_task_instances.bau_templates.template_kpis.find(
      k => k.id === entry.template_kpi_id
    );
    
    if (!kpi) {
      return { score: 20 }; // Fallback minimum score
    }
    
    const score = calculateKPIScore(
      entry.recorded_value,
      kpi.target_value,
      kpi.operator as 'GreaterThanEqual' | 'LessThanEqual'
    );
    
    return { score };
  });

  // Insert progress entries
  const entriesWithDefaults = entries.map(entry => ({
    ...entry,
    period_id: periodId,
    recorded_by: user.id
  }));

  const { error } = await supabase
    .from('bau_progress_entries')
    .insert(entriesWithDefaults);

  if (error) {
    throw error;
  }

  // Mark period as completed
  const { error: periodError2 } = await supabase
    .from('bau_progress_periods')
    .update({ is_completed: true })
    .eq('id', periodId);

  if (periodError2) {
    throw periodError2;
  }

  // Update task progress with KPI-based calculation
  await updateTaskProgressWithKPIScoring(periodId, kpiScores);
}

async function updateTaskProgressWithKPIScoring(periodId: string, kpiScores: any[]): Promise<void> {
  // Get period and task information
  const { data: period, error: periodError } = await supabase
    .from('bau_progress_periods')
    .select('task_instance_id')
    .eq('id', periodId)
    .single();

  if (periodError || !period) throw periodError || new Error('Period not found');

  // Get all completed periods with their progress entries and KPI data
  const { data: completedPeriods, error: periodsError } = await supabase
    .from('bau_progress_periods')
    .select(`
      id,
      bau_progress_entries (
        recorded_value,
        template_kpi_id,
        template_kpis (
          target_value,
          operator
        )
      )
    `)
    .eq('task_instance_id', period.task_instance_id)
    .eq('is_completed', true);

  if (periodsError) throw periodsError;

  // Get task total periods
  const { data: task, error: taskError } = await supabase
    .from('bau_task_instances')
    .select('total_periods')
    .eq('id', period.task_instance_id)
    .single();

  if (taskError || !task) throw taskError || new Error('Task not found');

  const completedCount = completedPeriods?.length || 0;
  const totalPeriods = task.total_periods || 1;
  
  // Calculate average KPI score from all completed periods
  let averageScore = 0;
  if (completedCount > 0) {
    const allPeriodScores: number[] = [];
    
    completedPeriods?.forEach(period => {
      if (period.bau_progress_entries.length > 0) {
        const periodEntries = period.bau_progress_entries.map(entry => ({
          recorded_value: entry.recorded_value,
          template_kpi: {
            target_value: entry.template_kpis.target_value,
            operator: entry.template_kpis.operator
          }
        }));
        
        const periodScore = calculatePeriodProgress(periodEntries);
        allPeriodScores.push(periodScore);
      }
    });
    
    if (allPeriodScores.length > 0) {
      averageScore = Math.round(allPeriodScores.reduce((sum, score) => sum + score, 0) / allPeriodScores.length);
    }
  }
  
  const isCompleted = completedCount === totalPeriods;
  const newStatus = isCompleted ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Pending';

  console.log('Updating task progress:', {
    taskId: period.task_instance_id,
    completedCount,
    totalPeriods,
    isCompleted,
    newStatus,
    averageScore
  });

  // Update task progress with average KPI score and proper status
  const { error: updateError } = await supabase
    .from('bau_task_instances')
    .update({
      periods_completed: completedCount,
      progress_percentage: averageScore,
      score: averageScore,
      status: newStatus,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', period.task_instance_id);

  if (updateError) throw updateError;
}

export async function deleteBAUTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('bau_task_instances')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

export async function updateBAUProgressEntry(
  entryId: string,
  updates: { recorded_value: number; notes?: string | null }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First get the entry to find the period ID
  const { data: entry, error: fetchError } = await supabase
    .from('bau_progress_entries')
    .select('period_id')
    .eq('id', entryId)
    .single();

  if (fetchError || !entry) throw fetchError || new Error('Entry not found');

  // Update the entry
  const { error } = await supabase
    .from('bau_progress_entries')
    .update({
      recorded_value: updates.recorded_value,
      notes: updates.notes,
      recorded_at: new Date().toISOString()
    })
    .eq('id', entryId);

  if (error) throw error;

  // Recalculate task progress after the update
  await updateTaskProgressWithKPIScoring(entry.period_id, []);
}

export async function updateBAUProgressPeriod(
  periodId: string,
  isCompleted: boolean
): Promise<void> {
  const { error } = await supabase
    .from('bau_progress_periods')
    .update({ is_completed: isCompleted })
    .eq('id', periodId);

  if (error) throw error;
}

export async function generateTasksFromTemplate(templateId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get the template with its assignments and frequency
  const { data: template, error: templateError } = await supabase
    .from('bau_templates')
    .select(`
      *,
      template_assignments (
        user_id,
        profiles!template_assignments_user_id_fkey (id, first_name, last_name)
      )
    `)
    .eq('id', templateId)
    .eq('status', 'Active')
    .single();

  if (templateError) throw templateError;
  if (!template) throw new Error('Template not found or not active');

  // Create one task per assigned user
  const tasks: CreateBAUTaskInstanceData[] = template.template_assignments.map((assignment: any) => ({
    template_id: templateId,
    assigned_to: assignment.user_id,
    title: `${template.name} - ${assignment.profiles.first_name} ${assignment.profiles.last_name}`,
    description: template.description,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    priority: 'Medium',
    status: 'Pending'
  }));

  if (tasks.length > 0) {
    const { data: createdTasks, error: insertError } = await supabase
      .from('bau_task_instances')
      .insert(tasks)
      .select('id');

    if (insertError) throw insertError;

    // Create progress periods for each task
    for (const task of createdTasks || []) {
      const { error: periodError } = await supabase.rpc('create_task_periods', {
        task_instance_id: task.id,
        frequency: template.frequency,
        start_date: new Date().toISOString().split('T')[0]
      });

      if (periodError) throw periodError;
    }
  }
}
