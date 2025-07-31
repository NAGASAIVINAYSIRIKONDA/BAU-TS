
import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface TeamMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean | null;
  created_at: string | null;
  role: AppRole;
  isPendingInvitation: boolean;
}

export interface CreateTeamMemberData {
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  department: string;
  position?: string;
  isActive?: boolean;
}
