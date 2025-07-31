
import { BAUTemplateStatus } from "@/types/bauTemplate";

export const getStatusUpdateMessage = (status: BAUTemplateStatus): string => {
  switch (status) {
    case 'Active':
      return 'Template activated successfully';
    case 'Deactivated':
      return 'Template deactivated successfully';
    case 'Draft':
      return 'Template saved as draft';
    default:
      return 'Template status updated successfully';
  }
};

export const TOAST_MESSAGES = {
  CREATE_SUCCESS: 'BAU template created successfully',
  CREATE_ERROR: 'Failed to create BAU template',
  DELETE_SUCCESS: 'Template deleted successfully',
  DELETE_ERROR: 'Failed to delete template',
  FETCH_ERROR: 'Failed to fetch BAU templates',
  UPDATE_STATUS_ERROR: 'Failed to update template status'
} as const;
