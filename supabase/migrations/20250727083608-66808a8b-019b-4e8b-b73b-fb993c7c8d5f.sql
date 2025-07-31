-- Create trigger function to handle department name updates
CREATE OR REPLACE FUNCTION public.handle_department_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- If department name changed, update all profiles that reference the old name
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public.profiles 
    SET department = NEW.name 
    WHERE department = OLD.name;
  END IF;
  
  RETURN NEW;
END;
$function$

-- Create trigger for department updates
DROP TRIGGER IF EXISTS on_department_update ON public.departments;
CREATE TRIGGER on_department_update
  AFTER UPDATE ON public.departments
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_department_update();