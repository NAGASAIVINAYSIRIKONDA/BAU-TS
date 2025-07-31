export type AppRole = 'Admin' | 'HR' | 'Team_Lead' | 'Team_Member';

export interface Question {
  id: string;
  text: string;
  category: 'Accountability' | 'Decision-making' | 'Process efficiency' | 'Communication' | 'Role-specific KPIs';
  role: AppRole;
  isPredefined: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface QuestionnaireResponse {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  submittedAt: string;
  updatedAt?: string;
}

export interface UserQuestionnaire {
  userId: string;
  userEmail: string;
  userRole: AppRole;
  userName: string;
  responses: QuestionnaireResponse[];
  customQuestions: Question[];
  lastSubmitted?: string;
}

export interface PredefinedQuestions {
  [key in AppRole]: Question[];
} 