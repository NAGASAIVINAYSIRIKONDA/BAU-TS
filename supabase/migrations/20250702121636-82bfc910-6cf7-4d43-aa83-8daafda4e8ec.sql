-- Update current user's role to Admin for testing
UPDATE public.user_roles 
SET role = 'Admin'
WHERE user_id = auth.uid() AND role = 'Team_Member';