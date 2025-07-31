import { SupabaseClient } from '@supabase/supabase-js';
import { ChatResponse, ChatResponseData, TaskData, TemplateData, CheckinData, DepartmentData, TeamMemberData } from './types';
import { globalFAQs } from "./faqs";

export class ChatbotService {
  private supabase: SupabaseClient;
  private userId: string | undefined;
  private userRole: string | undefined;
  private userDepartment: string | undefined;

  constructor(
    supabase: SupabaseClient,
    userId: string | undefined,
    userRole: string | undefined,
    userDepartment: string | undefined
  ) {
    this.supabase = supabase;
    this.userId = userId;
    this.userRole = userRole;
    this.userDepartment = userDepartment;
  }

  // Add this method to fetch user FAQs
  private async getUserFAQs(): Promise<UserFAQ[]> {
    const { data, error } = await this.supabase
      .from('user_question_stats')
      .select('question, count')
      .eq('user_id', this.userId)
      .order('count', { ascending: false })
      .limit(3);
    if (error) return [];
    return data as UserFAQ[];
  }

  // Add this method to update user question count
  private async updateUserFAQ(question: string) {
    // Upsert logic: increment count if exists, else insert
    await this.supabase.rpc('increment_user_question_count', {
      user_id: this.userId,
      question
    });
  }

  private matchesQuestionnaireQuery(message: string): boolean {
    const questionnaireKeywords = ['questionnaire', 'survey', 'questions', 'assessment', 'evaluation'];
    return questionnaireKeywords.some(keyword => message.includes(keyword));
  }

  private async handleQuestionnaireQuery(message: string): Promise<ChatResponse> {
    try {
      const { data: responses, error } = await this.supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', this.userId);

      if (error) throw error;

      if (!responses || responses.length === 0) {
        return {
          message: "You haven't completed any questionnaires yet. You can access the questionnaire from the sidebar to get started.",
        };
      }

      const completedCount = responses.length;
      
      return {
        message: `You have completed ${completedCount} questionnaire responses. You can view and update your responses in the Questionnaire section.`,
        data: {
          questionnaireStats: {
            completedResponses: completedCount,
            lastSubmitted: responses[0]?.submitted_at
          }
        }
      };
    } catch (error) {
      console.error('Error fetching questionnaire data:', error);
      return {
        message: "I couldn't fetch your questionnaire data at the moment. Please try again later.",
      };
    }
  }

  async processMessage(message: string): Promise<ChatResponse> {
    // Track the question for user stats
    await this.updateUserFAQ(message);
    const lowerMessage = message.toLowerCase();
    
    // Task-related queries
    if (this.matchesTaskQuery(lowerMessage)) {
      return await this.handleTaskQuery(lowerMessage);
    }
    
    // Template/OKR queries
    if (this.matchesTemplateQuery(lowerMessage)) {
      return await this.handleTemplateQuery(lowerMessage);
    }
    
    // Check-in queries
    if (this.matchesCheckinQuery(lowerMessage)) {
      return await this.handleCheckinQuery(lowerMessage);
    }
    
    // Department queries
    if (this.matchesDepartmentQuery(lowerMessage)) {
      return await this.handleDepartmentQuery(lowerMessage);
    }
    
    // Team member queries
    if (this.matchesTeamMemberQuery(lowerMessage)) {
      return await this.handleTeamMemberQuery(lowerMessage);
    }
    
    // Questionnaire queries
    if (this.matchesQuestionnaireQuery(lowerMessage)) {
      return await this.handleQuestionnaireQuery(lowerMessage);
    }
    
    // Stats/overview queries
    if (this.matchesStatsQuery(lowerMessage)) {
      return await this.handleStatsQuery(lowerMessage);
    }
    
    // Help queries
    if (this.matchesHelpQuery(lowerMessage)) {
      return await this.handleHelpQuery();
    }
    
    // Default response
    return {
      message: "I'm not sure how to help with that. Try asking about your tasks, OKRs, check-ins, team members, or questionnaires. You can also ask for help to see what I can do.",
    };
  }

  private matchesTaskQuery(message: string): boolean {
    const taskKeywords = ['task', 'tasks', 'bau', 'work', 'todo', 'assigned', 'my tasks', 'show tasks'];
    return taskKeywords.some(keyword => message.includes(keyword));
  }

  private matchesTemplateQuery(message: string): boolean {
    const templateKeywords = ['template', 'templates', 'okr', 'okrs', 'bau template', 'bau templates'];
    return templateKeywords.some(keyword => message.includes(keyword));
  }

  private matchesCheckinQuery(message: string): boolean {
    const checkinKeywords = ['checkin', 'check-in', 'check in', 'hr checkin', 'hr check-in'];
    return checkinKeywords.some(keyword => message.includes(keyword));
  }

  private matchesDepartmentQuery(message: string): boolean {
    const departmentKeywords = ['department', 'departments', 'team', 'teams'];
    return departmentKeywords.some(keyword => message.includes(keyword));
  }

