"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface AdminUser {
  id: string;
  email: string;
  joinedAt: string;
  name: string | null;
  isAdmin: boolean;
  followUpNote: string | null;
  plan: "free" | "premium";
  moodCount: number;
  journalCount: number;
  chatCount: number;
  moodStreak: number;
  lastActive: string | null;
}

export interface FeedbackItem {
  id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  screen_context: string | null;
  email: string;
}

export interface AdminStats {
  totalUsers: number;
  dau: number;
  mau: number;
  premiumCount: number;
  mrr: number;
}

interface Props {
  stats: AdminStats;
  users: AdminUser[];
  moodTrendData: { day: string; avg: number }[];
  subCounts: Record<string, number>;
  feedbacks: FeedbackItem[];
}

const TABS = ["Overview", "Users", "Feedback"] as const;
type Tab = (typeof TABS)[number];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-2xl font-bold text-indigo-700">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtRelative(iso: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
}

const SUB_COLORS: Record<string, string> = {
  Free: "#9ca3af",
  Premium: "#4f46e5",
  Cancelled: "#ef4444",
};

export default function AdminDashboard({
  stats,
  users,
  moodTrendData,
  subCounts,
  feedbacks,
}: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [userSearch, setUserSearch] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [userNotes, setUserNotes] = useState<Record<string, string>>(
    () => Object.fromEntries(users.map((u) => [u.id, u.followUpNote ?? ""]))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const subChartData = [
    { name: "Free", value: subCounts.free ?? 0 },
    { name: "Premium", value: subCounts.active ?? 0 },
    {
      name: "Cancelled",
      value: (subCounts.cancelled ?? 0) + (subCounts.inactive ?? 0),
    },
  ].filter((d) => d.value > 0);

  const filteredUsers = useMemo(() => {
    const nonAdmins = users.filter((u) => !u.isAdmin);
    if (!userSearch.trim()) return nonAdmins;
    const q = userSearch.toLowerCase();
    return nonAdmins.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredFeedbacks = useMemo(
    () =>
      feedbackRating
        ? feedbacks.filter((f) => f.rating === feedbackRating)
        : feedbacks,
    [feedbacks, feedbackRating]
  );

  const avgRating =
    feedbacks.length
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : "—";

  async function saveNote(userId: string) {
    setSavingId(userId);
    try {
      await fetch(`/api/admin/users/${userId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: userNotes[userId] || null }),
      });
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">
            MindBridge analytics &amp; user management
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to app
        </Link>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* OVERVIEW TAB */}
        {tab === "Overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <StatCard label="Total users" value={stats.totalUsers} />
              <StatCard label="DAU (1 day)" value={stats.dau} />
              <StatCard label="MAU (30 days)" value={stats.mau} />
              <StatCard label="Premium users" value={stats.premiumCount} />
              <StatCard label="Est. MRR" value={`$${stats.mrr.toFixed(0)}`} />
            </div>

            {/* Mood trend chart */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Avg daily mood (last 30 days, all users)
              </h2>
              {moodTrendData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  No mood data yet.
                </p>
              )}
            </div>

            {/* Subscription breakdown */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                Subscription breakdown
              </h2>
              {subChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={subChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {subChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={SUB_COLORS[entry.name] ?? "#6b7280"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">
                  No subscription data yet.
                </p>
              )}
            </div>

            {/* Avg feedback rating */}
            <div className="bg-white rounded-xl border p-6 flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-indigo-700">{avgRating}</p>
                <p className="text-sm text-gray-500 mt-1">Avg feedback rating</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-700">
                  {feedbacks.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total responses</p>
              </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {tab === "Users" && (
          <>
            <div className="flex items-center justify-between gap-4">
              <input
                type="search"
                placeholder="Search by email or name…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-80 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-sm text-gray-400">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>

            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Last active</th>
                    <th className="px-4 py-3 text-center">Mood</th>
                    <th className="px-4 py-3 text-center">Journal</th>
                    <th className="px-4 py-3 text-center">Chat</th>
                    <th className="px-4 py-3 text-center">Streak</th>
                    <th className="px-4 py-3">Follow-up note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{u.email}</p>
                        {u.name && (
                          <p className="text-xs text-gray-400">{u.name}</p>
                        )}
                        {u.isAdmin && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 rounded">
                            admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            u.plan === "premium"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{fmtDate(u.joinedAt)}</td>
                      <td className="px-4 py-3 text-gray-500">{fmtRelative(u.lastActive)}</td>
                      <td className="px-4 py-3 text-center">{u.moodCount}</td>
                      <td className="px-4 py-3 text-center">{u.journalCount}</td>
                      <td className="px-4 py-3 text-center">{u.chatCount}</td>
                      <td className="px-4 py-3 text-center">
                        {u.moodStreak > 0 ? `🔥 ${u.moodStreak}` : "—"}
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        {editingId === u.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              autoFocus
                              value={userNotes[u.id] ?? ""}
                              onChange={(e) =>
                                setUserNotes((prev) => ({
                                  ...prev,
                                  [u.id]: e.target.value,
                                }))
                              }
                              className="border rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                              placeholder="Add note…"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveNote(u.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => saveNote(u.id)}
                              disabled={savingId === u.id}
                              className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                            >
                              {savingId === u.id ? "…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingId(u.id)}
                            className="text-left text-xs text-gray-500 hover:text-indigo-600 w-full"
                          >
                            {userNotes[u.id] || (
                              <span className="text-gray-300">+ Add note</span>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* FEEDBACK TAB */}
        {tab === "Feedback" && (
          <>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">
                Filter by rating:
              </span>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFeedbackRating(r)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      feedbackRating === r
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-indigo-300"
                    }`}
                  >
                    {r === 0 ? "All" : `${"★".repeat(r)}`}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-400 ml-auto">
                {filteredFeedbacks.length} entries
              </span>
            </div>

            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Comment</th>
                    <th className="px-4 py-3">Screen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFeedbacks.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No feedback yet.
                      </td>
                    </tr>
                  )}
                  {filteredFeedbacks.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {fmtDate(f.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{f.email}</td>
                      <td className="px-4 py-3">
                        <Stars rating={f.rating} />
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-sm">
                        {f.comment || (
                          <span className="text-gray-300 italic">no comment</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {f.screen_context ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
