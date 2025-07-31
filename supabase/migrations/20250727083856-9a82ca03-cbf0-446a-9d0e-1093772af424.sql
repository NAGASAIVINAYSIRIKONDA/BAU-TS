-- Create trigger for department updates
CREATE TRIGGER on_department_update
  AFTER UPDATE ON public.departments
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_department_update();