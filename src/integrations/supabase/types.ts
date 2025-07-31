export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bau_progress_entries: {
        Row: {
          id: string
          notes: string | null
          period_id: string
          recorded_at: string
          recorded_by: string
          recorded_value: number
          template_kpi_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          period_id: string
          recorded_at?: string
          recorded_by: string
          recorded_value: number
          template_kpi_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          period_id?: string
          recorded_at?: string
          recorded_by?: string
          recorded_value?: number
          template_kpi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bau_progress_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "bau_progress_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bau_progress_entries_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bau_progress_entries_template_kpi_id_fkey"
            columns: ["template_kpi_id"]
            isOneToOne: false
            referencedRelation: "template_kpis"
            referencedColumns: ["id"]
          },
        ]
      }
      bau_progress_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_completed: boolean
          period_name: string
          period_number: number
          start_date: string
          task_instance_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_completed?: boolean
          period_name: string
          period_number: number
          start_date: string
          task_instance_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_completed?: boolean
          period_name?: string
          period_number?: number
          start_date?: string
          task_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bau_progress_periods_task_instance_id_fkey"
            columns: ["task_instance_id"]
            isOneToOne: false
            referencedRelation: "bau_task_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      bau_task_instances: {
        Row: {
          assigned_to: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          periods_completed: number | null
          priority: string
          progress_percentage: number | null
          score: number | null
          status: string
          template_id: string
          title: string
          total_periods: number | null
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          periods_completed?: number | null
          priority?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string
          template_id: string
          title: string
          total_periods?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          periods_completed?: number | null
          priority?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string
          template_id?: string
          title?: string
          total_periods?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bau_task_instances_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bau_task_instances_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bau_task_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bau_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      bau_templates: {
        Row: {
          created_at: string
          created_by: string
          deactivated_at: string | null
          deactivated_by: string | null
          department: string
          description: string | null
          frequency: Database["public"]["Enums"]["bau_frequency"]
          id: string
          name: string
          status: Database["public"]["Enums"]["bau_template_status"]
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          department: string
          description?: string | null
          frequency: Database["public"]["Enums"]["bau_frequency"]
          id?: string
          name: string
          status?: Database["public"]["Enums"]["bau_template_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          department?: string
          description?: string | null
          frequency?: Database["public"]["Enums"]["bau_frequency"]
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["bau_template_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bau_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bau_templates_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_followup_tasks: {
        Row: {
          assigned_to: string | null
          checkin_id: string
          created_at: string
          id: string
          status: string
          task_description: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          checkin_id: string
          created_at?: string
          id?: string
          status?: string
          task_description: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          checkin_id?: string
          created_at?: string
          id?: string
          status?: string
          task_description?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_followup_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_followup_tasks_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "hr_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_task_updates: {
        Row: {
          id: string
          new_checkin_id: string
          new_status: string
          original_task_id: string
          previous_status: string
          updated_at: string
        }
        Insert: {
          id?: string
          new_checkin_id: string
          new_status: string
          original_task_id: string
          previous_status: string
          updated_at?: string
        }
        Update: {
          id?: string
          new_checkin_id?: string
          new_status?: string
          original_task_id?: string
          previous_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_task_updates_new_checkin_id_fkey"
            columns: ["new_checkin_id"]
            isOneToOne: false
            referencedRelation: "hr_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_task_updates_original_task_id_fkey"
            columns: ["original_task_id"]
            isOneToOne: false
            referencedRelation: "checkin_followup_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_checkins: {
        Row: {
          checked_in_by: string
          checkin_date: string
          created_at: string
          department: string | null
          id: string
          member_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          checked_in_by: string
          checkin_date?: string
          created_at?: string
          department?: string | null
          id?: string
          member_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          checked_in_by?: string
          checkin_date?: string
          created_at?: string
          department?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_checkins_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string
          is_accepted: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by: string
          is_accepted?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string
          is_accepted?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      task_kpi_records: {
        Row: {
          id: string
          recorded_at: string
          recorded_by: string
          recorded_value: number
          task_instance_id: string
          template_kpi_id: string
        }
        Insert: {
          id?: string
          recorded_at?: string
          recorded_by: string
          recorded_value: number
          task_instance_id: string
          template_kpi_id: string
        }
        Update: {
          id?: string
          recorded_at?: string
          recorded_by?: string
          recorded_value?: number
          task_instance_id?: string
          template_kpi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_kpi_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_kpi_records_task_instance_id_fkey"
            columns: ["task_instance_id"]
            isOneToOne: false
            referencedRelation: "bau_task_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_kpi_records_template_kpi_id_fkey"
            columns: ["template_kpi_id"]
            isOneToOne: false
            referencedRelation: "template_kpis"
            referencedColumns: ["id"]
          },
        ]
      }
      template_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          id?: string
          template_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bau_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_kpis: {
        Row: {
          created_at: string
          id: string
          name: string
          operator: Database["public"]["Enums"]["kpi_operator"]
          source: string | null
          target_value: number
          template_id: string
          unit: Database["public"]["Enums"]["kpi_unit"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          operator: Database["public"]["Enums"]["kpi_operator"]
          source?: string | null
          target_value: number
          template_id: string
          unit: Database["public"]["Enums"]["kpi_unit"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          operator?: Database["public"]["Enums"]["kpi_operator"]
          source?: string | null
          target_value?: number
          template_id?: string
          unit?: Database["public"]["Enums"]["kpi_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "template_kpis_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bau_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_department_data: {
        Args: { user_id: string; target_department: string }
        Returns: boolean
      }
      create_task_periods: {
        Args: {
          task_instance_id: string
          frequency: Database["public"]["Enums"]["bau_frequency"]
          start_date: string
        }
        Returns: undefined
      }
      get_member_bau_summary: {
        Args: {
          p_member_id: string
          p_date_range_start?: string
          p_date_range_end?: string
        }
        Returns: {
          active_baus_count: number
          completed_baus_count: number
          at_risk_count: number
          avg_progress_percentage: number
        }[]
      }
      get_user_department: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_hr_or_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_team_lead: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Admin" | "HR" | "Team_Lead" | "Team_Member"
      bau_frequency: "Daily" | "Weekly" | "Bi-Weekly" | "Monthly"
      bau_template_status: "Draft" | "Active" | "Deactivated"
      kpi_operator: "GreaterThanEqual" | "LessThanEqual"
      kpi_unit: "Percentage" | "Count"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["Admin", "HR", "Team_Lead", "Team_Member"],
      bau_frequency: ["Daily", "Weekly", "Bi-Weekly", "Monthly"],
      bau_template_status: ["Draft", "Active", "Deactivated"],
      kpi_operator: ["GreaterThanEqual", "LessThanEqual"],
      kpi_unit: ["Percentage", "Count"],
    },
  },
} as const
