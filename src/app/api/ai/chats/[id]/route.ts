/**
 * API Route: Single AI chat operations
 * GET /api/ai/chats/[id] - Get single chat
 * PUT /api/ai/chats/[id] - Update chat (messages, form draft, etc.)
 * DELETE /api/ai/chats/[id] - Delete chat
 */

import { NextRequest, NextResponse } from "next/server";
import { aiChatService } from "@/lib/database/services/aiChat.service";
import { getAuthUser, unauthorizedResponse, errorResponse } from "@/lib/api/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const chatId = params.id;

    // Fetch chat (service will verify ownership)
    const chat = await aiChatService.getById(chatId, authUser.userId);

    if (!chat) {
      return errorResponse("Chat not found", 404);
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch chat");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const chatId = params.id;

    // Parse request body
    const body = await request.json();
    const { message, formDraft, formId, title } = body;

    // Handle different update operations
    if (message) {
      await aiChatService.appendMessage(chatId, authUser.userId, message);
    }

    if (formDraft) {
      await aiChatService.updateFormDraft(chatId, authUser.userId, formDraft);
    }

    if (formId) {
      await aiChatService.linkForm(chatId, authUser.userId, formId);
    }

    if (title) {
      await aiChatService.updateTitle(chatId, authUser.userId, title);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to update chat");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const chatId = params.id;

    // Delete chat (soft delete)
    await aiChatService.delete(chatId, authUser.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to delete chat");
  }
}
