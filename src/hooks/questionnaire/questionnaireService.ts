import { supabase } from '@/integrations/supabase/client';
import { Question, QuestionnaireResponse, UserQuestionnaire } from '@/types/questionnaire';
import { predefinedQuestions } from '@/data/predefinedQuestions';

export class QuestionnaireService {
  private supabase = supabase;

  // Get predefined questions for a role
  async getPredefinedQuestions(role: string): Promise<Question[]> {
    return predefinedQuestions[role as keyof typeof predefinedQuestions] || [];
  }

  // Get custom questions for a user
  async getCustomQuestions(userId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questionnaire_questions')
      .select('*')
      .eq('created_by', userId)
      .eq('is_predefined', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get all questions (predefined + custom) for a role
  async getAllQuestionsForRole(role: string, userId: string): Promise<Question[]> {
    const [predefined, custom] = await Promise.all([
      this.getPredefinedQuestions(role),
      this.getCustomQuestions(userId)
    ]);

    return [...predefined, ...custom];
  }

  // Add a custom question
  async addCustomQuestion(question: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questionnaire_questions')
      .insert({
        text: question.text,
        category: question.category,
        role: question.role,
        is_predefined: false,
        created_by: question.createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Submit a response
  async submitResponse(response: Omit<QuestionnaireResponse, 'id' | 'submittedAt'>): Promise<QuestionnaireResponse> {
    const { data, error } = await this.supabase
      .from('questionnaire_responses')
      .upsert({
        user_id: response.userId,
        question_id: response.questionId,
        answer: response.answer
      }, {
        onConflict: 'user_id,question_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get user's responses
  async getUserResponses(userId: string): Promise<QuestionnaireResponse[]> {
    const { data, error } = await this.supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get all user questionnaires (Admin only)
  async getAllUserQuestionnaires(): Promise<UserQuestionnaire[]> {
    const { data: responses, error: responsesError } = await this.supabase
      .from('questionnaire_responses')
      .select(`
        *,
        profiles!questionnaire_responses_user_id_fkey(
          id,
          email,
          first_name,
          last_name,
          display_name
        ),
        questionnaire_questions!questionnaire_responses_question_id_fkey(
          id,
          text,
          category,
          role,
          is_predefined
        )
      `);

    if (responsesError) throw responsesError;

    // Group responses by user
    const userMap = new Map<string, UserQuestionnaire>();

    responses?.forEach((response: any) => {
      const userId = response.user_id;
      const user = response.profiles;
      const question = response.questionnaire_questions;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userEmail: user.email,
          userRole: question.role,
          userName: user.display_name || `${user.first_name} ${user.last_name}`.trim(),
          responses: [],
          customQuestions: []
        });
      }

      const userQuestionnaire = userMap.get(userId)!;
      userQuestionnaire.responses.push({
        id: response.id,
        userId: response.user_id,
        questionId: response.question_id,
        answer: response.answer,
        submittedAt: response.submitted_at,
        updatedAt: response.updated_at
      });
    });

    return Array.from(userMap.values());
  }

  // Get questionnaire statistics
  async getQuestionnaireStats() {
    const { data: responses, error } = await this.supabase
      .from('questionnaire_responses')
      .select(`
        *,
        questionnaire_questions!questionnaire_responses_question_id_fkey(role, category)
      `);

    if (error) throw error;

    const stats = {
      totalResponses: responses?.length || 0,
      responsesByRole: {} as Record<string, number>,
      responsesByCategory: {} as Record<string, number>
    };

    responses?.forEach((response: any) => {
      const role = response.questionnaire_questions.role;
      const category = response.questionnaire_questions.category;

      stats.responsesByRole[role] = (stats.responsesByRole[role] || 0) + 1;
      stats.responsesByCategory[category] = (stats.responsesByCategory[category] || 0) + 1;
    });

    return stats;
  }
} 