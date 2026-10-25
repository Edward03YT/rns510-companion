import { ParsedLog, Fault } from "./types";
import defaultFaultRules from "../../../data/fault-rules.json";

export type Severity = "check" | "low" | "info" | "unknown";

export type TimestampFlag = "stale" | "inconsistent" | "default-date";

export type FaultRule = {
  code: string;
  module?: string;
  subStatus?: string;
  severity: Severity;
  explanation: { ro: string; en: string };
  suggestion: { ro: string; en: string };
  related?: string[];
  source: string;
};

export type AnalyzedFault = {
  moduleAddress: string;
  moduleName: string;
  fault: Fault;
  severity: Severity;
  explanation?: { ro: string; en: string };
  suggestion?: { ro: string; en: string };
  timestampFlags: TimestampFlag[];
  clusterId?: string;
  isDuplicateModule?: boolean;
};

export type EventCluster = {
  id: string;
  title: { ro: string; en: string };
  date: string;
  time: string;
  mileageKm: number;
  faults: {
    moduleAddress: string;
    moduleName: string;
    code: string;
    description: string;
    time: string;
  }[];
};

export type AnalysisSummary = {
  totalModules: number;
  modulesWithFaults: number;
  modulesOk: number;
  totalRawFaults: number;
  uniqueFaults: number;
  countsBySeverity: Record<Severity, number>;
  worthChecking: AnalyzedFault[];
  probablyIrrelevant: AnalyzedFault[];
  note: { ro: string; en: string };
};

export type AnalysisResult = {
  summary: AnalysisSummary;
  clusters: EventCluster[];
  analyzedFaults: AnalyzedFault[];
};

