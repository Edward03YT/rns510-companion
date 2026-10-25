import { ParsedLog } from "./types";
import { AnalysisResult, AnalyzedFault } from "./analyze";
import { anonymizeVin, anonymizePlate } from "./anonymize";

/**
 * Generates a clean, readable Markdown report from parsed and analyzed VCDS log data.
 */
export function exportLogToMarkdown(
  parsed: ParsedLog,
  analysis: AnalysisResult,
  anonymize: boolean,
  lang: "ro" | "en" = "en"
): string {
  const isRo = lang === "ro";
  const vin = anonymize ? anonymizeVin(parsed.meta.vin) : parsed.meta.vin || "N/A";
  const plate = anonymize ? anonymizePlate(parsed.meta.plate) : parsed.meta.plate || "N/A";

  const lines: string[] = [];

  // Header
  lines.push(isRo ? "# Raport Analiză Jurnal VCDS" : "# VCDS Diagnostic Analysis Report");
  lines.push("");
  lines.push(`_${isRo ? "Generat cu RNS 510 Companion — Procesat local în browser" : "Generated with RNS 510 Companion — Processed locally in browser"}_`);
  lines.push("");

  // Metadata Table
  lines.push(isRo ? "## Informații Vehicul & Scanare" : "## Vehicle & Scan Information");
  lines.push("");
  lines.push(`- **${isRo ? "Dată scanare" : "Scan Date"}:** ${parsed.meta.scanDate || "N/A"}`);
  lines.push(`- **${isRo ? "Kilometraj" : "Mileage"}:** ${parsed.meta.mileageKm ? `${parsed.meta.mileageKm.toLocaleString()} km` : "N/A"}`);
  lines.push(`- **${isRo ? "Serie șasiu (VIN)" : "VIN"}:** \`${vin}\``);
  lines.push(`- **${isRo ? "Număr înmatriculare" : "License Plate"}:** \`${plate}\``);
  lines.push(`- **${isRo ? "Tip șasiu" : "Chassis"}:** ${parsed.meta.chassis || "N/A"}`);
  lines.push(`- **${isRo ? "Versiune VCDS" : "VCDS Version"}:** ${parsed.meta.vcdsVersion || "N/A"}`);
  lines.push("");

  // Summary
  lines.push(isRo ? "## Rezumat Diagnoză" : "## Diagnostic Summary");
  lines.push("");
  lines.push(`- **${isRo ? "Module totale scanate" : "Total modules scanned"}:** ${analysis.summary.totalModules}`);
  lines.push(`- **${isRo ? "Module cu erori stocate" : "Modules with stored faults"}:** ${analysis.summary.modulesWithFaults}`);
  lines.push(`- **${isRo ? "Module fără erori (OK)" : "Modules reporting OK"}:** ${analysis.summary.modulesOk}`);
  lines.push(`- **${isRo ? "Total erori unice" : "Unique faults"}:** ${analysis.summary.uniqueFaults}`);
  lines.push(`  - **Check (Verificare):** ${analysis.summary.countsBySeverity.check}`);
  lines.push(`  - **Low (Minor / Confort):** ${analysis.summary.countsBySeverity.low}`);
  lines.push(`  - **Info (Probabil irelevant / Stocat):** ${analysis.summary.countsBySeverity.info}`);
  lines.push(`  - **Unknown (Fără regulă):** ${analysis.summary.countsBySeverity.unknown}`);
  lines.push("");
  lines.push(`> [!NOTE]`);
  lines.push(`> ${isRo ? analysis.summary.note.ro : analysis.summary.note.en}`);
  lines.push("");

  // Event Clusters
  if (analysis.clusters.length > 0) {
    lines.push(isRo ? "## Clustere de Evenimente Corelate" : "## Correlated Event Clusters");
    lines.push("");
    for (const cluster of analysis.clusters) {
      lines.push(`### 🔗 ${isRo ? cluster.title.ro : cluster.title.en} — ${cluster.date} ${cluster.time} (${cluster.mileageKm.toLocaleString()} km)`);
      lines.push(isRo ? "Erorile de mai jos s-au produs la același kilometraj într-un interval scurt de timp:" : "The following faults occurred at the exact same mileage within a short time window:");
      lines.push("");
      for (const f of cluster.faults) {
        lines.push(`- **Address ${f.moduleAddress} (${f.moduleName}):** \`${f.code}\` - ${f.description} _[${f.time}]_`);
      }
      lines.push("");
    }
  }

  // Module Details
  lines.push(isRo ? "## Detalii Module & Coduri de Eroare" : "## Module Breakdown & Fault Codes");
  lines.push("");

  // Group analyzed faults by module
  const faultsByModule = new Map<string, AnalyzedFault[]>();
  for (const af of analysis.analyzedFaults) {
    if (!faultsByModule.has(af.moduleAddress)) {
      faultsByModule.set(af.moduleAddress, []);
    }
    faultsByModule.get(af.moduleAddress)!.push(af);
  }

  // Sort: faulted modules first, then OK modules
  const sortedModules = [...parsed.modules].sort((a, b) => {
    const aFaults = a.faults.length;
    const bFaults = b.faults.length;
    if (aFaults > 0 && bFaults === 0) return -1;
    if (aFaults === 0 && bFaults > 0) return 1;
    return a.address.localeCompare(b.address);
  });

  for (const mod of sortedModules) {
    const isDup = !!mod.duplicateOf;
    lines.push(`### Address ${mod.address}: ${mod.name} ${isDup ? `_(Identical unit as Address ${mod.duplicateOf})_` : ""}`);
    lines.push("");
    if (mod.partNoSw || mod.partNoHw) {
      lines.push(`- **Part No:** SW: \`${mod.partNoSw || "N/A"}\` | HW: \`${mod.partNoHw || "N/A"}\``);
    }
    if (mod.component) {
      lines.push(`- **Component:** \`${mod.component}\``);
    }
    if (mod.coding) {
      lines.push(`- **Coding:** \`${mod.coding}\``);
    }
    if (mod.statusText) {
      lines.push(`- **Status:** ${mod.statusText} ${mod.statusCode ? `(${mod.statusCode})` : ""}`);
    }
    lines.push("");

    const modFaults = faultsByModule.get(mod.address) || [];

    if (modFaults.length === 0) {
      lines.push(isRo ? "_Niciun cod de eroare găsit._" : "_No fault code found._");
      lines.push("");
    } else {
      for (const af of modFaults) {
        const severityBadge = `[${af.severity.toUpperCase()}]`;
        lines.push(`#### ${severityBadge} \`${af.fault.code}\` ${af.fault.dtc ? `(${af.fault.dtc})` : ""} — ${af.fault.description}`);

        if (af.fault.subStatus.length > 0) {
          for (const sub of af.fault.subStatus) {
            lines.push(`- **Sub-status:** \`${sub.code}\` - ${sub.text}`);
          }
        }

        if (af.explanation) {
          const exp = isRo ? af.explanation.ro : af.explanation.en;
          lines.push(`- **${isRo ? "Explicație" : "Explanation"}:** ${exp}`);
        }

        if (af.suggestion) {
          const sug = isRo ? af.suggestion.ro : af.suggestion.en;
          lines.push(`- **${isRo ? "Sugestie" : "Suggestion"}:** ${sug}`);
        }

        if (af.timestampFlags.length > 0) {
          const flagTexts = af.timestampFlags.map((f) => {
            if (f === "stale") return isRo ? "dată expirată (>180 zile)" : "stale date (>180 days)";
            if (f === "inconsistent") return isRo ? "dată/oră inconsistentă cu scanarea" : "inconsistent with scan datetime/mileage";
            if (f === "default-date") return isRo ? "dată implicită ceas nesetat" : "default factory clock date";
            return f;
          });
          lines.push(`- **⚠️ ${isRo ? "Atenție timestamp" : "Timestamp warning"}:** ${flagTexts.join(", ")}`);
        }

        const ff = af.fault.freezeFrames[0];
        if (ff) {
          const ffDetails: string[] = [];
          if (ff.date) ffDetails.push(`Date: ${ff.date}`);
          if (ff.time) ffDetails.push(`Time: ${ff.time}`);
          if (ff.mileageKm !== undefined) ffDetails.push(`Mileage: ${ff.mileageKm.toLocaleString()} km`);
          if (ff.voltage !== undefined) ffDetails.push(`Voltage: ${ff.voltage} V`);
          if (ffDetails.length > 0) {
            lines.push(`- **Freeze Frame:** ${ffDetails.join(" | ")}`);
          }
        }

        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
  }

  // Footer Disclaimers
  lines.push(isRo ? "## Declinare de Responsabilitate" : "## Disclaimers");
  lines.push(isRo
    ? "Acest raport are scop exclusiv informativ și nu constituie o diagnoză profesională. Aplicația este un proiect independent și nu este afiliată cu Volkswagen AG sau Ross-Tech."
    : "This report is for informational purposes only and does not constitute a professional diagnosis. This tool is independent and not affiliated with Volkswagen AG or Ross-Tech.");
  lines.push("");

  return lines.join("\n");
}
