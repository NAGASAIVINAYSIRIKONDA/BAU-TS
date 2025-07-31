-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('Admin', 'HR', 'Team_Lead', 'Team_Member');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role app_role NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_accepted BOOLEAN DEFAULT false,
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 ORDER BY assigned_at DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'Admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_hr_or_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role IN ('Admin', 'HR')
  );
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Create RLS policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Create RLS policies for invitations
CREATE POLICY "HR and Admins can view invitations" ON public.invitations
  FOR SELECT USING (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "HR and Admins can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (public.is_hr_or_admin(auth.uid()));

CREATE POLICY "HR and Admins can update invitations" ON public.invitations
  FOR UPDATE USING (public.is_hr_or_admin(auth.uid()));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );

  -- Check if user was invited and assign role
  SELECT * INTO invitation_record 
  FROM public.invitations 
  WHERE email = NEW.email AND is_accepted = false AND expires_at > NOW();

  IF FOUND THEN
    -- Assign the role from invitation
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, invitation_record.role, invitation_record.invited_by);
    
    -- Mark invitation as accepted
    UPDATE public.invitations 
    SET is_accepted = true, accepted_at = NOW()
    WHERE id = invitation_record.id;
  ELSE
    -- Default role for users without invitation (shouldn't happen in invite-only system)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Team_Member');
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);

-- Insert admin user profile manually (this will be your access)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'khaja@tericsoft.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID and insert profile and role
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'khaja@tericsoft.com';
  
  INSERT INTO public.profiles (id, email, first_name, last_name, display_name)
  VALUES (admin_user_id, 'khaja@tericsoft.com', 'Khaja', 'Admin', 'Khaja Admin');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'Admin');
END $$;