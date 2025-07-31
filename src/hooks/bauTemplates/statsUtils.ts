
import { BAUTemplateWithDetails } from "@/types/bauTemplate";

export interface BAUTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  draftTemplates: number;
  deactivatedTemplates: number;
}

export const calculateBAUTemplateStats = (templates: BAUTemplateWithDetails[]): BAUTemplateStats => {
  return {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.status === 'Active').length,
    draftTemplates: templates.filter(t => t.status === 'Draft').length,
    deactivatedTemplates: templates.filter(t => t.status === 'Deactivated').length
  };
};