function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function parseDateTimeToEpoch(dateStr: string, timeStr?: string): number | null {
  try {
    // dateStr format: YYYY.MM.DD -> YYYY-MM-DD
    const isoDate = dateStr.replace(/\./g, "-");
    const isoTime = timeStr || "00:00:00";
    const parsed = Date.parse(`${isoDate}T${isoTime}`);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Finds the most specific rule matching a given fault and module.
 */
function findRule(
  rules: FaultRule[],
  moduleAddress: string,
  fault: Fault
): FaultRule | null {
  let bestMatch: FaultRule | null = null;
  let highestScore = -1;

  const normalizedMod = moduleAddress.toUpperCase();
  const faultCode = fault.code.trim();
  const faultDtc = fault.dtc?.trim().toUpperCase();
  const subCodes = fault.subStatus.map((s) => s.code.trim().toUpperCase());

  for (const rule of rules) {
    const ruleMod = rule.module ? rule.module.toUpperCase() : null;
    const ruleCode = rule.code.trim().toUpperCase();

    // Check code or DTC match
    const codeMatches =
      ruleCode === faultCode ||
      (faultDtc && ruleCode === faultDtc) ||
      (ruleCode.startsWith("B") && faultDtc === ruleCode);

    if (!codeMatches) continue;

    // Check module match
    const modMatches = !ruleMod || ruleMod === normalizedMod;
    if (!modMatches) continue;

    // Check subStatus match
    const subMatches =
      !rule.subStatus ||
      subCodes.some((sc) => sc.startsWith(rule.subStatus!.toUpperCase()));

    let score = 1; // base code match
    if (ruleMod && ruleMod === normalizedMod) score += 2;
    if (rule.subStatus && subMatches) score += 4;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule;
    }
  }

  return bestMatch;
}

/**
 * Analyzes a ParsedLog with fault rules, timestamp heuristics,
 * duplicate handling, and event clustering.
 */
export function analyzeLog(
  log: ParsedLog,
  customRules?: FaultRule[]
): AnalysisResult {
  const rules = customRules || (defaultFaultRules as FaultRule[]);

  const scanEpoch = log.meta.scanDate ? Date.parse(log.meta.scanDate) : null;
  const scanMileage = log.meta.mileageKm;

  // 1. Identify "default-date" candidates:
  // 3 or more distinct mileages sharing the exact same freeze-frame date across non-duplicate modules
  const dateToMileages = new Map<string, Set<number>>();

  for (const mod of log.modules) {
    if (mod.duplicateOf) continue;
    for (const fault of mod.faults) {
      const firstFf = fault.freezeFrames[0];
      if (firstFf?.date && firstFf.mileageKm !== undefined) {
        if (!dateToMileages.has(firstFf.date)) {
          dateToMileages.set(firstFf.date, new Set<number>());
        }
        dateToMileages.get(firstFf.date)!.add(firstFf.mileageKm);
      }
    }
  }

  const defaultDates = new Set<string>();
  dateToMileages.forEach((mileages, date) => {
    if (mileages.size >= 3) {
      defaultDates.add(date);
    }
  });

  // 2. Initial analysis of each fault
  const analyzedFaults: AnalyzedFault[] = [];

  for (const mod of log.modules) {
    const isDuplicate = !!mod.duplicateOf;

    for (const fault of mod.faults) {
      const timestampFlags: TimestampFlag[] = [];
      const firstFf = fault.freezeFrames[0];

      if (firstFf?.date) {
        // Check default-date
        if (defaultDates.has(firstFf.date)) {
          timestampFlags.push("default-date");
        }

        const ffEpoch = parseDateTimeToEpoch(firstFf.date, firstFf.time);

        // Check stale (more than 180 days before scan date)
        if (scanEpoch && ffEpoch && !isNaN(ffEpoch) && !isNaN(scanEpoch)) {
          const diffDays = (scanEpoch - ffEpoch) / (1000 * 60 * 60 * 24);
          if (diffDays > 180) {
            timestampFlags.push("stale");
          }
        }

        // Check inconsistent (datetime later than scan, or mileage greater than scan)
        let inconsistent = false;
        if (scanEpoch && ffEpoch && !isNaN(ffEpoch) && !isNaN(scanEpoch)) {
          if (ffEpoch > scanEpoch) {
            inconsistent = true;
          }
        }
        if (
          scanMileage !== null &&
          scanMileage !== undefined &&
          firstFf.mileageKm !== undefined &&
          firstFf.mileageKm > scanMileage
        ) {
          inconsistent = true;
        }

        if (inconsistent) {
          timestampFlags.push("inconsistent");
        }
      }

      // Rules lookup
      const matchedRule = findRule(rules, mod.address, fault);

      const severity: Severity = matchedRule ? matchedRule.severity : "unknown";
      const explanation = matchedRule
        ? matchedRule.explanation
        : {
            en: "No explanation in database yet",
            ro: "Nicio explicație în baza de date momentan",
          };
      const suggestion = matchedRule ? matchedRule.suggestion : undefined;

      analyzedFaults.push({
        moduleAddress: mod.address,
        moduleName: mod.name,
        fault,
        severity,
        explanation,
        suggestion,
        timestampFlags,
        isDuplicateModule: isDuplicate,
      });
    }
  }

  // 3. Event Clustering
  // Group non-duplicate faults that share same date and mileage with times within ±15 minutes (900 seconds)
  const nonDuplicateFaults = analyzedFaults.filter((af) => !af.isDuplicateModule);
  const clusterGroups = new Map<string, typeof nonDuplicateFaults>();

  for (const af of nonDuplicateFaults) {
    const ff = af.fault.freezeFrames[0];
    if (ff?.date && ff?.mileageKm !== undefined && ff?.time) {
      const key = `${ff.date}@${ff.mileageKm}`;
      if (!clusterGroups.has(key)) {
        clusterGroups.set(key, []);
      }
      clusterGroups.get(key)!.push(af);
    }
  }

  const clusters: EventCluster[] = [];
  let clusterCounter = 1;

  clusterGroups.forEach((faults, key) => {
    if (faults.length < 2) return;

    // Sort by time in seconds
    faults.sort((a, b) => {
      const tA = parseTimeToSeconds(a.fault.freezeFrames[0]?.time || "00:00:00");
      const tB = parseTimeToSeconds(b.fault.freezeFrames[0]?.time || "00:00:00");
      return tA - tB;
    });

    // Check if times fall within a 15-minute window (900 seconds)
    // Cluster faults where time difference from first in cluster is <= 900 seconds
    const [date, mileageStr] = key.split("@");
    const mileage = parseInt(mileageStr, 10);

    let currentClusterFaults: typeof faults = [];
    let windowStartTime = -1;

    for (const fault of faults) {
      const faultTimeSec = parseTimeToSeconds(fault.fault.freezeFrames[0]?.time || "00:00:00");

      if (windowStartTime === -1) {
        windowStartTime = faultTimeSec;
        currentClusterFaults = [fault];
      } else if (faultTimeSec - windowStartTime <= 900) {
        currentClusterFaults.push(fault);
      } else {
        // Close previous cluster if >= 2
        if (currentClusterFaults.length >= 2) {
          const clusterId = `cluster-${clusterCounter++}`;
          currentClusterFaults.forEach((f) => (f.clusterId = clusterId));
          clusters.push({
            id: clusterId,
            title: {
              en: "Likely one event",
              ro: "Probabil un singur eveniment",
            },
            date,
            time: currentClusterFaults[0].fault.freezeFrames[0]?.time || "00:00:00",
            mileageKm: mileage,
            faults: currentClusterFaults.map((f) => ({
              moduleAddress: f.moduleAddress,
              moduleName: f.moduleName,
              code: f.fault.code,
              description: f.fault.description,
              time: f.fault.freezeFrames[0]?.time || "",
            })),
          });
        }
        windowStartTime = faultTimeSec;
        currentClusterFaults = [fault];
      }
    }

    if (currentClusterFaults.length >= 2) {
      const clusterId = `cluster-${clusterCounter++}`;
      currentClusterFaults.forEach((f) => (f.clusterId = clusterId));
      clusters.push({
        id: clusterId,
        title: {
          en: "Likely one event",
          ro: "Probabil un singur eveniment",
        },
        date,
        time: currentClusterFaults[0].fault.freezeFrames[0]?.time || "00:00:00",
        mileageKm: mileage,
        faults: currentClusterFaults.map((f) => ({
          moduleAddress: f.moduleAddress,
          moduleName: f.moduleName,
          code: f.fault.code,
          description: f.fault.description,
          time: f.fault.freezeFrames[0]?.time || "",
        })),
      });
    }
  });

  // 4. Compute Summary
  const countsBySeverity: Record<Severity, number> = {
    check: 0,
    low: 0,
    info: 0,
    unknown: 0,
  };

  const worthChecking: AnalyzedFault[] = [];
  const probablyIrrelevant: AnalyzedFault[] = [];

  for (const af of nonDuplicateFaults) {
    countsBySeverity[af.severity]++;
    if (af.severity === "check" || af.severity === "low") {
      worthChecking.push(af);
    } else if (af.severity === "info") {
      probablyIrrelevant.push(af);
    }
  }

  const modulesWithFaults = log.modules.filter((m) => m.faults.length > 0).length;
  const modulesOk = log.modules.filter((m) => m.faults.length === 0).length;

  const summary: AnalysisSummary = {
    totalModules: log.modules.length,
    modulesWithFaults,
    modulesOk,
    totalRawFaults: log.modules.reduce((acc, m) => acc + m.faults.length, 0),
    uniqueFaults: nonDuplicateFaults.length,
    countsBySeverity,
    worthChecking,
    probablyIrrelevant,
    note: {
      en: "Module status lines such as 'Malfunction' can come from stored, sporadic historical faults and do not always mean an active problem.",
      ro: "Stările modulelor precum 'Malfunction' pot proveni din erori istorice stocate sau sporadice și nu indică întotdeauna o problemă activă în prezent.",
    },
  };

  return {
    summary,
    clusters,
    analyzedFaults,
  };
}
