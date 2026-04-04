"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";

const MOOD_LABELS: Record<number, string> = {
  1: "Very low", 2: "Low", 3: "Below average", 4: "Slightly low",
  5: "Neutral", 6: "Slightly good", 7: "Good", 8: "Very good", 9: "Great", 10: "Excellent"
};

export default function CheckinPage() {
  const [score, setScore] = useState(5);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/mood", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, note }) });
    setSaved(true); setSaving(false);
  }

  if (saved) return (
    <div>
      <NavBar />
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold mb-2">Check-in saved!</h2>
        <p className="text-gray-500">Mood: {score}/10 — {MOOD_LABELS[score]}</p>
        <button onClick={() => setSaved(false)} className="mt-6 text-indigo-600 hover:underline text-sm">Log another</button>
      </div>
    </div>
  );

  return (
    <div>
      <NavBar />
      <main className="max-w-lg mx-auto mt-10 px-4">
        <h1 className="text-2xl font-bold mb-6">How are you feeling?</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>1 — Very low</span><span>10 — Excellent</span>
            </div>
            <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))} className="w-full accent-indigo-600" />
            <div className="text-center mt-2 text-3xl font-bold text-indigo-700">{score}</div>
            <div className="text-center text-sm text-gray-500">{MOOD_LABELS[score]}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="What's on your mind?" className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-700 disabled:opacity-50">{saving ? "Saving…" : "Save check-in"}</button>
        </form>
      </main>
    </div>
  );
}
