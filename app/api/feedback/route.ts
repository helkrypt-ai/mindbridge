import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { rating, comment, screen_context, app_version } = await req.json();
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const supabaseUser = createClient();
  const { data: { user } } = await supabaseUser.auth.getUser();

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
