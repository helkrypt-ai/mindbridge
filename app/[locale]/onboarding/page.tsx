"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = [t("steps.name"), t("steps.goals"), t("steps.concern")];
  const questions = [t("nameQuestion"), t("goalsQuestion"), t("concernQuestion")];
  const concernKeys = ["anxiety", "depression", "stress", "relationship", "sleep", "other"] as const;

  async function handleFinish() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    await supabase.from("profiles").upsert({ id: user.id, name, goals, primary_concern: concern });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-indigo-600" : "bg-gray-200"}`} />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{questions[step]}</h2>
        {step === 0 && <input autoFocus type="text" placeholder={t("namePlaceholder")} value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />}
        {step === 1 && <textarea placeholder={t("goalsPlaceholder")} value={goals} onChange={e => setGoals(e.target.value)} rows={4} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />}
        {step === 2 && (
          <div className="space-y-3">
            {concernKeys.map(key => (
              <button key={key} onClick={() => setConcern(key)} className={`w-full text-left px-4 py-3 rounded-lg border ${concern === key ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 hover:border-indigo-300"}`}>
                {t(`concerns.${key}`)}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-6">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 border rounded-lg py-2.5 font-medium hover:bg-gray-50">{tCommon("back")}</button>}
          {step < 2
            ? <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !name} className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">{tCommon("next")}</button>
            : <button onClick={handleFinish} disabled={loading || !concern} className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50">{loading ? tCommon("saving") : t("getStarted")}</button>
          }
        </div>
      </div>
    </div>
  );
}
