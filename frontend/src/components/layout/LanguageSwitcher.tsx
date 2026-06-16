"use client";

import { Globe } from "lucide-react";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor="locale-select">
        {t("nav.language")}
      </label>
      <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-sm shadow-sm ring-1 ring-[#E8DFD6]">
        <Globe className="h-4 w-4 text-[#6B5E57]" aria-hidden />
        <select
          id="locale-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="cursor-pointer bg-transparent text-sm text-[#1C1410] outline-none"
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {localeLabels[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
