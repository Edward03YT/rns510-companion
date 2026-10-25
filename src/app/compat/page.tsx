"use client";

import React, { useState } from "react";
import {
  Cpu,
  Search,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  BatteryCharging,
  Disc,
  Compass,
  FileQuestion,
  Database,
  Send,
  Sparkles,
  Info,
} from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { evaluateCompatibility, CompatibilityVerdict } from "@/lib/compat/evaluate";
import { parseModule } from "@/lib/vcds/parseModule";
import { Status, Confidence } from "@/lib/compat/schema";
import defaultDatabase from "../../../data/rns510.json";

export default function CompatPage() {
  const { t, locale } = useLanguage();
  const isRo = locale === "ro";

  const [activeTab, setActiveTab] = useState<"form" | "paste">("form");
  const [partNumber, setPartNumber] = useState("1T0 035 680 C");
  const [hwLabel, setHwLabel] = useState("H50 2840");
  const [firmwareId, setFirmwareId] = useState("fw-5238-josi");
  const [mapId, setMapId] = useState("");
  const [pastedBlock, setPastedBlock] = useState("");
  const [verdict, setVerdict] = useState<CompatibilityVerdict | null>(() =>
    evaluateCompatibility({
      partNumber: "1T0 035 680 C",
      hwLabel: "H50 2840",
      firmwareId: "fw-5238-josi",
      mapId: "",
    })
  );
  const [datapointFilter, setDatapointFilter] = useState<string>("all");

  const runEvaluation = (part: string, hw: string, fw: string, map: string) => {
    const v = evaluateCompatibility({
      partNumber: part,
      hwLabel: hw,
      firmwareId: fw || undefined,
      mapId: map || undefined,
    });
    setVerdict(v);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runEvaluation(partNumber, hwLabel, firmwareId, mapId);
  };

  const handleSelectCandidate = (candidatePart: string) => {
    setPartNumber(candidatePart);
    runEvaluation(candidatePart, hwLabel, firmwareId, mapId);
  };

  const handlePasteExtract = () => {
    if (!pastedBlock.trim()) return;
    const mod = parseModule(pastedBlock);
    const extractedPart = mod.partNoSw || mod.partNoHw || "";
    let extractedHw = "";
    if (mod.component) {
      const match = mod.component.match(/H\d+\s+\d+/i);
      if (match) extractedHw = match[0];
    }

    if (extractedPart) {
      setPartNumber(extractedPart);
    }
    if (extractedHw) {
      setHwLabel(extractedHw);
    }
    runEvaluation(extractedPart || partNumber, extractedHw || hwLabel, firmwareId, mapId);
    setActiveTab("form");
  };

  const handleReset = () => {
    setPartNumber("");
    setHwLabel("");
    setFirmwareId("");
    setMapId("");
    setPastedBlock("");
    setVerdict(null);
  };

  // Status badge helper
  const renderStatusBadge = (status: Status) => {
    switch (status) {
      case "works":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {isRo ? "FUNCȚIONEAZĂ" : "WORKS"}
          </span>
        );
      case "unstable":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {isRo ? "INSTABIL" : "UNSTABLE"}
          </span>
        );
      case "incompatible":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-4 h-4 text-rose-400" />
            {isRo ? "INCOMPATIBIL" : "INCOMPATIBLE"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            {isRo ? "NECUNOSCUT" : "UNKNOWN"}
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence: Confidence) => {
    switch (confidence) {
      case "tested-by-maintainer":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            {isRo ? "Testat pe unitate fizică" : "Tested by Maintainer"}
          </span>
        );
      case "community-reported":
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-950/60 text-sky-400 border border-sky-500/30">
            {isRo ? "Raportat în comunitate" : "Community Reported"}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {isRo ? "Neverificat / Fără surse" : "Unverified"}
          </span>
        );
    }
  };

  const getGithubIssueUrl = () => {
    const repoUrl = "https://github.com/Edward03YT/rns510-companion/issues/new";
    const params = new URLSearchParams({
      template: "datapoint.yml",
      part_number: partNumber || "",
      hw_label: hwLabel || "",
      firmware: verdict?.selectedFirmware?.label || "",
      map: verdict?.selectedMap ? `${verdict.selectedMap.region} ${verdict.selectedMap.version}` : "",
    });
    return `${repoUrl}?${params.toString()}`;
  };

  // Filter datapoints table
  const filteredDatapoints = defaultDatabase.datapoints.filter((dp) => {
    if (datapointFilter === "all") return true;
    return dp.partNumber === datapointFilter;
  });

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Cpu className="w-3.5 h-3.5" />
          <span>{t.compat.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {t.compat.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">{t.compat.subtitle}</p>
      </div>

      <DisclaimerNotice compact />

      {/* Input Tabs Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-xl space-y-5">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "form"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.compat.tabForm}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "paste"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>{t.compat.tabPaste}</span>
          </button>
        </div>

        {/* Tab 1: Form View */}
        {activeTab === "form" && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Part Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.compat.partNumberLabel}
                </label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="e.g. 1T0 035 680 C"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* HW Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.compat.hwLabel}
                </label>
                <input
                  type="text"
                  value={hwLabel}
                  onChange={(e) => setHwLabel(e.target.value)}
                  placeholder="e.g. H50 2840"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Firmware Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.compat.fwLabel}
                </label>
                <select
                  value={firmwareId}
                  onChange={(e) => setFirmwareId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{t.compat.selectNoneFw}</option>
                  {defaultDatabase.firmwares.map((fw) => (
                    <option key={fw.id} value={fw.id}>
                      {fw.label} {fw.variant === "modded" ? "(Modded)" : "(Factory)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Map Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t.compat.mapLabel}
                </label>
                <select
                  value={mapId}
                  onChange={(e) => setMapId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{t.compat.selectNoneMap}</option>
                  {defaultDatabase.maps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.region} {m.version}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Suffix candidates chooser if base entered */}
            {verdict && verdict.suffixCandidates.length > 0 && (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
                <p className="font-semibold text-indigo-300">{t.compat.candidatePrompt}</p>
                <div className="flex flex-wrap gap-2">
                  {verdict.suffixCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => handleSelectCandidate(cand.partNumber)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-mono font-semibold border border-indigo-500/40 transition-all"
                    >
                      {cand.partNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.compat.checkButton}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition-all"
              >
                {t.compat.resetButton}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Paste VCDS Block View */}
        {activeTab === "paste" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">{t.compat.pasteInstructions}</p>
            <textarea
              value={pastedBlock}
              onChange={(e) => setPastedBlock(e.target.value)}
              placeholder={t.compat.pastePlaceholder}
              rows={7}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handlePasteExtract}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>{t.compat.parseAndFill}</span>
            </button>
          </div>
        )}
      </div>

      {/* Compatibility Verdict Card */}
      {verdict && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Main Verdict Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                {renderStatusBadge(verdict.status)}
                {renderConfidenceBadge(verdict.confidence)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white pt-2">
                {verdict.unit ? verdict.unit.partNumber : partNumber || "Unknown Unit"}
              </h2>
              {verdict.unit && (
                <p className="text-xs text-slate-400">
                  {verdict.unit.names.join(" / ")}
                  {hwLabel ? ` &bull; HW: ${hwLabel}` : ""}
                </p>
              )}
            </div>

            {/* Selected Targets */}
            <div className="flex flex-col sm:items-end gap-1 text-xs">
              {verdict.selectedFirmware && (
                <div className="text-slate-300">
                  <span className="text-slate-500">Firmware: </span>
                  <strong className="text-indigo-400 font-mono">
                    {verdict.selectedFirmware.label}
                  </strong>
                </div>
              )}
              {verdict.selectedMap && (
                <div className="text-slate-300">
                  <span className="text-slate-500">Map: </span>
                  <strong className="text-sky-400 font-mono">
                    {verdict.selectedMap.region} {verdict.selectedMap.version}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Primary Rule / Verdict Note */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Info className="w-4 h-4" />
              <span>{isRo ? "Notă de compatibilitate:" : "Compatibility Verdict Note:"}</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {verdict.primaryRule
                ? verdict.primaryRule.note
                : isRo
                ? "Nu există reguli specifice verificate pentru această combinație. Conform specificațiilor, starea este considerată NECUNOSCUTĂ fără presupuneri speculative."
                : "No verified test rule exists for this specific combination. Compatibility is strictly marked UNKNOWN without speculation."}
            </p>
          </div>

          {/* Unknown / Not Covered Section */}
          {verdict.unknownReasons.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-semibold">
                <FileQuestion className="w-4 h-4 text-slate-400" />
                <span>{t.compat.unknownNotice}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {verdict.unknownReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contextual Warnings */}
          {verdict.warnings.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{t.compat.warnings}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verdict.warnings.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 text-xs text-amber-200/90 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      {w.id.includes("charger") ? (
                        <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : w.id.includes("antenna") ? (
                        <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Disc className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <p className="leading-relaxed">{isRo ? w.text.ro : w.text.en}</p>
                    </div>

                    {w.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-500/20 text-[10px]">
                        {w.sources.map((s, sIdx) => (
                          <a
                            key={sIdx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400/80 hover:text-amber-300 inline-flex items-center gap-1 underline"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Section */}
          {verdict.primaryRule && verdict.primaryRule.sources.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.compat.sources}</span>
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {verdict.primaryRule.sources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 text-xs font-mono"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Report Result CTA */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-200">
                {isRo
                  ? "Ai testat o versiune pe această unitate?"
                  : "Have you tested a firmware or map on this unit?"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isRo
                  ? "Trimite un raport prin formularul GitHub pentru a îmbunătăți baza de date."
                  : "Submit your test datapoint via our GitHub issue template to grow the database."}
              </p>
            </div>
            <a
              href={getGithubIssueUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.compat.reportResult}</span>
            </a>
          </div>
        </div>
      )}

      {/* Community Datapoints Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Database className="w-4 h-4 text-sky-400" />
            <span>{t.compat.datapointsTitle}</span>
          </div>

          {/* Part Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">{t.compat.filterPart}</span>
            <select
              value={datapointFilter}
              onChange={(e) => setDatapointFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none"
            >
              <option value="all">{t.compat.allParts}</option>
              {defaultDatabase.units.map((u) => (
                <option key={u.id} value={u.partNumber}>
                  {u.partNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Datapoints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Part Number</th>
                <th className="py-2.5 px-3">HW</th>
                <th className="py-2.5 px-3">Firmware</th>
                <th className="py-2.5 px-3">Map</th>
                <th className="py-2.5 px-3">Result / Observations</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {filteredDatapoints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500 font-sans">
                    {t.compat.noDatapoints}
                  </td>
                </tr>
              ) : (
                filteredDatapoints.map((dp, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/40">
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                      {dp.partNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {dp.hw || "N/A"}
                    </td>
                    <td className="py-3 px-3 text-indigo-300 whitespace-nowrap">
                      {dp.firmware}
                    </td>
                    <td className="py-3 px-3 text-sky-300 whitespace-nowrap">
                      {dp.map || "N/A"}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 max-w-xs truncate" title={dp.result}>
                      {dp.result}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderConfidenceBadge(dp.confidence as Confidence)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {dp.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
