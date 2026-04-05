"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface Entry { score: number; created_at: string; }

function computeStreak(entries: Entry[]): number {
  if (!entries.length) return 0;
  let streak = 1;
  const sorted = [...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i - 1].created_at).getTime() - new Date(sorted[i].created_at).getTime()) / 86400000;
    if (diff < 2) streak++;
    else break;
  }
  return streak;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const supabase = createClient();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("mood_entries").select("score,created_at").order("created_at", { ascending: false }).limit(14)
      .then(({ data }) => { setEntries(data ?? []); setLoading(false); });
  }, []);

  const dateLocale = locale === "en" ? "en-US" : "nb-NO";
  const chartData = [...entries].reverse().map(e => ({
    date: new Date(e.created_at).toLocaleDateString(dateLocale, { month: "short", day: "numeric" }),
    score: e.score,
  }));

  const avg = entries.length ? (entries.reduce((s, e) => s + e.score, 0) / entries.length).toFixed(1) : "—";
  const streak = computeStreak(entries);

  return (
    <div>
      <NavBar />
      <main className="max-w-3xl mx-auto mt-10 px-4">
        <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
        {loading ? <p className="text-gray-400">{tCommon("loading")}</p> : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold text-indigo-700">{avg}</p>
                <p className="text-sm text-gray-500 mt-1">{t("avgMood")}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold text-indigo-700">{streak}</p>
                <p className="text-sm text-gray-500 mt-1">{t("dayStreak")}</p>
              </div>
              <div className="bg-white rounded-xl border p-4 text-center">
                <p className="text-3xl font-bold text-indigo-700">{entries.length}</p>
                <p className="text-sm text-gray-500 mt-1">{t("checkins")}</p>
              </div>
            </div>
            {chartData.length > 1 ? (
              <div className="bg-white rounded-xl border p-4 mb-8">
                <h2 className="text-sm font-medium text-gray-500 mb-4">{t("moodOverTime")}</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6 text-center mb-8">
                <p className="text-gray-500 text-sm">{t("noDataPrompt")}</p>
                <Link href="/checkin" className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:underline">{t("firstCheckin")}</Link>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { href: "/checkin", label: t("moodCheckin"), icon: "📊" },
                { href: "/chat", label: t("aiCompanion"), icon: "💬" },
                { href: "/journal", label: t("journal"), icon: "📝" },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href} className="bg-white rounded-xl border p-4 flex items-center gap-3 hover:border-indigo-300 transition-colors">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
