import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function GET() {
  const resendKey = process.env.RESEND_API_KEY;
  const digestEmail = process.env.CTO_DIGEST_EMAIL;

  if (!resendKey || resendKey === "re_placeholder" || resendKey === "placeholder_use_env") {
    return NextResponse.json({ skipped: true, reason: "RESEND_API_KEY not configured" });
  }
  if (!digestEmail) {
    return NextResponse.json({ skipped: true, reason: "CTO_DIGEST_EMAIL not set" });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const { data: current } = await supabase.from("user_feedback").select("id,rating,comment,created_at,screen_context,app_version").gte("created_at", past24h.toISOString()).order("created_at", { ascending: false });
  const { data: prior } = await supabase.from("user_feedback").select("rating").gte("created_at", past48h.toISOString()).lt("created_at", past24h.toISOString());

  const count = current?.length ?? 0;
  const avg = count > 0 ? (current!.reduce((s, r) => s + r.rating, 0) / count).toFixed(2) : "N/A";
  const priorCount = prior?.length ?? 0;
  const priorAvg = priorCount > 0 ? (prior!.reduce((s, r) => s + (r.rating as number), 0) / priorCount).toFixed(2) : "N/A";
  const trend = avg !== "N/A" && priorAvg !== "N/A" ? (parseFloat(avg) > parseFloat(priorAvg) ? "▲ improving" : parseFloat(avg) < parseFloat(priorAvg) ? "▼ declining" : "→ stable") : "N/A";

  const rows = current?.filter(r => r.comment).map(r =>
    `<tr><td style="padding:4px 8px;border:1px solid #e5e7eb">${r.rating}/5</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${r.comment}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${r.screen_context ?? ""}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${new Date(r.created_at).toLocaleString()}</td></tr>`
  ).join("") ?? "";

  const html = `<h2>MindBridge Feedback Digest</h2><p><b>Date:</b> ${now.toUTCString()}</p><table style="border-collapse:collapse"><tr><th style="padding:4px 8px;border:1px solid #e5e7eb">Metric</th><th style="padding:4px 8px;border:1px solid #e5e7eb">Last 24h</th><th style="padding:4px 8px;border:1px solid #e5e7eb">Prior 24h</th><th style="padding:4px 8px;border:1px solid #e5e7eb">Trend</th></tr><tr><td style="padding:4px 8px;border:1px solid #e5e7eb">Submissions</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${count}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${priorCount}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">—</td></tr><tr><td style="padding:4px 8px;border:1px solid #e5e7eb">Avg rating</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${avg}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${priorAvg}</td><td style="padding:4px 8px;border:1px solid #e5e7eb">${trend}</td></tr></table>${rows ? `<h3>Comments</h3><table style="border-collapse:collapse;width:100%"><tr><th>Rating</th><th>Comment</th><th>Screen</th><th>Time</th></tr>${rows}</table>` : "<p>No comments in this period.</p>"}<hr><p style="color:#6b7280;font-size:12px">MindBridge Vercel cron</p>`;

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({ from: "MindBridge Digest <digest@mindbridge.app>", to: digestEmail, subject: `MindBridge Feedback Digest — ${now.toDateString()}`, html });
  if (error) return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  return NextResponse.json({ success: true, count, avg });
}