  private matchesTeamMemberQuery(message: string): boolean {
    const memberKeywords = ['member', 'members', 'team member', 'team members', 'employee', 'employees'];
    return memberKeywords.some(keyword => message.includes(keyword));
  }

  private matchesStatsQuery(message: string): boolean {
    const statsKeywords = ['stats', 'statistics', 'overview', 'summary', 'progress', 'status'];
    return statsKeywords.some(keyword => message.includes(keyword));
  }

  private matchesHelpQuery(message: string): boolean {
    const helpKeywords = ['help', 'what can you do', 'commands', 'assist'];
    return helpKeywords.some(keyword => message.includes(keyword));
  }

  private async handleTaskQuery(message: string): Promise<ChatResponse> {
    try {
      let query = this.supabase
        .from('bau_task_instances')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          progress_percentage,
          assigned_to,
          profiles!bau_task_instances_assigned_to_fkey(first_name, last_name),
          bau_templates!bau_task_instances_template_id_fkey(department)
        `);

      // Role-based filtering
      if (this.userRole === 'Team_Member') {
        query = query.eq('assigned_to', this.userId);
      } else if (this.userRole === 'Team_Lead' || this.userRole === 'HR') {
        query = query.eq('bau_templates.department', this.userDepartment);
      }
      // Admin can see all tasks

      const { data: tasks, error } = await query;

      if (error) throw error;

      if (!tasks || tasks.length === 0) {
        return {
          message: "You don't have any tasks assigned at the moment.",
        };
      }

      const taskData = tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        progress_percentage: task.progress_percentage,
        assigned_to: task.profiles?.first_name && task.profiles?.last_name 
          ? `${task.profiles.first_name} ${task.profiles.last_name}`
          : 'Unassigned'
      }));

      const statusCounts = this.countTaskStatuses(tasks);
      
      return {
        message: `I found ${tasks.length} task(s) for you:\n\n${this.formatTaskSummary(statusCounts)}`,
        data: {
          tasks: taskData,
          stats: statusCounts
        }
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        message: "Sorry, I couldn't fetch your tasks at the moment. Please try again later.",
      };
    }
  }

  private async handleTemplateQuery(message: string): Promise<ChatResponse> {
    try {
      let query = this.supabase
        .from('bau_templates')
        .select('*');

      // Role-based filtering
      if (this.userRole === 'Team_Lead' || this.userRole === 'HR') {
        query = query.eq('department', this.userDepartment);
      }
      // Admin can see all templates

      const { data: templates, error } = await query;

      if (error) throw error;

      if (!templates || templates.length === 0) {
        return {
          message: "No BAU templates found.",
        };
      }

      const templateData = templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        frequency: template.frequency,
        status: template.status,
        department: template.department
      }));

      const statusCounts = this.countTemplateStatuses(templates);

      return {
        message: `I found ${templates.length} BAU template(s):\n\n${this.formatTemplateSummary(statusCounts)}`,
        data: {
          templates: templateData,
          stats: statusCounts
        }
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return {
        message: "Sorry, I couldn't fetch the templates at the moment. Please try again later.",
      };
    }
  }

  private async handleCheckinQuery(message: string): Promise<ChatResponse> {
    try {
      let query = this.supabase
        .from('hr_checkins')
        .select(`
          id,
          member_id,
          checkin_date,
          status,
          notes,
          department,
          profiles!hr_checkins_member_id_fkey(first_name, last_name)
        `);

      // Role-based filtering
      if (this.userRole === 'Team_Member') {
        query = query.eq('member_id', this.userId);
      } else if (this.userRole === 'Team_Lead' || this.userRole === 'HR') {
        query = query.eq('department', this.userDepartment);
      }
      // Admin can see all check-ins

      const { data: checkins, error } = await query;

      if (error) throw error;

      if (!checkins || checkins.length === 0) {
        return {
          message: "No check-ins found.",
        };
      }

      const checkinData = checkins.map((checkin: any) => ({
        id: checkin.id,
        member_name: checkin.profiles?.first_name && checkin.profiles?.last_name 
          ? `${checkin.profiles.first_name} ${checkin.profiles.last_name}`
          : 'Unknown Member',
        checkin_date: checkin.checkin_date,
        status: checkin.status,
        notes: checkin.notes,
        department: checkin.department
      }));

      const statusCounts = this.countCheckinStatuses(checkins);

      return {
        message: `I found ${checkins.length} check-in(s):\n\n${this.formatCheckinSummary(statusCounts)}`,
        data: {
          checkins: checkinData,
          stats: statusCounts
        }
      };
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return {
        message: "Sorry, I couldn't fetch the check-ins at the moment. Please try again later.",
      };
    }
  }

  private async handleDepartmentQuery(message: string): Promise<ChatResponse> {
    try {
      // Only Admin and HR can see departments
      if (this.userRole !== 'Admin' && this.userRole !== 'HR') {
        return {
          message: "You don't have permission to view department information.",
        };
      }

      const { data: departments, error } = await this.supabase
        .from('departments')
        .select('*');

      if (error) throw error;

      if (!departments || departments.length === 0) {
        return {
          message: "No departments found.",
        };
      }

      const departmentData = departments.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        description: dept.description
      }));

      return {
        message: `I found ${departments.length} department(s) in the system.`,
        data: {
          departments: departmentData
        }
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return {
        message: "Sorry, I couldn't fetch the departments at the moment. Please try again later.",
      };
    }
  }

  private async handleTeamMemberQuery(message: string): Promise<ChatResponse> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      // Role-based filtering
      if (this.userRole === 'Team_Lead' || this.userRole === 'HR') {
        query = query.eq('department', this.userDepartment);
      }
      // Admin can see all team members

      const { data: members, error } = await query;

      if (error) throw error;

      if (!members || members.length === 0) {
        return {
          message: "No team members found.",
        };
      }

      const memberData = members.map((member: any) => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        department: member.department,
        position: member.position,
        is_active: member.is_active
      }));

      const departmentCounts = this.countMembersByDepartment(members);

      return {
        message: `I found ${members.length} team member(s):\n\n${this.formatMemberSummary(departmentCounts)}`,
        data: {
          teamMembers: memberData,
          stats: departmentCounts
        }
      };
    } catch (error) {
      console.error('Error fetching team members:', error);
      return {
        message: "Sorry, I couldn't fetch the team members at the moment. Please try again later.",
      };
    }
  }

  private async handleStatsQuery(message: string): Promise<ChatResponse> {
    try {
      const stats: Record<string, any> = {};

      // Get task stats
      const { data: tasks } = await this.supabase
        .from('bau_task_instances')
        .select('status, progress_percentage');

      if (tasks) {
        stats['Total Tasks'] = tasks.length;
        stats['Completed'] = tasks.filter((t: any) => t.status === 'Completed').length;
        stats['In Progress'] = tasks.filter((t: any) => t.status === 'In Progress').length;
        stats['Pending'] = tasks.filter((t: any) => t.status === 'Pending').length;
        
        const avgProgress = tasks
          .filter((t: any) => t.progress_percentage !== null)
          .reduce((acc: number, t: any) => acc + (t.progress_percentage || 0), 0) / 
          tasks.filter((t: any) => t.progress_percentage !== null).length;
        
        if (!isNaN(avgProgress)) {
          stats['Avg Progress'] = `${Math.round(avgProgress)}%`;
        }
      }

      // Get template stats
      const { data: templates } = await this.supabase
        .from('bau_templates')
        .select('status');

      if (templates) {
        stats['Total Templates'] = templates.length;
        stats['Active Templates'] = templates.filter((t: any) => t.status === 'Active').length;
      }

      // Get check-in stats
      const { data: checkins } = await this.supabase
        .from('hr_checkins')
        .select('status');

      if (checkins) {
        stats['Total Check-ins'] = checkins.length;
        stats['Completed Check-ins'] = checkins.filter((c: any) => c.status === 'Completed').length;
      }

      return {
        message: "Here's an overview of your BAU/OKR system:",
        data: { stats }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        message: "Sorry, I couldn't fetch the statistics at the moment. Please try again later.",
      };
    }
  }

  // In handleHelpQuery, include userFAQs and globalFAQs
  private async handleHelpQuery(): Promise<ChatResponse> {
    const userFAQs = await this.getUserFAQs();
    return {
      message: `I can help you with the following questions. Click to ask!`,
      data: {
        userFAQs,
        globalFAQs
      }
    };
  }

  private countTaskStatuses(tasks: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return counts;
  }

  private countTemplateStatuses(templates: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    templates.forEach(template => {
      counts[template.status] = (counts[template.status] || 0) + 1;
    });
    return counts;
  }

  private countCheckinStatuses(checkins: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    checkins.forEach(checkin => {
      counts[checkin.status] = (counts[checkin.status] || 0) + 1;
    });
    return counts;
  }

  private countMembersByDepartment(members: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    members.forEach(member => {
      const dept = member.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }

  private formatTaskSummary(statusCounts: Record<string, number>): string {
    return Object.entries(statusCounts)
      .map(([status, count]) => `• ${status}: ${count}`)
      .join('\n');
  }

  private formatTemplateSummary(statusCounts: Record<string, number>): string {
    return Object.entries(statusCounts)
      .map(([status, count]) => `• ${status}: ${count}`)
      .join('\n');
  }

  private formatCheckinSummary(statusCounts: Record<string, number>): string {
    return Object.entries(statusCounts)
      .map(([status, count]) => `• ${status}: ${count}`)
      .join('\n');
  }

  private formatMemberSummary(departmentCounts: Record<string, number>): string {
    return Object.entries(departmentCounts)
      .map(([dept, count]) => `• ${dept}: ${count} member(s)`)
      .join('\n');
  }
} 