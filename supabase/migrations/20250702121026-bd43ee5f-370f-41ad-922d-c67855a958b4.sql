-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for department access
CREATE POLICY "Everyone can view departments" 
ON public.departments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "HR and Admins can create departments" 
ON public.departments 
FOR INSERT 
WITH CHECK (is_hr_or_admin(auth.uid()));

CREATE POLICY "HR and Admins can update departments" 
ON public.departments 
FOR UPDATE 
USING (is_hr_or_admin(auth.uid()));

CREATE POLICY "HR and Admins can delete departments" 
ON public.departments 
FOR DELETE 
USING (is_hr_or_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON public.departments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();