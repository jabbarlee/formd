/**
 * AI Session API Routes - Single Session
 * GET /api/ai-sessions/[id] - Get session by ID
 * PUT /api/ai-sessions/[id] - Update session (send message, link form, etc.)
 * DELETE /api/ai-sessions/[id] - Delete session
 * 
 * Architecture:
 * - Follows /api/forms/[id] pattern
 * - Uses getAuthUser() for authentication
 * - Ownership verification in service layer
 */

import { NextRequest, NextResponse } from "next/server";
import { aiSessionService } from "@/lib/database/services/aiSession.service";
import {
  getAuthUser,
  unauthorizedResponse,
  errorResponse,
} from "@/lib/api/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/ai-sessions/[id]
 * Get single session by ID
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: sessionId } = await params;

    // Fetch session (service checks ownership)
    const session = await aiSessionService.getById(sessionId, authUser.userId);

    if (!session) {
      return errorResponse("Session not found", 404);
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error fetching session:", error);
    return errorResponse(error.message || "Failed to fetch session");
  }
}

/**
 * PUT /api/ai-sessions/[id]
 * Update session (send message, update form draft, link form)
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: sessionId } = await params;

    // Parse request body
    const body = await request.json();
    const { prompt, formId, title } = body;

    // Handle new message/prompt
    if (prompt) {
      // Validate prompt
      if (typeof prompt !== "string" || prompt.length < 10 || prompt.length > 2000) {
        return errorResponse("Prompt must be between 10 and 2000 characters", 400);
      }

      // Get current session to build conversation history
      const currentSession = await aiSessionService.getById(sessionId, authUser.userId);
      if (!currentSession) {
        return errorResponse("Session not found", 404);
      }

      // Generate AI response
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai/generate-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          conversationHistory: currentSession.messages,
        }),
      });

      if (!aiResponse.ok) {
        const aiError = await aiResponse.json();
        throw new Error(aiError.error || "AI generation failed");
      }

      const aiData = await aiResponse.json();

      // Add user message
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user" as const,
        content: prompt,
        timestamp: new Date().toISOString(),
      };

      await aiSessionService.appendMessage(sessionId, authUser.userId, userMessage);

      // Add AI response message
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        role: "assistant" as const,
        content: `I've updated your form with ${aiData.questions.length} questions.`,
        timestamp: new Date().toISOString(),
      };

      await aiSessionService.appendMessage(sessionId, authUser.userId, aiMessage);

      // Update form draft
      await aiSessionService.updateFormDraft(sessionId, authUser.userId, {
        form: aiData.form,
        questions: aiData.questions,
      });
    }

    // Handle form linking
    if (formId) {
      await aiSessionService.linkForm(sessionId, authUser.userId, formId);
    }

    // Handle title update
    if (title) {
      await aiSessionService.updateTitle(sessionId, authUser.userId, title);
    }

    // Get updated session
    const session = await aiSessionService.getById(sessionId, authUser.userId);

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error updating session:", error);
    return errorResponse(error.message || "Failed to update session");
  }
}

/**
 * DELETE /api/ai-sessions/[id]
 * Soft delete session
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const { id: sessionId } = await params;

    // Delete session (service checks ownership)
    await aiSessionService.deleteSession(sessionId, authUser.userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return errorResponse(error.message || "Failed to delete session");
  }
}
