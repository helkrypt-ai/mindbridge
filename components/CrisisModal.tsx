"use client";

interface Props {
  onClose: () => void;
}

export default function CrisisModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💙</div>
          <h2 className="text-xl font-bold text-gray-900">You're not alone</h2>
          <p className="text-sm text-gray-600 mt-1">If you're in crisis, please reach out for immediate support.</p>
        </div>
        <div className="space-y-3">
          <a href="tel:988" className="flex items-center gap-3 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 hover:bg-indigo-100">
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-indigo-800">988 Suicide & Crisis Lifeline</p>
              <p className="text-xs text-indigo-600">Call or text 988 — 24/7, free, confidential</p>
            </div>
          </a>
          <a href="sms:741741?body=HOME" className="flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 hover:bg-purple-100">
            <span className="text-2xl">💬</span>
            <div>
              <p className="font-semibold text-purple-800">Crisis Text Line</p>
              <p className="text-xs text-purple-600">Text HOME to 741741 — 24/7 text support</p>
            </div>
          </a>
          <a href="tel:911" className="flex items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4 hover:bg-red-100">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-semibold text-red-800">Emergency Services</p>
              <p className="text-xs text-red-600">Call 911 for immediate emergency help</p>
            </div>
          </a>
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">I'm safe, close this</button>
      </div>
    </div>
  );
}
