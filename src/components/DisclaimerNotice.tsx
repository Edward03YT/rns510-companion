"use client";

import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/i18n/context";

interface DisclaimerNoticeProps {
  compact?: boolean;
}

export function DisclaimerNotice({ compact = false }: DisclaimerNoticeProps) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">{t.disclaimer.informational}</p>
          <p>{t.disclaimer.risk}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-4 sm:p-5 text-xs sm:text-sm text-slate-300">
      <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
        <span>{t.disclaimer.title}</span>
      </div>
      <ul className="space-y-2 list-disc list-inside text-slate-400">
        <li>
          <strong className="text-slate-200">{t.disclaimer.informational}</strong>
        </li>
        <li>
          <strong className="text-amber-300/90">{t.disclaimer.risk}</strong>
        </li>
        <li>{t.disclaimer.nonAffiliation}</li>
        <li>{t.disclaimer.noFiles}</li>
        <li>{t.disclaimer.localProcessing}</li>
      </ul>
    </div>
  );
}
