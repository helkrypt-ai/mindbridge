"use client";
import { useState, useRef, useEffect } from "react";
import NavBar from "@/components/NavBar";
import CrisisModal from "@/components/CrisisModal";
import { hasCrisisKeywords } from "@/lib/crisis";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    if (hasCrisisKeywords(text)) setShowCrisis(true);
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      const newSid = res.headers.get("X-Session-Id");
      if (newSid && !sessionId) setSessionId(newSid);

      const contentType = res.headers.get("Content-Type") ?? "";
      if (contentType.includes("text/event-stream")) {
        let assistant = "";
        setMessages(m => [...m, { role: "assistant", content: "" }]);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const d = line.slice(6);
              if (d === "[DONE]") break;
              try {
                const { text } = JSON.parse(d);
                assistant += text;
                setMessages(m => { const copy = [...m]; copy[copy.length - 1] = { role: "assistant", content: assistant }; return copy; });
              } catch {}
            }
          }
        }
      } else {
        const { content } = await res.json();
        setMessages(m => [...m, { role: "assistant", content }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <div className="text-4xl mb-3">💙</div>
            <p>Hi, I'm MindBridge. How are you feeling today?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-white border text-gray-800"}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t bg-white px-4 py-3 max-w-2xl mx-auto w-full">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Share what's on your mind…" disabled={loading} className="flex-1 border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={loading || !input.trim()} className="bg-indigo-600 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{loading ? "…" : "Send"}</button>
        </form>
      </div>
    </div>
  );
}
