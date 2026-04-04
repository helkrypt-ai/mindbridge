"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";
import CrisisModal from "@/components/CrisisModal";
import { hasCrisisKeywords } from "@/lib/crisis";

export default function JournalPage() {
  const [content, setContent] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  async function handleReflect(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    if (hasCrisisKeywords(content)) setShowCrisis(true);
    setLoading(true);
    const res = await fetch("/api/journal/reflect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    const { reflectionPrompt } = await res.json();
    setReflection(reflectionPrompt);
    setLoading(false);
  }

  return (
    <div>
      <NavBar />
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}
      <main className="max-w-2xl mx-auto mt-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Journal</h1>
        <form onSubmit={handleReflect} className="space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write freely about how you're feeling…"
            rows={10}
            className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button type="submit" disabled={!content.trim() || loading} className="bg-indigo-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Reflecting…" : "Save & get reflection"}
          </button>
        </form>
        {reflection && (
          <div className="mt-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4">
            <p className="text-sm font-medium text-indigo-700 mb-1">Reflection prompt</p>
            <p className="text-gray-800">{reflection}</p>
          </div>
        )}
      </main>
    </div>
  );
}
