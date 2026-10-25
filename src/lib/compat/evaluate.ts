import {
  Rns510Database,
  Unit,
  Firmware,
  MapSet,
  Rule,
  Warning,
  Status,
  Confidence,
} from "./schema";
import { findUnitByPartNumber } from "./normalize";
import defaultDatabase from "../../../data/rns510.json";

export type EvaluationInput = {
  partNumber?: string;
  hwLabel?: string;
  firmwareId?: string;
  mapId?: string;
};

export type CompatibilityVerdict = {
  unit: Unit | null;
  unitKnown: boolean;
  suffixCandidates: Unit[];
  selectedFirmware: Firmware | null;
  selectedMap: MapSet | null;
  status: Status;
  confidence: Confidence;
  primaryRule: Rule | null;
  matchedRules: Rule[];
  conflictingRules: Rule[];
  warnings: Warning[];
  unknownReasons: string[];
};

export function evaluateCompatibility(
  input: EvaluationInput,
  customDb?: Rns510Database
): CompatibilityVerdict {
  const db = customDb || (defaultDatabase as unknown as Rns510Database);

  const { partNumber, firmwareId, mapId } = input;

  // 1. Resolve unit
  let unit: Unit | null = null;
  let suffixCandidates: Unit[] = [];
  let unitKnown = false;

  if (partNumber) {
    const lookup = findUnitByPartNumber(partNumber, db.units);
    if (lookup.exactMatch) {
      unit = lookup.exactMatch;
      unitKnown = true;
    } else {
      suffixCandidates = lookup.suffixCandidates;
      unitKnown = false;
    }
  }

  // 2. Resolve target firmware & map
  const selectedFirmware = firmwareId
    ? db.firmwares.find((f) => f.id === firmwareId) || null
    : null;
  const selectedMap = mapId
    ? db.maps.find((m) => m.id === mapId) || null
    : null;

  // 3. Match rules
  const matchedRules: { rule: Rule; score: number }[] = [];
  const unitId = unit ? unit.id : null;

  for (const rule of db.rules) {
    // Check unit applicability
    const unitApplies = rule.unitId === "*" || (unitId && rule.unitId === unitId);
    if (!unitApplies) continue;

    let score = 0;
    if (unitId && rule.unitId === unitId) {
      score += 10; // specific unit beats wildcard
    } else if (rule.unitId === "*") {
      score += 1;
    }

    if (firmwareId && mapId) {
      // Both firmware and map selected
      if (rule.firmwareId === firmwareId && rule.mapId === mapId) {
        matchedRules.push({ rule, score: score + 20 });
      } else if (rule.firmwareId === firmwareId && !rule.mapId) {
        matchedRules.push({ rule, score: score + 10 });
      } else if (!rule.firmwareId && rule.mapId === mapId) {
        matchedRules.push({ rule, score: score + 10 });
      }
    } else if (firmwareId && !mapId) {
      // Only firmware selected
      if (rule.firmwareId === firmwareId && !rule.mapId) {
        matchedRules.push({ rule, score: score + 15 });
      }
    } else if (!firmwareId && mapId) {
      // Only map selected
      if (rule.mapId === mapId && !rule.firmwareId) {
        matchedRules.push({ rule, score: score + 15 });
      }
    }
  }

  // Sort matched rules by descending specificity score
  matchedRules.sort((a, b) => b.score - a.score);

  const rulesList = matchedRules.map((m) => m.rule);
  const primaryRule = rulesList.length > 0 ? rulesList[0] : null;

  let status: Status = primaryRule ? primaryRule.status : "unknown";
  let confidence: Confidence = primaryRule ? primaryRule.confidence : "unverified";

  // Check conflicting rules
  const conflictingRules = rulesList.filter(
    (r) => r.status !== status && r !== primaryRule
  );

  const unknownReasons: string[] = [];
  if (!unitKnown && partNumber) {
    unknownReasons.push(
      `Part number "${partNumber}" is not yet cataloged in our verified unit database. General RNS 510 rules are applied.`
    );
  }
  if (!primaryRule && (firmwareId || mapId)) {
    unknownReasons.push(
      "No verified test rules exist for this specific combination of unit, firmware, and map."
    );
    status = "unknown";
    confidence = "unverified";
  }

  // 4. Collect contextual warnings
  const warnings: Warning[] = [];

  for (const w of db.warnings) {
    if (w.appliesTo === "all") {
      warnings.push(w);
    } else if (w.appliesTo === "wipesMaps" && selectedFirmware?.wipesMaps) {
      warnings.push(w);
    } else if (w.appliesTo === "map" && selectedMap) {
      warnings.push(w);
    }
  }

  return {
    unit,
    unitKnown,
    suffixCandidates,
    selectedFirmware,
    selectedMap,
    status,
    confidence,
    primaryRule,
    matchedRules: rulesList,
    conflictingRules,
    warnings,
    unknownReasons,
  };
}
