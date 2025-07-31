export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  data?: ChatResponseData;
}

export interface ChatResponse {
  message: string;
  data?: ChatResponseData;
}

export interface ChatResponseData {
  tasks?: any[];
  templates?: any[];
  checkins?: any[];
  stats?: any;
  teamMembers?: any[];
  userFAQs?: UserFAQ[];
  globalFAQs?: string[];
  questionnaireStats?: {
    completedResponses: number;
    lastSubmitted?: string;
  };
}

export interface UserFAQ {
  question: string;
  count: number;
}

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string;
  progress_percentage: number | null;
  assigned_to: string;
}

export interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  status: string;
  department: string;
}

export interface CheckinData {
  id: string;
  member_id: string;
  checkin_date: string;
  status: string;
  notes: string | null;
  department: string | null;
}

export interface DepartmentData {
  id: string;
  name: string;
  description: string | null;
}

export interface TeamMemberData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  department: string | null;
  position: string | null;
  is_active: boolean | null;
} 