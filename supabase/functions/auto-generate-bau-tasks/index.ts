
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      bau_templates: any
      template_assignments: any
      bau_task_instances: any
      profiles: any
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting automatic BAU task generation...')

    // Get current month/year for duplicate prevention
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const dueDateThisMonth = new Date(currentYear, currentMonth, 0) // Last day of current month

    // Get all active BAU templates with their assignments
    const { data: templates, error: templatesError } = await supabaseClient
      .from('bau_templates')
      .select(`
        *,
        template_assignments (
          user_id,
          profiles!template_assignments_user_id_fkey (id, first_name, last_name)
        )
      `)
      .eq('status', 'Active')

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      throw templatesError
    }

    if (!templates || templates.length === 0) {
      console.log('No active templates found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active templates to generate tasks from',
          tasksCreated: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${templates.length} active templates`)

    let totalTasksCreated = 0

    // Process each template
    for (const template of templates) {
      if (!template.template_assignments || template.template_assignments.length === 0) {
        console.log(`Template ${template.name} has no assignments, skipping`)
        continue
      }

      console.log(`Processing template: ${template.name} with ${template.template_assignments.length} assignments`)

      // Check for existing tasks this month for this template
      const { data: existingTasks, error: existingError } = await supabaseClient
        .from('bau_task_instances')
        .select('id, assigned_to')
        .eq('template_id', template.id)
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)

      if (existingError) {
        console.error(`Error checking existing tasks for template ${template.id}:`, existingError)
        continue
      }

      const existingAssignedUsers = new Set(existingTasks?.map(task => task.assigned_to) || [])

      // Create tasks for users who don't have tasks this month
      const tasksToCreate = template.template_assignments
        .filter((assignment: any) => !existingAssignedUsers.has(assignment.user_id))
        .map((assignment: any) => ({
          template_id: template.id,
          assigned_to: assignment.user_id,
          title: `${template.name} - ${assignment.profiles.first_name} ${assignment.profiles.last_name}`,
          description: template.description,
          due_date: dueDateThisMonth.toISOString().split('T')[0],
          priority: 'Medium',
          status: 'Pending'
        }))

      if (tasksToCreate.length === 0) {
        console.log(`All users already have tasks for template ${template.name} this month`)
        continue
      }

      // Insert new tasks
      const { data: createdTasks, error: insertError } = await supabaseClient
        .from('bau_task_instances')
        .insert(tasksToCreate)
        .select('id')

      if (insertError) {
        console.error(`Error creating tasks for template ${template.id}:`, insertError)
        continue
      }

      console.log(`Created ${createdTasks?.length || 0} tasks for template ${template.name}`)
      totalTasksCreated += createdTasks?.length || 0

      // Create progress periods for each new task
      if (createdTasks) {
        for (const task of createdTasks) {
          const { error: periodError } = await supabaseClient.rpc('create_task_periods', {
            task_instance_id: task.id,
            frequency: template.frequency,
            start_date: now.toISOString().split('T')[0]
          })

          if (periodError) {
            console.error(`Error creating periods for task ${task.id}:`, periodError)
          }
        }
      }
    }

    console.log(`Task generation completed. Total tasks created: ${totalTasksCreated}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${totalTasksCreated} BAU tasks for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        tasksCreated: totalTasksCreated,
        templatesProcessed: templates.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in auto-generate-bau-tasks:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
