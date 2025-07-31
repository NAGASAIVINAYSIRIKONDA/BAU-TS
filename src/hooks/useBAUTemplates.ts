
import { useToast } from "@/hooks/use-toast";
import { BAUTemplateWithDetails, CreateBAUTemplateFormData, BAUTemplateStatus } from "@/types/bauTemplate";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthenticatedQuery } from "./useAuthenticatedQuery";
import { useUserRole } from "./useUserRole";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchBAUTemplates, 
  createBAUTemplate as createBAUTemplateService, 
  updateBAUTemplateStatus as updateBAUTemplateStatusService,
  updateBAUTemplate as updateBAUTemplateService,
  deleteBAUTemplate as deleteBAUTemplateService 
} from "./bauTemplates/bauTemplateService";
import { calculateBAUTemplateStats, BAUTemplateStats } from "./bauTemplates/statsUtils";
import { getStatusUpdateMessage, TOAST_MESSAGES } from "./bauTemplates/toastMessages";

export function useBAUTemplates(includeDeactivated: boolean = false) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { role, department: userDepartment, isTeamLead } = useUserRole();

  const { data: templates = [], isLoading: loading } = useAuthenticatedQuery({
    queryKey: ['bauTemplates', role, userDepartment, includeDeactivated ? 'with-deactivated' : 'active-only'],
    queryFn: async () => {
      console.log('Fetching BAU templates for user:', user?.id, 'role:', role, 'department:', userDepartment, 'includeDeactivated:', includeDeactivated);
      const templatesData = await fetchBAUTemplates(includeDeactivated);
      
      // Filter templates for Team Leads
      const filteredTemplates = isTeamLead && userDepartment
        ? templatesData.filter(template => template.department === userDepartment)
        : templatesData;
      
      console.log('BAU templates loaded:', filteredTemplates.length, 'filtered for role/department');
      return filteredTemplates;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createTemplateMutation = useMutation({
    mutationFn: createBAUTemplateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTemplates'] });
      toast({
        title: "Success",
        description: TOAST_MESSAGES.CREATE_SUCCESS,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.CREATE_ERROR,
        variant: "destructive",
      });
      console.error('Error creating BAU template:', error);
    },
  });

  const updateTemplateStatusMutation = useMutation({
    mutationFn: ({ templateId, status }: { templateId: string; status: BAUTemplateStatus }) => 
      updateBAUTemplateStatusService(templateId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTemplates'] });
      toast({
        title: "Success",
        description: getStatusUpdateMessage(status),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.UPDATE_STATUS_ERROR,
        variant: "destructive",
      });
      console.error('Error updating template status:', error);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: CreateBAUTemplateFormData }) => 
      updateBAUTemplateService(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTemplates'] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
      console.error('Error updating template:', error);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: ({ templateId, status }: { templateId: string; status: BAUTemplateStatus }) => 
      deleteBAUTemplateService(templateId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTemplates'] });
      const message = status === 'Draft' ? 'Template deleted successfully' : 'Template deactivated successfully';
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || TOAST_MESSAGES.DELETE_ERROR,
        variant: "destructive",
      });
      console.error('Error deleting template:', error);
    },
  });

  const stats: BAUTemplateStats = calculateBAUTemplateStats(templates);

  return {
    templates,
    loading,
    stats,
    createTemplate: async (templateData: CreateBAUTemplateFormData): Promise<boolean> => {
      try {
        await createTemplateMutation.mutateAsync(templateData);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    updateTemplateStatus: async (templateId: string, status: BAUTemplateStatus): Promise<boolean> => {
      try {
        await updateTemplateStatusMutation.mutateAsync({ templateId, status });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    updateTemplate: async (templateId: string, data: CreateBAUTemplateFormData): Promise<boolean> => {
      try {
        await updateTemplateMutation.mutateAsync({ templateId, data });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    deleteTemplate: async (templateId: string, status: BAUTemplateStatus): Promise<boolean> => {
      try {
        await deleteTemplateMutation.mutateAsync({ templateId, status });
        return true;
      } catch (error: any) {
        return false;
      }
    },
    refreshTemplates: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticated', 'bauTemplates'] });
    }
  };
}
