import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">MindBridge</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your AI mental wellness companion. Evidence-based support, personalized guidance, and always-on emotional presence.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition-colors">
            Get started
          </Link>
          <Link href="/login" className="rounded-lg border border-gray-200 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
