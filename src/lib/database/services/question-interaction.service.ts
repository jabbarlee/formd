/**
 * Question Interaction Service
 * Handles tracking and retrieval of detailed question-level interactions
 */

import { supabase } from '@/lib/supabase/client';
import { QuestionInteraction, QuestionInteractionType } from '@/lib/types/analytics';


export const questionInteractionService = {
  /**
   * Track a question interaction
   */
  async trackInteraction(data: {
    formId: string;
    questionId: string;
    sessionId: string;
    interactionType: QuestionInteractionType;
    responseId?: string;
    questionOrder?: number;
    timeToAnswer?: number;
    timeOnQuestion?: number;
    editCount?: number;
    validationErrors?: number;
    isSkipped?: boolean;
    skipReason?: string;
    answerValue?: any;
    cameFromQuestionId?: string;
    navigationDirection?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_interactions')
        .insert({
          form_id: data.formId,
          question_id: data.questionId,
          session_id: data.sessionId,
          response_id: data.responseId || null,
          interaction_type: data.interactionType,
          question_order: data.questionOrder || null,
          time_to_answer: data.timeToAnswer || null,
          time_on_question: data.timeOnQuestion || null,
          edit_count: data.editCount || 0,
          validation_errors: data.validationErrors || 0,
          is_skipped: data.isSkipped || false,
          skip_reason: data.skipReason || null,
          answer_value: data.answerValue || null,
          came_from_question_id: data.cameFromQuestionId || null,
          navigation_direction: data.navigationDirection || null,
        });
      
      if (error) {
        console.error('Error tracking question interaction:', error);
        throw new Error(`Failed to track interaction: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in trackInteraction:', error);
      throw error;
    }
  },

  /**
   * Get all interactions for a session
   */
  async getSessionInteractions(sessionId: string): Promise<QuestionInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('question_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp');
      
      if (error) {
        console.error('Error fetching session interactions:', error);
        throw new Error(`Failed to fetch interactions: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        formId: row.form_id,
        questionId: row.question_id,
        responseId: row.response_id || undefined,
        sessionId: row.session_id,
        interactionType: row.interaction_type,
        questionOrder: row.question_order || undefined,
        timeToAnswer: row.time_to_answer || undefined,
        timeOnQuestion: row.time_on_question || undefined,
        editCount: row.edit_count,
        validationErrors: row.validation_errors,
        isSkipped: row.is_skipped,
        skipReason: row.skip_reason || undefined,
        answerValue: row.answer_value,
        cameFromQuestionId: row.came_from_question_id || undefined,
        navigationDirection: row.navigation_direction || undefined,
        timestamp: row.timestamp,
      }));
    } catch (error: any) {
      console.error('Error in getSessionInteractions:', error);
      throw error;
    }
  },

  /**
   * Get all interactions for a specific question
   */
  async getQuestionInteractions(
    formId: string,
    questionId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<QuestionInteraction[]> {
    try {
      let query = supabase
        .from('question_interactions')
        .select('*')
        .eq('form_id', formId)
        .eq('question_id', questionId)
        .order('timestamp');

      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching question interactions:', error);
        throw new Error(`Failed to fetch interactions: ${error.message}`);
      }

      return (data || []).map(row => ({
        id: row.id,
        formId: row.form_id,
        questionId: row.question_id,
        responseId: row.response_id || undefined,
        sessionId: row.session_id,
        interactionType: row.interaction_type,
        questionOrder: row.question_order || undefined,
        timeToAnswer: row.time_to_answer || undefined,
        timeOnQuestion: row.time_on_question || undefined,
        editCount: row.edit_count,
        validationErrors: row.validation_errors,
        isSkipped: row.is_skipped,
        skipReason: row.skip_reason || undefined,
        answerValue: row.answer_value,
        cameFromQuestionId: row.came_from_question_id || undefined,
        navigationDirection: row.navigation_direction || undefined,
        timestamp: row.timestamp,
      }));
    } catch (error: any) {
      console.error('Error in getQuestionInteractions:', error);
      throw error;
    }
  },

  /**
   * Link session interactions to response after submission
   */
  async linkToResponse(sessionId: string, responseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_interactions')
        .update({ response_id: responseId })
        .eq('session_id', sessionId)
        .is('response_id', null);
      
      if (error) {
        console.error('Error linking interactions to response:', error);
        throw new Error(`Failed to link interactions: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in linkToResponse:', error);
      throw error;
    }
  },

  /**
   * Get interaction count for a form within a date range
   */
  async getInteractionCount(
    formId: string,
    interactionType?: QuestionInteractionType,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      let query = supabase
        .from('question_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId);

      if (interactionType) {
        query = query.eq('interaction_type', interactionType);
      }
      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('timestamp', endDate.toISOString());
      }

      const { count, error } = await query;
      
      if (error) {
        console.error('Error counting interactions:', error);
        throw new Error(`Failed to count interactions: ${error.message}`);
      }

      return count || 0;
    } catch (error: any) {
      console.error('Error in getInteractionCount:', error);
      throw error;
    }
  },
};

