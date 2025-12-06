/**
 * Question Interaction Tracking API
 * Public endpoint for tracking detailed question-level interactions
 * POST /api/public/forms/[id]/track-question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { questionInteractionService } from '@/lib/database/services/question-interaction.service';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/public/forms/[id]/track-question
 * Track question interaction (view, answer, skip, etc.)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const formId = params.id;
    const body = await request.json();

    // Validate required fields
    if (!body.questionId || !body.sessionId || !body.interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, sessionId, interactionType' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validInteractionTypes = ['viewed', 'focused', 'answered', 'skipped', 'edited', 'validation_error'];
    if (!validInteractionTypes.includes(body.interactionType)) {
      return NextResponse.json(
        { error: `Invalid interactionType. Must be one of: ${validInteractionTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify form exists (using public client, no auth required)
    const supabase = createClient();
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Track the interaction using admin client for write access
    await questionInteractionService.trackInteraction({
      formId,
      questionId: body.questionId,
      sessionId: body.sessionId,
      interactionType: body.interactionType,
      responseId: body.responseId,
      questionOrder: body.questionOrder,
      timeToAnswer: body.timeToAnswer,
      timeOnQuestion: body.timeOnQuestion,
      editCount: body.editCount,
      validationErrors: body.validationErrors,
      isSkipped: body.isSkipped,
      skipReason: body.skipReason,
      answerValue: body.answerValue,
      cameFromQuestionId: body.cameFromQuestionId,
      navigationDirection: body.navigationDirection,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error: any) {
    console.error('Error tracking question interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

