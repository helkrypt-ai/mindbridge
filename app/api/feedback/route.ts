/**
 * POST /api/feedback
 *
 * Records in-app user feedback (star rating + optional comment).
 *
 * Auth: Optional. If a Supabase session exists, feedback is associated with the
 * user's account. Anonymous submissions (no session) are also accepted (user_id: null).
 *
 * Request body:
 *   {
 *     rating: number (1-5, required),
 *     comment?: string,
 *     screen_context?: string,   — which screen the user was on (e.g. "chat", "journal")
 *     app_version?: string       — app version string for filtering in the digest
 *   }
 *
 * Response:
 *   200 { success: true }
 *   400 { error: "Rating must be 1-5" }
 *   500 { error: "Failed to save feedback" }
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS on user_feedback, which allows both
 * authenticated and anonymous inserts via a single code path. The RLS policy still
 * permits users to insert their own rows — the service role is used here for
 * simplicity and to support the anonymous case.
 *
 * Feedback is aggregated and emailed to CTO_DIGEST_EMAIL daily via /api/cron/digest.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { rating, comment, screen_context, app_version } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  // Try to get the authenticated user (optional — anonymous feedback is allowed)
  const supabaseUser = createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();

  // Service role client bypasses RLS so anonymous inserts are permitted
  const supabase = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabase.from("user_feedback").insert({
    user_id: user?.id ?? null,
    rating,
    comment: comment ?? null,
    screen_context: screen_context ?? null,
    app_version: app_version ?? null,
  });

  if (error) return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  return NextResponse.json({ success: true });
}
