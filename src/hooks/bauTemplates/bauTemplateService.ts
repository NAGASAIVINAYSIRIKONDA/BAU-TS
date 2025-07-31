
import { supabase } from "@/integrations/supabase/client";
import { BAUTemplateWithDetails, CreateBAUTemplateFormData, BAUTemplateStatus } from "@/types/bauTemplate";

export const fetchBAUTemplates = async (includeDeactivated: boolean = false): Promise<BAUTemplateWithDetails[]> => {
  let query = supabase
    .from('bau_templates')
    .select(`
      *,
      template_kpis (*),
      template_assignments!inner (
        *,
        profiles!template_assignments_user_id_fkey!inner (
          id,
          first_name,
          last_name,
          email,
          is_active
        )
      )
     `)
    .eq('template_assignments.profiles.is_active', true);

  // Filter based on includeDeactivated parameter
  if (!includeDeactivated) {
    query = query.neq('status', 'Deactivated');
  }

  const { data: templatesData, error: templatesError } = await query
    .order('created_at', { ascending: false });

  if (templatesError) throw templatesError;

  return (templatesData || []).map(template => ({
    ...template,
    assigned_member_count: template.template_assignments?.length || 0
  }));
};

export const createBAUTemplate = async (templateData: CreateBAUTemplateFormData): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Create the template
  const { data: template, error: templateError } = await supabase
    .from('bau_templates')
    .insert({
      name: templateData.name,
      description: templateData.description,
      department: templateData.department,
      frequency: templateData.frequency,
      created_by: user.id
    })
    .select()
    .single();

  if (templateError) throw templateError;

  // Create KPIs
  if (templateData.kpis.length > 0) {
    const { error: kpisError } = await supabase
      .from('template_kpis')
      .insert(
        templateData.kpis.map(kpi => ({
          template_id: template.id,
          name: kpi.name,
          unit: kpi.unit,
          operator: kpi.operator,
          target_value: kpi.target_value,
          source: kpi.source || null
        }))
      );

    if (kpisError) throw kpisError;
  }

  // Create assignments
  if (templateData.assigned_members.length > 0) {
    const { error: assignmentsError } = await supabase
      .from('template_assignments')
      .insert(
        templateData.assigned_members.map(memberId => ({
          template_id: template.id,
          user_id: memberId,
          assigned_by: user.id
        }))
      );

    if (assignmentsError) throw assignmentsError;
  }

  return true;
};

export const updateBAUTemplateStatus = async (templateId: string, status: BAUTemplateStatus): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: any = { status };
  
  if (status === 'Deactivated') {
    updateData.deactivated_at = new Date().toISOString();
    updateData.deactivated_by = user.id;
  }

  const { error } = await supabase
    .from('bau_templates')
    .update(updateData)
    .eq('id', templateId);

  if (error) throw error;

  return true;
};

export const updateBAUTemplate = async (templateId: string, templateData: CreateBAUTemplateFormData): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Start transaction by updating the template
  const { error: templateError } = await supabase
    .from('bau_templates')
    .update({
      name: templateData.name,
      description: templateData.description,
      department: templateData.department,
      frequency: templateData.frequency,
    })
    .eq('id', templateId);

  if (templateError) throw templateError;

  // Delete existing KPIs and create new ones
  const { error: deleteKpisError } = await supabase
    .from('template_kpis')
    .delete()
    .eq('template_id', templateId);

  if (deleteKpisError) throw deleteKpisError;

  // Create new KPIs
  if (templateData.kpis.length > 0) {
    const { error: kpisError } = await supabase
      .from('template_kpis')
      .insert(
        templateData.kpis.map(kpi => ({
          template_id: templateId,
          name: kpi.name,
          unit: kpi.unit,
          operator: kpi.operator,
          target_value: kpi.target_value,
          source: kpi.source || null
        }))
      );

    if (kpisError) throw kpisError;
  }

  // Delete existing assignments and create new ones
  const { error: deleteAssignmentsError } = await supabase
    .from('template_assignments')
    .delete()
    .eq('template_id', templateId);

  if (deleteAssignmentsError) throw deleteAssignmentsError;

  // Create new assignments
  if (templateData.assigned_members.length > 0) {
    const { error: assignmentsError } = await supabase
      .from('template_assignments')
      .insert(
        templateData.assigned_members.map(memberId => ({
          template_id: templateId,
          user_id: memberId,
          assigned_by: user.id
        }))
      );

    if (assignmentsError) throw assignmentsError;
  }

  return true;
};

export const deleteBAUTemplate = async (templateId: string, status: BAUTemplateStatus): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If template is in Draft status, allow full deletion
  if (status === 'Draft') {
    const { error } = await supabase
      .from('bau_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  } else {
    // For Active/Deactivated templates, mark as deactivated to preserve history
    const { error } = await supabase
      .from('bau_templates')
      .update({
        status: 'Deactivated',
        deactivated_at: new Date().toISOString(),
        deactivated_by: user.id
      })
      .eq('id', templateId);

    if (error) throw error;
  }

  return true;
};
