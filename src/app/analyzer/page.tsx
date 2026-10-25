"use client";

import React, { useState, useRef } from "react";
import {
  FileSearch,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Shield,
  Layers,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { parseLog } from "@/lib/vcds/parseLog";
import { analyzeLog, AnalysisResult, AnalyzedFault, Severity } from "@/lib/vcds/analyze";
import { exportLogToMarkdown } from "@/lib/vcds/export";
import { anonymizeVin, anonymizePlate } from "@/lib/vcds/anonymize";
import { SAMPLE_VCDS_LOG } from "@/lib/vcds/sampleLogData";
import { ParsedLog } from "@/lib/vcds/types";

export default function AnalyzerPage() {
  const { t, locale } = useLanguage();

  const [rawText, setRawText] = useState("");
  const [anonymize, setAnonymize] = useState(true);
  const [parsed, setParsed] = useState<ParsedLog | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "worth" | "low" | "info" | "unknown">("all");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedFreezeFrames, setExpandedFreezeFrames] = useState<Record<string, boolean>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessText = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setParsed(null);
      setAnalysis(null);
      return;
    }
    const p = parseLog(text);
    const a = analyzeLog(p);
    setParsed(p);
    setAnalysis(a);

    // Default open faulted modules, collapse OK modules
    const initExpanded: Record<string, boolean> = {};
    p.modules.forEach((m) => {
      initExpanded[m.address] = m.faults.length > 0;
    });
    setExpandedModules(initExpanded);
  };

  const readFileWithFallback = (file: File) => {
    const readerUtf8 = new FileReader();
    readerUtf8.onload = (e) => {
      const content = e.target?.result as string;
      if (content && !content.includes("\uFFFD")) {
        handleProcessText(content);
      } else {
        // Fall back to windows-1252
        const readerAnsi = new FileReader();
        readerAnsi.onload = (e2) => {
          handleProcessText((e2.target?.result as string) || "");
        };
        readerAnsi.readAsText(file, "windows-1252");
      }
    };
    readerUtf8.readAsText(file, "utf-8");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileWithFallback(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileWithFallback(file);
    }
  };

  const handleLoadSample = () => {
    handleProcessText(SAMPLE_VCDS_LOG);
  };

  const handleClear = () => {
    setRawText("");
    setParsed(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleModuleAccordion = (address: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [address]: !prev[address],
    }));
  };

  const toggleFreezeFrame = (key: string) => {
    setExpandedFreezeFrames((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyMarkdown = () => {
    if (!parsed || !analysis) return;
    const md = exportLogToMarkdown(parsed, analysis, anonymize, locale);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Severity badge styling
  const renderSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "check":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            CHECK
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            LOW
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            INFO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            UNKNOWN
          </span>
        );
    }
  };

  // Filter faults
  const filterAnalyzedFaults = (faults: AnalyzedFault[]) => {
    switch (activeFilter) {
      case "worth":
        return faults.filter((f) => f.severity === "check" || f.severity === "low");
      case "low":
        return faults.filter((f) => f.severity === "low");
      case "info":
        return faults.filter((f) => f.severity === "info");
      case "unknown":
        return faults.filter((f) => f.severity === "unknown");
      default:
        return faults;
    }
  };

  const isRo = locale === "ro";

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
            <FileSearch className="w-3.5 h-3.5" />
            <span>{t.analyzer.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {t.analyzer.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">{t.analyzer.subtitle}</p>
        </div>

        {/* Anonymize Toggle & Sample Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAnonymize(!anonymize)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              anonymize
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className={`w-4 h-4 ${anonymize ? "text-emerald-400" : "text-slate-400"}`} />
            <span>{t.analyzer.anonymizeToggle}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                anonymize ? "bg-emerald-400 shadow-sm shadow-emerald-400/80" : "bg-slate-500"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="no-print">
        <DisclaimerNotice compact />
      </div>

      {/* Input Section (Hidden if log parsed and user hasn't cleared) */}
      {!parsed && (
        <div className="space-y-4 no-print">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? "border-sky-500 bg-sky-500/10 scale-[1.01]"
                : "border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,text/plain"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-base font-semibold text-white">
                {t.analyzer.dropzonePlaceholder}
              </p>
              <p className="text-xs text-slate-400">
                {isRo
                  ? "Suportă fișiere .txt VCDS Auto-Scan. Toată procesarea se face local în browser."
                  : "Supports VCDS Auto-Scan .txt files. 100% processed locally in your browser."}
              </p>
            </div>
          </div>

          {/* Paste Textarea */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                {isRo ? "Sau lipește jurnalul VCDS direct:" : "Or paste VCDS text directly:"}
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.analyzer.loadSample}</span>
              </button>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => handleProcessText(e.target.value)}
              placeholder={t.analyzer.pastePlaceholder}
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/60"
            />
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {parsed && analysis && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                {copiedMarkdown ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">{isRo ? "Copiat!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>{isRo ? "Copiază ca Markdown" : "Copy as Markdown"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                <span>{isRo ? "Tipărește / Salvează PDF" : "Print / Save PDF"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 text-xs font-semibold transition-all border border-rose-500/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isRo ? "Analizează alt jurnal" : "Analyze another scan"}</span>
            </button>
          </div>

          {/* 1. Header Card: Vehicle & Scan Meta */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-xl print-card">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Dată Scanare" : "Scan Date"}</span>
                <p className="font-semibold text-slate-100 font-mono">
                  {parsed.meta.scanDate ? parsed.meta.scanDate.replace("T", " ") : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Kilometraj" : "Mileage"}</span>
                <p className="font-semibold text-white font-mono text-sm">
                  {parsed.meta.mileageKm ? `${parsed.meta.mileageKm.toLocaleString()} km` : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Serie Șasiu (VIN)" : "VIN"}</span>
                <p className="font-semibold text-sky-400 font-mono">
                  {anonymize ? anonymizeVin(parsed.meta.vin) : parsed.meta.vin || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Număr Înmatriculare" : "License Plate"}</span>
                <p className="font-semibold text-sky-400 font-mono">
                  {anonymize ? anonymizePlate(parsed.meta.plate) : parsed.meta.plate || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Șasiu" : "Chassis"}</span>
                <p className="font-semibold text-slate-200 font-mono">{parsed.meta.chassis || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium">{isRo ? "Versiune VCDS" : "VCDS Version"}</span>
                <p className="font-semibold text-slate-200 font-mono">{parsed.meta.vcdsVersion || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* 2. Summary Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4 shadow-xl print-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  {isRo ? "Module scanate" : "Total Modules"}
                </span>
                <p className="text-xl font-bold text-white mt-1">{analysis.summary.totalModules}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  {isRo ? "Module cu erori" : "Modules with Faults"}
                </span>
                <p className="text-xl font-bold text-amber-400 mt-1">{analysis.summary.modulesWithFaults}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  {isRo ? "Module OK" : "Modules OK"}
                </span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{analysis.summary.modulesOk}</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
                <span className="text-[11px] text-rose-300 uppercase font-semibold">Check</span>
                <p className="text-xl font-bold text-rose-400 mt-1">{analysis.summary.countsBySeverity.check}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center">
                <span className="text-[11px] text-amber-300 uppercase font-semibold">Low (Minor)</span>
                <p className="text-xl font-bold text-amber-400 mt-1">{analysis.summary.countsBySeverity.low}</p>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-center">
                <span className="text-[11px] text-sky-300 uppercase font-semibold">Info</span>
                <p className="text-xl font-bold text-sky-400 mt-1">{analysis.summary.countsBySeverity.info}</p>
              </div>
            </div>

            {/* Note about historical / stored faults */}
            <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/25 text-xs text-sky-200/90 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>{isRo ? analysis.summary.note.ro : analysis.summary.note.en}</p>
            </div>
          </div>

          {/* 3. Event Clusters Panel ("Likely one event") */}
          {analysis.clusters.length > 0 && (
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 p-5 sm:p-6 space-y-4 shadow-xl print-card print-break-inside-avoid">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm sm:text-base">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>{isRo ? "Grupuri de Evenimente Corelate" : "Likely Correlated Events"}</span>
              </div>

              <div className="space-y-3">
                {analysis.clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          {isRo ? cluster.title.ro : cluster.title.en}
                        </span>
                        <span className="text-slate-300 font-medium">
                          {cluster.date} &bull; {cluster.time} &bull; {cluster.mileageKm.toLocaleString()} km
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {isRo
                          ? `${cluster.faults.length} coduri stocate în interval de ±15 min`
                          : `${cluster.faults.length} faults stored within ±15 min window`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {cluster.faults.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                              Addr {f.moduleAddress}
                            </span>
                            <span className="font-semibold text-slate-200 font-mono">{f.code}</span>
                            <span className="text-slate-400 truncate">{f.description}</span>
                          </div>
                          <span className="text-slate-500 text-[10px] shrink-0 font-mono ml-2">
                            {f.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 no-print">
            <span className="text-xs text-slate-400 font-semibold mr-2">{isRo ? "Filtru:" : "Filter:"}</span>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRo ? "Toate" : "All"} ({analysis.summary.uniqueFaults})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("worth")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "worth"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRo ? "De verificat" : "Worth checking"} ({analysis.summary.worthChecking.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("low")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "low"
                  ? "bg-amber-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              Low ({analysis.summary.countsBySeverity.low})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("info")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "info"
                  ? "bg-sky-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              Info ({analysis.summary.countsBySeverity.info})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unknown")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "unknown"
                  ? "bg-slate-600 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              Unknown ({analysis.summary.countsBySeverity.unknown})
            </button>
          </div>

          {/* 5. Modules Accordion List */}
          <div className="space-y-4">
            {parsed.modules
              .filter((mod) => {
                if (activeFilter === "all") return true;
                const modFaults = analysis.analyzedFaults.filter(
                  (af) => af.moduleAddress === mod.address && !af.isDuplicateModule
                );
                return filterAnalyzedFaults(modFaults).length > 0;
              })
              .sort((a, b) => {
                const aFaults = a.faults.length;
                const bFaults = b.faults.length;
                if (aFaults > 0 && bFaults === 0) return -1;
                if (aFaults === 0 && bFaults > 0) return 1;
                return a.address.localeCompare(b.address);
              })
              .map((mod) => {
                const isExpanded = !!expandedModules[mod.address];
                const isDup = !!mod.duplicateOf;
                const modFaults = analysis.analyzedFaults.filter(
                  (af) => af.moduleAddress === mod.address
                );
                const filteredFaults = filterAnalyzedFaults(modFaults);

                return (
                  <div
                    key={mod.address}
                    className={`rounded-2xl border transition-all duration-200 print-card print-break-inside-avoid ${
                      mod.faults.length > 0
                        ? "border-slate-800 bg-slate-900/80 shadow-lg"
                        : "border-slate-800/60 bg-slate-950/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Module Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleModuleAccordion(mod.address)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-2xl"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-1 rounded-md border ${
                            mod.faults.length > 0
                              ? "bg-amber-950/50 text-amber-300 border-amber-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          Address {mod.address}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-bold text-white">
                              {mod.name}
                            </h2>
                            {mod.controllerId && (
                              <span className="text-xs text-slate-400 font-mono">
                                ({mod.controllerId})
                              </span>
                            )}
                          </div>

                          {isDup && (
                            <span className="inline-block text-[11px] text-indigo-400 mt-0.5">
                              {isRo
                                ? `Unitate identică cu Adresa ${mod.duplicateOf}`
                                : `Same physical unit as Address ${mod.duplicateOf}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {mod.faults.length > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {mod.faults.length}{" "}
                            {mod.faults.length === 1
                              ? isRo
                                ? "eroare"
                                : "fault"
                              : isRo
                              ? "erori"
                              : "faults"}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            OK
                          </span>
                        )}

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Module Accordion Body */}
                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-slate-800/80 pt-4 space-y-4">
                        {/* Module Info Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                          {mod.partNoSw && (
                            <div className="truncate">
                              <span className="text-slate-400">Part No SW: </span>
                              <span className="font-mono text-slate-200 font-semibold">{mod.partNoSw}</span>
                            </div>
                          )}
                          {mod.partNoHw && (
                            <div className="truncate">
                              <span className="text-slate-400">HW: </span>
                              <span className="font-mono text-slate-200 font-semibold">{mod.partNoHw}</span>
                            </div>
                          )}
                          {mod.component && (
                            <div className="truncate">
                              <span className="text-slate-400">Component: </span>
                              <span className="font-mono text-slate-200 font-semibold">{mod.component}</span>
                            </div>
                          )}
                          {mod.coding && (
                            <div className="flex items-center justify-between gap-1 col-span-1 sm:col-span-2 truncate">
                              <div className="truncate">
                                <span className="text-slate-400">Coding: </span>
                                <span className="font-mono text-sky-400 font-semibold">{mod.coding}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(mod.coding!, `code-${mod.address}`)}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title="Copy coding"
                              >
                                {copiedCode === `code-${mod.address}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Faults List */}
                        {filteredFaults.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-950/40 text-xs text-slate-400 text-center">
                            {isRo ? "Niciun cod de eroare găsit pentru filtrul curent." : "No fault codes matching current filter."}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredFaults.map((af, fIndex) => {
                              const ffKey = `${mod.address}-${af.fault.code}-${fIndex}`;
                              const isFfExpanded = !!expandedFreezeFrames[ffKey];
                              const primaryFf = af.fault.freezeFrames[0];

                              return (
                                <div
                                  key={fIndex}
                                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                                >
                                  {/* Fault Header */}
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {renderSeverityBadge(af.severity)}
                                      <span className="font-mono text-sm font-bold text-white">
                                        {af.fault.code}
                                      </span>
                                      {af.fault.dtc && (
                                        <span className="font-mono text-xs text-indigo-300 font-semibold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                                          {af.fault.dtc}
                                        </span>
                                      )}
                                      <span className="text-sm font-semibold text-slate-200">
                                        {af.fault.description}
                                      </span>
                                    </div>

                                    {/* Timestamp Unreliable Badge */}
                                    {af.timestampFlags.length > 0 && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        <span>
                                          {isRo ? "Timestamp nesigur" : "Timestamp unreliable"}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Sub-status and Status text */}
                                  {af.fault.subStatus.length > 0 && (
                                    <div className="text-xs text-slate-400 font-mono space-y-0.5">
                                      {af.fault.subStatus.map((sub, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-2">
                                          <span className="text-slate-500">&bull;</span>
                                          <span className="text-slate-300 font-semibold">{sub.code}</span>
                                          <span>-</span>
                                          <span>{sub.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Explanations & Suggestions */}
                                  <div className="space-y-1.5 text-xs border-l-2 border-sky-500/50 pl-3 py-0.5">
                                    {af.explanation && (
                                      <p className="text-slate-200 leading-relaxed">
                                        <strong className="text-sky-300 font-semibold">
                                          {isRo ? "Explicație: " : "Explanation: "}
                                        </strong>
                                        {isRo ? af.explanation.ro : af.explanation.en}
                                      </p>
                                    )}
                                    {af.suggestion && (
                                      <p className="text-slate-300 leading-relaxed">
                                        <strong className="text-emerald-300 font-semibold">
                                          {isRo ? "Sugestie: " : "Suggestion: "}
                                        </strong>
                                        {isRo ? af.suggestion.ro : af.suggestion.en}
                                      </p>
                                    )}
                                  </div>

                                  {/* Timestamp Unreliable Detailed Warning */}
                                  {af.timestampFlags.length > 0 && (
                                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
                                      <p className="font-semibold text-amber-300">
                                        ⚠️{" "}
                                        {isRo
                                          ? "Data și ora stocate nu sunt de încredere:"
                                          : "Stored date/time should not be trusted:"}
                                      </p>
                                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                        {af.timestampFlags.includes("inconsistent") && (
                                          <li>
                                            {isRo
                                              ? "Data/ora erorii este ulterioară scanării sau kilometrajul depășește odometrul."
                                              : "Freeze frame datetime is later than scan datetime, or mileage exceeds odometer."}
                                          </li>
                                        )}
                                        {af.timestampFlags.includes("default-date") && (
                                          <li>
                                            {isRo
                                              ? "Această dată apare la mai multe kilometraje distincte (ceas nereglat din fabrică)."
                                              : "This date appears across 3+ distinct mileages (unset / default factory clock)."}
                                          </li>
                                        )}
                                        {af.timestampFlags.includes("stale") && (
                                          <li>
                                            {isRo
                                              ? "Eroarea a fost stocată cu mai mult de 180 de zile înainte de scanare."
                                              : "Freeze frame is more than 180 days before the scan date."}
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Freeze Frame Summary & Expander */}
                                  {primaryFf && (
                                    <div className="pt-2 border-t border-slate-900">
                                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                                          {primaryFf.date && <span>📅 {primaryFf.date}</span>}
                                          {primaryFf.time && <span>⏰ {primaryFf.time}</span>}
                                          {primaryFf.mileageKm !== undefined && (
                                            <span>🚗 {primaryFf.mileageKm.toLocaleString()} km</span>
                                          )}
                                          {primaryFf.voltage !== undefined && (
                                            <span>⚡ {primaryFf.voltage.toFixed(2)} V</span>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => toggleFreezeFrame(ffKey)}
                                          className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 font-medium"
                                        >
                                          <span>{isFfExpanded ? (isRo ? "Ascunde Freeze Frame" : "Hide Freeze Frame") : (isRo ? "Arată Freeze Frame" : "Show Freeze Frame")}</span>
                                          {isFfExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>

                                      {isFfExpanded && (
                                        <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                                            {primaryFf.faultStatus && (
                                              <div>
                                                <span className="text-slate-500">Status: </span>
                                                <span>{primaryFf.faultStatus}</span>
                                              </div>
                                            )}
                                            {primaryFf.priority !== undefined && (
                                              <div>
                                                <span className="text-slate-500">Priority: </span>
                                                <span>{primaryFf.priority}</span>
                                              </div>
                                            )}
                                            {primaryFf.frequency !== undefined && (
                                              <div>
                                                <span className="text-slate-500">Frequency: </span>
                                                <span>{primaryFf.frequency}</span>
                                              </div>
                                            )}
                                            {primaryFf.resetCounter !== undefined && (
                                              <div>
                                                <span className="text-slate-500">Reset Ctr: </span>
                                                <span>{primaryFf.resetCounter}</span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Raw freeze frame lines */}
                                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5 max-h-40 overflow-y-auto">
                                            {af.fault.freezeFrames.flatMap((ff) => ff.raw).map((line, rIdx) => (
                                              <p key={rIdx}>{line}</p>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
