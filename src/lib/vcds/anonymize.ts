import { ParsedLog } from "./types";

/**
 * Masks a 17-character VIN according to standard automotive privacy practices.
 * Example: "WVWZZZ1KZ9W123456" -> "WVWZZZ1KZ*W******"
 */
export function anonymizeVin(vin: string | null | undefined): string {
  if (!vin) return "";
  const trimmed = vin.trim();
  if (trimmed.includes("*")) {
    return trimmed; // Already anonymized
  }

  if (trimmed.length === 17) {
    const wmiAndVds = trimmed.slice(0, 9); // First 9 characters
    const plant = trimmed.charAt(10); // Plant code
    return `${wmiAndVds}*${plant}******`;
  }

  if (trimmed.length > 8) {
    return trimmed.slice(0, 6) + "*".repeat(trimmed.length - 6);
  }

  return "******";
}

/**
 * Masks a license plate string.
 * Example: "B 123 ABC" -> "XX00XXX" or masked with asterisks.
 */
export function anonymizePlate(plate: string | null | undefined): string {
  if (!plate) return "";
  const trimmed = plate.trim();
  if (trimmed.includes("*") || trimmed.toUpperCase().includes("XX00XXX")) {
    return trimmed;
  }

  if (trimmed.length <= 4) {
    return "****";
  }

  return "XX00XXX";
}

/**
 * Creates an anonymized deep clone of a ParsedLog object.
 */
export function anonymizeLog(log: ParsedLog): ParsedLog {
  const originalVin = log.meta.vin;
  const originalPlate = log.meta.plate;

  const maskedVin = anonymizeVin(originalVin);
  const maskedPlate = anonymizePlate(originalPlate);

  const cloned: ParsedLog = JSON.parse(JSON.stringify(log));

  cloned.meta.vin = maskedVin;
  cloned.meta.plate = maskedPlate;

  // Mask occurrences in serial numbers or freeze frames if present
  if (originalVin && originalVin.length >= 6) {
    for (const mod of cloned.modules) {
      if (mod.serial && mod.serial.includes(originalVin)) {
        mod.serial = mod.serial.replace(originalVin, maskedVin);
      }
      for (const fault of mod.faults) {
        for (const ff of fault.freezeFrames) {
          ff.raw = ff.raw.map((line) => line.replace(originalVin, maskedVin));
        }
      }
    }
  }

  return cloned;
}

/**
 * Replaces unmasked VIN and plate strings within arbitrary text.
 */
export function anonymizeText(
  text: string,
  vin?: string | null,
  plate?: string | null
): string {
  let result = text;
  if (vin && vin.length > 5 && !vin.includes("*")) {
    result = result.split(vin).join(anonymizeVin(vin));
  }
  if (plate && plate.length > 2 && !plate.includes("*") && plate !== "XX00XXX") {
    result = result.split(plate).join(anonymizePlate(plate));
  }
  return result;
}
