"use client";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  onClose: () => void;
}

export default function CrisisModal({ onClose }: Props) {
  const t = useTranslations("crisis");
  const locale = useLocale();

  const line1Href = locale === "nb" ? "tel:116123" : "tel:988";
  const line2Href = locale === "nb" ? "tel:22400040" : "sms:741741?body=HOME";
  const line2Icon = locale === "nb" ? "📞" : "💬";
  const emergencyHref = locale === "nb" ? "tel:113" : "tel:911";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💙</div>
          <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="space-y-3">
          <a href={line1Href} className="flex items-center gap-3 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4 hover:bg-indigo-100">
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-indigo-800">{t("line1.name")}</p>
              <p className="text-xs text-indigo-600">{t("line1.detail")}</p>
            </div>
          </a>
          <a href={line2Href} className="flex items-center gap-3 rounded-lg border-2 border-purple-200 bg-purple-50 p-4 hover:bg-purple-100">
            <span className="text-2xl">{line2Icon}</span>
            <div>
              <p className="font-semibold text-purple-800">{t("line2.name")}</p>
              <p className="text-xs text-purple-600">{t("line2.detail")}</p>
            </div>
          </a>
          <a href={emergencyHref} className="flex items-center gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4 hover:bg-red-100">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-semibold text-red-800">{t("emergency.name")}</p>
              <p className="text-xs text-red-600">{t("emergency.detail")}</p>
            </div>
          </a>
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-lg border py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">{t("close")}</button>
      </div>
    </div>
  );
}
