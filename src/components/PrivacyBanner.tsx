"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/context";

export function PrivacyBanner() {
  const { t } = useLanguage();

  return (
    <div className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-200 text-xs sm:text-sm py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        <span>{t.privacyBanner}</span>
      </div>
    </div>
  );
}
