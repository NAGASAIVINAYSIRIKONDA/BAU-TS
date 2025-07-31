-- Add source column to template_kpis table
ALTER TABLE public.template_kpis 
ADD COLUMN source text;