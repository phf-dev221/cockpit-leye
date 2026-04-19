"use client";

import { useLanguage } from "@/features/auth/i18n/language-context";

interface LanguageSwitcherProps {
  variant?: "button" | "text";
}

export function LanguageSwitcher({ variant = "button" }: LanguageSwitcherProps) {
  const { language } = useLanguage();

  if (variant === "text") {
    return (
      <span className="text-sm text-slate-500 transition-colors">{language.toUpperCase()}</span>
    );
  }

  return (
    <span className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500">
      {language.toUpperCase()}
    </span>
  );
}
