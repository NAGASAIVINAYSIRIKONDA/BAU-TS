
-- First, let's clean up the orphaned department reference for "Khaja 2" user
UPDATE public.profiles 
SET department = NULL 
WHERE department = 'Design Team is the biggest';

-- Add a function to handle department deletion with member cleanup
CREATE OR REPLACE FUNCTION public.handle_department_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all team members assigned to this department to have NULL department
  UPDATE public.profiles 
  SET department = NULL 
  WHERE department = OLD.name;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean up team members when department is deleted
CREATE TRIGGER on_department_delete
  BEFORE DELETE ON public.departments
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_department_deletion();
