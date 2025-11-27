/**
 * API Route: Single AI chat operations
 * GET /api/ai/chats/[id] - Get single chat
 * PUT /api/ai/chats/[id] - Update chat (messages, form draft, etc.)
 * DELETE /api/ai/chats/[id] - Delete chat
 */

import { NextRequest, NextResponse } from "next/server";
import { aiChatService } from "@/lib/database/services/aiChat.service";
import { auth } from "@/lib/firebase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;

    // Get Firebase token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch chat
    const chat = await aiChatService.getById(chatId, userId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;

    // Get Firebase token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json();
    const { message, formDraft, formId, title } = body;

    // Handle different update operations
    if (message) {
      await aiChatService.appendMessage(chatId, userId, message);
    }

    if (formDraft) {
      await aiChatService.updateFormDraft(chatId, userId, formDraft);
    }

    if (formId) {
      await aiChatService.linkForm(chatId, userId, formId);
    }

    if (title) {
      await aiChatService.updateTitle(chatId, userId, title);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = params.id;

    // Get Firebase token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Delete chat (soft delete)
    await aiChatService.delete(chatId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete chat" },
      { status: 500 }
    );
  }
}
