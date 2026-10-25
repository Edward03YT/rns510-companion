import { Unit } from "./schema";

/**
 * Normalizes an RNS 510 part number by uppercasing and removing spaces, dashes, and periods.
 * Example: "1t0-035-680 c" -> "1T0035680C"
 */
export function normalizePartNumber(partNo: string): string {
  if (!partNo) return "";
  return partNo
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export type UnitLookupResult = {
  exactMatch: Unit | null;
  suffixCandidates: Unit[];
};

/**
 * Looks up an RNS 510 unit in the database using normalized part numbers.
 * If the user enters a base part number without a suffix letter (e.g. "1T0 035 680"),
 * returns all matching suffix candidates for the user to choose.
 */
export function findUnitByPartNumber(
  inputPartNumber: string,
  units: Unit[]
): UnitLookupResult {
  const normalizedInput = normalizePartNumber(inputPartNumber);
  if (!normalizedInput) {
    return { exactMatch: null, suffixCandidates: [] };
  }

  // 1. Try exact match
  const exact = units.find(
    (u) => normalizePartNumber(u.partNumber) === normalizedInput
  );
  if (exact) {
    return { exactMatch: exact, suffixCandidates: [] };
  }

  // 2. Try prefix match (user omitted the revision suffix letter, e.g. "1T0035680")
  const candidates = units.filter((u) => {
    const normUnit = normalizePartNumber(u.partNumber);
    return normUnit.startsWith(normalizedInput) && normUnit !== normalizedInput;
  });

  return { exactMatch: null, suffixCandidates: candidates };
}
