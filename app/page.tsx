import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
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
      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-semibold text-indigo-700">MindBridge</span>
          <div className="flex items-center gap-5 text-sm text-gray-400">
            <a href="https://helkrypt-website-r0y71ofl8-helkrypt-ai.vercel.app/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="https://helkrypt-website-r0y71ofl8-helkrypt-ai.vercel.app/personvern" className="hover:text-gray-600 transition-colors">Personvernerklæring</a>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Helkrypt AI AS</p>
        </div>
      </footer>
    </div>
  );
}
