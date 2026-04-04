import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const CBT_SYSTEM_PROMPT = `You are MindBridge, a compassionate AI mental wellness companion. Use CBT-informed techniques: validate feelings, gently challenge cognitive distortions, encourage behavioral activation, and guide relaxation. Always respond with empathy. If the user expresses suicidal ideation or severe distress, encourage them to contact a crisis line (988). Keep responses concise and supportive. You are NOT a replacement for professional therapy.`;

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "placeholder"
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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
    const { data: session } = await supabase.from("chat_sessions").insert({ user_id: user.id }).select().single();
    sid = session?.id;
  }
  if (sid) await supabase.from("messages").insert({ session_id: sid, role: "user", content: userMsg.content });

  // Guard: no OpenAI key
  if (!openai) {
    const fallback = "I'm here to support you. (AI chat requires an OpenAI API key — please contact support.)";
    if (sid) await supabase.from("messages").insert({ session_id: sid, role: "assistant", content: fallback });
    return NextResponse.json({ content: fallback, sessionId: sid });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: CBT_SYSTEM_PROMPT }, ...messages],
    stream: true,
  });

  const encoder = new TextEncoder();
  let full = "";
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        full += text;
        if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      if (sid) await supabase.from("messages").insert({ session_id: sid, role: "assistant", content: full });
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-Session-Id": sid ?? "" } });
}
