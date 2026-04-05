/**
 * POST /api/chat
 *
 * AI chat companion endpoint. Accepts a conversation history and streams
 * claude-haiku-4-5-20251001 responses using Server-Sent Events (SSE).
 *
 * Auth: Required (Supabase session cookie). Returns 401 if unauthenticated.
 *
 * Request body:
 *   { messages: { role: "user"|"assistant", content: string }[], sessionId?: string }
 *
 * Response (streaming):
 *   Content-Type: text/event-stream
 *   Each chunk: `data: {"text": "..."}\n\n`
 *   Final chunk: `data: [DONE]\n\n`
 *   Header X-Session-Id: <uuid> — use this to continue the session on next request
 *
 * Graceful degradation: if ANTHROPIC_API_KEY is absent or placeholder, returns a
 * static fallback JSON response instead of a stream (no 500 error).
 *
 * Crisis detection is handled client-side in ChatInterface.tsx using lib/crisis.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const CBT_SYSTEM_PROMPT = `You are MindBridge, a compassionate AI mental wellness companion. Use CBT-informed techniques: validate feelings, gently challenge cognitive distortions, encourage behavioral activation, and guide relaxation. Always respond with empathy. If the user expresses suicidal ideation or severe distress, encourage them to contact a crisis line (988). Keep responses concise and supportive. You are NOT a replacement for professional therapy.`;

const anthropic = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "placeholder"
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  const { messages, sessionId } = await req.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Store user message
  const userMsg = messages[messages.length - 1];
  let sid = sessionId;
  if (!sid) {
    // Create a new chat session row so messages can be persisted and replayed
    const { data: session } = await supabase.from("chat_sessions").insert({ user_id: user.id }).select().single();
    sid = session?.id;
  }
  if (sid) await supabase.from("messages").insert({ session_id: sid, role: "user", content: userMsg.content });

  // Guard: no Anthropic key
  if (!anthropic) {
    const fallback = "I'm here to support you. (AI chat requires an Anthropic API key — please contact support.)";
    if (sid) await supabase.from("messages").insert({ session_id: sid, role: "assistant", content: fallback });
    return NextResponse.json({ content: fallback, sessionId: sid });
  }

  const encoder = new TextEncoder();
  let full = "";
  const readable = new ReadableStream({
    async start(controller) {
      const stream = anthropic.messages.stream({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: CBT_SYSTEM_PROMPT,
        messages,
      });
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          const text = event.delta.text;
          full += text;
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      // Persist the complete assistant reply after streaming finishes
      if (sid) await supabase.from("messages").insert({ session_id: sid, role: "assistant", content: full });
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Session-Id": sid ?? "" } });
}
