import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "placeholder"
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "No content" }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let reflectionPrompt = "What emotions came up as you wrote this? What might this journal entry be telling you about what you need right now?";

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a compassionate CBT-informed journal coach. Given a journal entry, generate one thoughtful, open-ended reflection question (2-3 sentences max) that helps the user explore their emotions and patterns more deeply." },
        { role: "user", content }
      ],
    });
    reflectionPrompt = completion.choices[0]?.message?.content ?? reflectionPrompt;
  }

  await supabase.from("journal_entries").insert({ user_id: user.id, content, reflection_prompt: reflectionPrompt });

  return NextResponse.json({ reflectionPrompt });
}
