/**
 * API Route: Get user's AI chats or create new chat
 * GET /api/ai/chats - List user's chat history
 * POST /api/ai/chats - Create new chat
 */

import { NextRequest, NextResponse } from "next/server";
import { aiChatService } from "@/lib/database/services/aiChat.service";
import { getAuthUser, unauthorizedResponse, errorResponse } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch chats (service will use Firebase auth internally)
    const chats = await aiChatService.getUserChats(authUser.userId, limit, offset);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to fetch chats");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Parse request body
    const body = await request.json();
    const { title } = body;

    // Validate
    if (!title || typeof title !== "string") {
      return errorResponse("Title is required", 400);
    }

    if (title.length > 500) {
      return errorResponse("Title must not exceed 500 characters", 400);
    }

    // Create chat (service will use Firebase auth internally)
    const chat = await aiChatService.create(authUser.userId, title);

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return errorResponse(error instanceof Error ? error.message : "Failed to create chat");
  }
}
