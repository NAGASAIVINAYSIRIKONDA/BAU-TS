
import { Database } from "@/integrations/supabase/types";

export type BAUTemplate = Database["public"]["Tables"]["bau_templates"]["Row"];
export type CreateBAUTemplateData = Database["public"]["Tables"]["bau_templates"]["Insert"];
export type UpdateBAUTemplateData = Database["public"]["Tables"]["bau_templates"]["Update"];

export type TemplateKPI = Database["public"]["Tables"]["template_kpis"]["Row"];
export type CreateTemplateKPIData = Database["public"]["Tables"]["template_kpis"]["Insert"];

export type TemplateAssignment = Database["public"]["Tables"]["template_assignments"]["Row"];
export type CreateTemplateAssignmentData = Database["public"]["Tables"]["template_assignments"]["Insert"];

export type BAUFrequency = Database["public"]["Enums"]["bau_frequency"];
export type BAUTemplateStatus = Database["public"]["Enums"]["bau_template_status"];
export type KPIUnit = Database["public"]["Enums"]["kpi_unit"];
export type KPIOperator = Database["public"]["Enums"]["kpi_operator"];

export interface BAUTemplateWithDetails extends BAUTemplate {
  template_kpis: TemplateKPI[];
  template_assignments: (TemplateAssignment & {
    profiles: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
    } | null;
  })[];
  assigned_member_count: number;
}

export interface CreateBAUTemplateFormData {
  name: string;
  description: string;
  department: string;
  frequency: "Daily" | "Weekly" | "Bi-Weekly" | "Monthly";
  kpis: {
    name: string;
    unit: KPIUnit;
    operator: KPIOperator;
    target_value: number;
    source?: string;
  }[];
  assigned_members: string[];
}
