"use client";
import { useState } from "react";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null, screen_context: typeof window !== "undefined" ? window.location.pathname : null }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() { setOpen(false); setRating(0); setComment(""); setSubmitted(false); setError(""); }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Give feedback" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.58A28.3 28.3 0 0010 14c2.236 0 4.43-.18 6.57-.524C18.007 13.245 19 11.986 19 10.574V5.426c0-1.413-.993-2.67-2.43-2.902A41.202 41.202 0 0010 2z" clipRule="evenodd" /></svg>
        Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <button onClick={handleClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🙏</div>
                <p className="font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve MindBridge.</p>
              </div>
            ) : (
              <>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Share your feedback</h2>
                <p className="text-sm text-gray-500 mb-4">How are we doing? Your response is anonymous.</p>
                <form onSubmit={handleSubmit}>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`} aria-label={`Rate ${star}`}>★</button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Anything you'd like to share? (optional)" rows={3} className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                  <button type="submit" disabled={!rating || submitting} className="mt-3 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? "Sending…" : "Submit feedback"}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
