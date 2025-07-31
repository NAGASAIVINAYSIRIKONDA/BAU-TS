
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types/department";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDepartments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: departments = [], isLoading: loading } = useAuthenticatedQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      console.log('Fetching departments for user:', user?.id);
      
      const { data: departmentsData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: true });

      if (deptError) {
        console.error('Departments fetch error:', deptError);
        throw deptError;
      }

      console.log('Raw departments data:', departmentsData);

      // Get member counts for each department
      const departmentsWithCounts = await Promise.all(
        (departmentsData || []).map(async (dept) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('department', dept.name)
            .eq('is_active', true);
          
          return {
            ...dept,
            member_count: count || 0
          };
        })
      );

      console.log('Departments with counts:', departmentsWithCounts);
      return departmentsWithCounts as Department[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('departments')
        .insert([
          {
            name,
            description: description || null,
            created_by: user.id
          }
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'departments'] });
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating department:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create department",
        variant: "destructive",
      });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ departmentId, name, description }: { departmentId: string; name: string; description: string }) => {
      const { error } = await supabase
        .from('departments')
        .update({
          name,
          description: description || null,
        })
        .eq('id', departmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'teamMembers'] });
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating department:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update department",
        variant: "destructive",
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async ({ departmentId, memberCount }: { departmentId: string; memberCount: number }) => {
      // Check if department has active members
      if (memberCount > 0) {
        throw new Error('Cannot delete department with active members. Please reassign or deactivate members first.');
      }

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'departments'] });
      toast({
        title: "Success",
        description: "Department deleted successfully. Team members have been unassigned.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  const totalEmployees = departments.reduce((sum, dept) => sum + (dept.member_count || 0), 0);

  return {
    departments,
    loading,
    totalEmployees,
    createDepartment: async (name: string, description: string) => {
      try {
        await createDepartmentMutation.mutateAsync({ name, description });
        return true;
      } catch {
        return false;
      }
    },
    updateDepartment: async (departmentId: string, name: string, description: string) => {
      try {
        await updateDepartmentMutation.mutateAsync({ departmentId, name, description });
        return true;
      } catch {
        return false;
      }
    },
    deleteDepartment: async (departmentId: string, memberCount: number) => {
      try {
        await deleteDepartmentMutation.mutateAsync({ departmentId, memberCount });
        return true;
      } catch {
        return false;
      }
    },
    refreshDepartments: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'departments'] });
    }
  };
}
