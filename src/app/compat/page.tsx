"use client";

import React from "react";
import { Cpu } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";

export default function CompatPage() {
  const { t } = useLanguage();

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>{t.compat.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {t.compat.title}
        </h1>
        <p className="text-sm text-slate-400">{t.compat.subtitle}</p>
      </div>

      <DisclaimerNotice compact />

      {/* Placeholder container for compat UI (implemented in Phase 5 & 6) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Cpu className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">{t.compat.title}</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {t.compat.comingSoon}
          </p>
        </div>
      </div>
    </div>
  );
}
