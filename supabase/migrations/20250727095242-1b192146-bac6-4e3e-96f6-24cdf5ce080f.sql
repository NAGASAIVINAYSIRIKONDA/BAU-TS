-- Fix missing progress periods for existing BAU task instances
-- This will create progress periods for any task that doesn't have them

DO $$
DECLARE
    task_record RECORD;
    task_frequency bau_frequency;
    task_start_date date;
BEGIN
    -- Find all task instances that don't have progress periods
    FOR task_record IN 
        SELECT bti.id, bti.created_at, bt.frequency 
        FROM bau_task_instances bti
        LEFT JOIN bau_templates bt ON bti.template_id = bt.id
        LEFT JOIN bau_progress_periods bpp ON bti.id = bpp.task_instance_id
        WHERE bpp.id IS NULL
    LOOP
        -- Set the start date to the task creation date
        task_start_date := task_record.created_at::date;
        task_frequency := task_record.frequency;
        
        -- Create progress periods for this task
        PERFORM create_task_periods(task_record.id, task_frequency, task_start_date);
        
        RAISE NOTICE 'Created progress periods for task %', task_record.id;
    END LOOP;
END $$;