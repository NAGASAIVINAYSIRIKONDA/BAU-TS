-- Update the handle_new_user function to handle role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invitation_record RECORD;
  user_role TEXT;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name, display_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      NEW.email
    ),
    true
  );

  -- Get role from metadata or check invitation
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Check if user was invited and assign role
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE email = NEW.email AND is_accepted = false AND expires_at > NOW();

  IF FOUND THEN
    -- Assign the role from invitation (overrides metadata)
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, invitation_record.role, invitation_record.invited_by);
    
    -- Mark invitation as accepted
    UPDATE public.invitations 
    SET is_accepted = true, accepted_at = NOW()
    WHERE id = invitation_record.id;
  ELSIF user_role IS NOT NULL AND user_role IN ('Admin', 'HR', 'Team_Lead', 'Team_Member') THEN
    -- Assign role from metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role::app_role);
  ELSE
    -- Default role for users without invitation or valid metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Team_Member');
  END IF;

  RETURN NEW;
END;
$function$; 