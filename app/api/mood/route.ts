/**
 * POST /api/mood
 *
 * Records a daily mood check-in for the authenticated user.
 *
 * Auth: Required (Supabase session cookie). Returns 401 if unauthenticated.
 *
 * Request body:
 *   { score: number (1-10), note?: string }
 *
 * Response:
 *   200 { success: true }
 *   400 { error: "Invalid score" }  — score out of range or missing
 *   401 { error: "Unauthorized" }
 *   500 { error: string }           — Supabase insert failed
 *
 * Multiple check-ins per day are allowed. The Insights dashboard
 * reads from this table to compute averages, streaks, and trend charts.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { score, note } = await req.json();
  if (!score || score < 1 || score > 10) return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("mood_entries").insert({ user_id: user.id, score, note: note || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
