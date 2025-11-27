/**
 * API Route: Get user's AI chats or create new chat
 * GET /api/ai/chats - List user's chat history
 * POST /api/ai/chats - Create new chat
 */

import { NextRequest, NextResponse } from "next/server";
import { aiChatService } from "@/lib/database/services/aiChat.service";
import { auth } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    // Get Firebase token from header
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch chats
    const chats = await aiChatService.getUserChats(userId, limit, offset);

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { title } = body;

    // Validate
    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.length > 500) {
      return NextResponse.json(
        { error: "Title must not exceed 500 characters" },
        { status: 400 }
      );
    }

    // Create chat
    const chat = await aiChatService.create(userId, title);

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create chat" },
      { status: 500 }
    );
  }
}
