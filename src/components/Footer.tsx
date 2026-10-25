"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { DisclaimerNotice } from "./DisclaimerNotice";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Full Disclaimer section */}
        <DisclaimerNotice />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-200">{t.appName}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Client-Side
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/analyzer"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {t.nav.analyzer}
            </Link>
            <Link
              href="/compat"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {t.nav.compat}
            </Link>
          </div>

          <div className="text-slate-500 text-center sm:text-right">
            <span>{t.disclaimer.copyright}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
