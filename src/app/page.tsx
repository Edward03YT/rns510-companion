"use client";

import React from "react";
import Link from "next/link";
import {
  FileSearch,
  Cpu,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/i18n/context";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Background ambient decorative glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950/60 border border-sky-500/30 text-sky-400 text-xs font-medium tracking-wide">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.home.privacyTitle}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
          {t.home.heroTitle}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {t.home.heroSubtitle}
        </p>
      </div>

      {/* Two Main Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Card 1: VCDS Log Analyzer */}
        <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-sky-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform duration-200">
              <FileSearch className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                {t.home.analyzerCard.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.home.analyzerCard.description}
              </p>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Automatic VIN & license plate anonymization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Grouped fault event clustering & duplicate unit detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unreliable timestamp & frozen clock alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Export clean diagnostic Markdown reports</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <Link
              href="/analyzer"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-sky-500/25 group/btn"
            >
              <span>{t.home.analyzerCard.action}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 2: RNS 510 Compat Checker */}
        <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-indigo-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                {t.home.compatCard.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.home.compatCard.description}
              </p>
            </div>

            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paste VCDS Address 37/56 block or manual part number lookup</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Firmware (Josi modded vs original) & maps compatibility</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Map-wipe warnings & under-voltage risks with cited sources</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Community test datapoints and GitHub report flow</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <Link
              href="/compat"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-indigo-500/25 group/btn"
            >
              <span>{t.home.compatCard.action}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Banner Box */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-200">
            {t.home.privacyTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.home.privacyText}
          </p>
        </div>
      </div>
    </div>
  );
}
