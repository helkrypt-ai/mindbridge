export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M8.111 8.111A6.003 6.003 0 0012 6c3.314 0 6 2.686 6 6a5.985 5.985 0 01-1.285 3.715M6.343 17.657A8 8 0 0012 20c4.418 0 8-3.582 8-8a7.963 7.963 0 00-1.343-4.414"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        You&apos;re offline
      </h1>
      <p className="text-gray-500 max-w-sm mb-8">
        MindBridge needs an internet connection to support you right now. Check
        your connection and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
