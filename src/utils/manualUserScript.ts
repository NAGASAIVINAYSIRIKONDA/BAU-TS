
// Manual User Addition Script
// Use this for testing purposes when email invitations are not working

export const generateManualUserSQL = (
  email: string,
  firstName: string,
  lastName: string,
  department: string | null = null,
  role: 'Admin' | 'HR' | 'Team_Lead' | 'Team_Member' = 'Team_Member'
) => {
  const userId = crypto.randomUUID();
  const displayName = `${firstName} ${lastName}`.trim();
  
  return `
-- Manual user addition for testing purposes
-- Email: ${email}
-- Role: ${role}

-- Step 1: Insert into auth.users (if not using Supabase Auth UI)
-- This would normally be handled by Supabase Auth, but for testing:

-- Step 2: Insert into profiles table
INSERT INTO public.profiles (id, email, first_name, last_name, display_name, department, is_active)
VALUES (
  '${userId}',
  '${email}',
  '${firstName}',
  '${lastName}',
  '${displayName}',
  ${department ? `'${department}'` : 'NULL'},
  true
);

-- Step 3: Assign role
INSERT INTO public.user_roles (user_id, role)
VALUES ('${userId}', '${role}');

-- Step 4: Create a dummy invitation record (optional, for consistency)
INSERT INTO public.invitations (email, role, invited_by, is_accepted, accepted_at)
SELECT 
  '${email}',
  '${role}',
  (SELECT id FROM public.profiles WHERE email = 'admin@company.com' LIMIT 1), -- Replace with actual admin
  true,
  now();

-- Note: For production, users should sign up through Supabase Auth
-- This script is only for testing when email invitations are not working
`;
};

export const getManualUserInstructions = () => `
Manual User Addition Instructions:

1. Go to Supabase Dashboard > SQL Editor
2. Use the generateManualUserSQL function to create SQL for each test user
3. Execute the generated SQL
4. Users can then log in normally through the auth system

Example usage:
const sql = generateManualUserSQL(
  'john.doe@example.com',
  'John',
  'Doe',
  'Engineering',
  'Team_Member'
);

Important Notes:
- This is only for testing purposes
- In production, fix the email invitation system
- Users added this way will need to create passwords through "Forgot Password" flow
- Make sure to replace admin email in the script with actual admin user
`;
