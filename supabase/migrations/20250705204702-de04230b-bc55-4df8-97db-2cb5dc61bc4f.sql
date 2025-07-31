
-- Update the bau_frequency enum to include 'Bi-Weekly' and remove 'Quarterly'
ALTER TYPE public.bau_frequency RENAME TO bau_frequency_old;

CREATE TYPE public.bau_frequency AS ENUM ('Daily', 'Weekly', 'Bi-Weekly', 'Monthly');

-- Update the bau_templates table to use the new enum
ALTER TABLE public.bau_templates 
  ALTER COLUMN frequency TYPE public.bau_frequency 
  USING frequency::text::public.bau_frequency;

-- Drop the old enum type
DROP TYPE public.bau_frequency_old;
