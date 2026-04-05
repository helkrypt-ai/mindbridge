"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/onboarding");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback` } });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-indigo-700 mb-6">{t("signUpTitle")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder={tCommon("email")} value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="password" placeholder={t("passwordPlaceholder")} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">
            {loading ? t("creatingAccount") : t("signUp")}
          </button>
        </form>
        <button onClick={handleGoogle} className="mt-3 w-full border rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50">{tCommon("continueWithGoogle")}</button>
        <p className="mt-4 text-center text-sm text-gray-500">
          {t.rich("alreadyAccount", {
            link: (chunks) => <Link href="/login" className="text-indigo-600 hover:underline">{chunks}</Link>,
          })}
        </p>
      </div>
    </div>
  );
}
