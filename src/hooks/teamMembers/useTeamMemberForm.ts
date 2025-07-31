
import { useState, useEffect } from "react";
import { TeamMember, CreateTeamMemberData, AppRole } from "@/types/teamMember";
import { supabase } from "@/integrations/supabase/client";

interface Department {
  id: string;
  name: string;
}

export function useTeamMemberForm(isEdit: boolean, teamMember?: TeamMember) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<CreateTeamMemberData & { isActive?: boolean }>({
    firstName: teamMember?.first_name || "",
    lastName: teamMember?.last_name || "",
    email: teamMember?.email || "",
    role: teamMember?.role || "Team_Member",
    department: teamMember?.department || "",
    position: teamMember?.position || "",
    isActive: teamMember?.is_active ?? true,
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      setDepartments(data || []);
    };

    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "Team_Member",
      department: "",
      position: "",
      isActive: true,
    });
  };

  const updateFormData = (updates: Partial<CreateTeamMemberData & { isActive?: boolean }>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const initializeFormData = (member: TeamMember) => {
    setFormData({
      firstName: member.first_name || "",
      lastName: member.last_name || "",
      email: member.email || "",
      role: member.role || "Team_Member",
      department: member.department || "",
      position: member.position || "",
      isActive: member.is_active ?? true,
    });
  };

  const roleOptions: { value: AppRole; label: string }[] = [
    { value: "Team_Member", label: "Team Member" },
    { value: "Team_Lead", label: "Team Lead" },
    { value: "HR", label: "HR" },
  ];

  return {
    departments,
    formData,
    roleOptions,
    resetForm,
    updateFormData,
    initializeFormData,
  };
}
