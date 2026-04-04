import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import AdminDashboard from "./AdminDashboard";
import type { AdminUser, FeedbackItem } from "./AdminDashboard";

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates]
    .map((d) => new Date(d).getTime())
    .sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = (sorted[i - 1] - sorted[i]) / 86400000;
    if (diffDays < 2) streak++;
    else break;
  }
  return streak;
}

export default async function AdminPage() {
  // Auth check
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Admin check via service role
  const service = createServiceClient();
  const { data: selfProfile } = await service
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!selfProfile?.is_admin) redirect("/dashboard");

  // Parallel data fetch
  const [
    authResult,
    { data: profiles },
    { data: subscriptions },
    { data: moodEntries },
    { data: journalEntries },
    { data: chatSessions },
    { data: feedbacks },
  ] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from("profiles").select("id, name, is_admin, follow_up_note"),
    service.from("subscriptions").select("user_id, status, created_at"),
    service
      .from("mood_entries")
      .select("user_id, score, created_at")
      .order("created_at", { ascending: true }),
    service.from("journal_entries").select("user_id, created_at"),
    service.from("chat_sessions").select("user_id, created_at"),
    service
      .from("user_feedback")
      .select("id, user_id, rating, comment, created_at, screen_context")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const authUsers = authResult.data?.users ?? [];
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const subMap = new Map((subscriptions ?? []).map((s) => [s.user_id, s]));

  // Aggregate mood data per user
  const moodByUser = new Map<string, { scores: number[]; dates: string[] }>();
  for (const e of moodEntries ?? []) {
    if (!moodByUser.has(e.user_id))
      moodByUser.set(e.user_id, { scores: [], dates: [] });
    moodByUser.get(e.user_id)!.scores.push(e.score);
    moodByUser.get(e.user_id)!.dates.push(e.created_at);
  }

  // Aggregate journal data per user
  const journalCountByUser = new Map<string, number>();
  const lastJournalByUser = new Map<string, string>();
  for (const e of journalEntries ?? []) {
    journalCountByUser.set(e.user_id, (journalCountByUser.get(e.user_id) ?? 0) + 1);
    if (!lastJournalByUser.has(e.user_id) || e.created_at > lastJournalByUser.get(e.user_id)!)
      lastJournalByUser.set(e.user_id, e.created_at);
  }

  // Aggregate chat data per user
  const chatCountByUser = new Map<string, number>();
  const lastChatByUser = new Map<string, string>();
  for (const e of chatSessions ?? []) {
    chatCountByUser.set(e.user_id, (chatCountByUser.get(e.user_id) ?? 0) + 1);
    if (!lastChatByUser.has(e.user_id) || e.created_at > lastChatByUser.get(e.user_id)!)
      lastChatByUser.set(e.user_id, e.created_at);
  }

  // DAU / MAU computation
  const now = Date.now();
  const oneDayAgo = new Date(now - 86400000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString();

  const dauSet = new Set<string>();
  const mauSet = new Set<string>();
  const allActivity = [
    ...(moodEntries ?? []),
    ...(journalEntries ?? []),
    ...(chatSessions ?? []),
  ];
  for (const e of allActivity) {
    if (e.created_at >= oneDayAgo) dauSet.add(e.user_id);
    if (e.created_at >= thirtyDaysAgo) mauSet.add(e.user_id);
  }

  // Build user rows
  const users: AdminUser[] = authUsers.map((u) => {
    const profile = profileMap.get(u.id);
    const sub = subMap.get(u.id);
    const mood = moodByUser.get(u.id);
    const lastMood = mood?.dates.at(-1) ?? null;
    const lastJournal = lastJournalByUser.get(u.id) ?? null;
    const lastChat = lastChatByUser.get(u.id) ?? null;
    const lastActive =
      [lastMood, lastJournal, lastChat].filter(Boolean).sort().pop() ?? null;

    return {
      id: u.id,
      email: u.email ?? "",
      joinedAt: u.created_at ?? "",
      name: profile?.name ?? null,
      isAdmin: profile?.is_admin ?? false,
      followUpNote: profile?.follow_up_note ?? null,
      plan: sub?.status === "active" ? "premium" : "free",
      moodCount: mood?.scores.length ?? 0,
      journalCount: journalCountByUser.get(u.id) ?? 0,
      chatCount: chatCountByUser.get(u.id) ?? 0,
      moodStreak: mood ? computeStreak(mood.dates) : 0,
      lastActive,
    };
  });

  // Mood trend (daily avg last 30 days)
  const moodTrendBuckets: Record<string, { total: number; count: number }> = {};
  for (const e of moodEntries ?? []) {
    if (e.created_at < thirtyDaysAgo) continue;
    const day = e.created_at.slice(0, 10);
    if (!moodTrendBuckets[day]) moodTrendBuckets[day] = { total: 0, count: 0 };
    moodTrendBuckets[day].total += e.score;
    moodTrendBuckets[day].count += 1;
  }
  const moodTrendData = Object.entries(moodTrendBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, { total, count }]) => ({
      day: new Date(day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      avg: parseFloat((total / count).toFixed(1)),
    }));

  // Subscription counts
  const subCounts: Record<string, number> = {};
  for (const u of authUsers) {
    const sub = subMap.get(u.id);
    const key = sub?.status ?? "free";
    subCounts[key] = (subCounts[key] ?? 0) + 1;
  }

  const premiumCount = subCounts.active ?? 0;
  const mrr = premiumCount * 9.99;

  // Feedback with email
  const userEmailMap = new Map(authUsers.map((u) => [u.id, u.email ?? "anonymous"]));
  const feedbackItems: FeedbackItem[] = (feedbacks ?? []).map((f) => ({
    ...f,
    email: f.user_id ? (userEmailMap.get(f.user_id) ?? "anonymous") : "anonymous",
  }));

  return (
    <AdminDashboard
      stats={{ totalUsers: authUsers.length, dau: dauSet.size, mau: mauSet.size, premiumCount, mrr }}
      users={users}
      moodTrendData={moodTrendData}
      subCounts={subCounts}
      feedbacks={feedbackItems}
    />
  );
}
