import { ParsedLog, LogMeta, ModuleInfo } from "./types";
import { parseModule } from "./parseModule";

const MONTH_MAP: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

/**
 * Parses full VCDS Auto-Scan text into a structured ParsedLog object.
 * Extracts metadata, module status summary, individual module blocks,
 * and detects duplicate modules (e.g. Navigation 37 & Radio 56).
 */
export function parseLog(text: string): ParsedLog {
  const warnings: string[] = [];
  const normalized = (text || "").replace(/\r\n/g, "\n");

  const meta: LogMeta = {
    scanDate: null,
    vcdsVersion: null,
    vin: null,
    plate: null,
    mileageKm: null,
    chassis: null,
    elapsed: null,
  };

  if (!normalized.trim()) {
    warnings.push("Empty log content.");
    return { meta, modules: [], warnings };
  }

  const lines = normalized.split("\n");

  // Check if it looks like a VCDS scan
  const isVcds =
    /VCDS\s+--/i.test(normalized) ||
    /VCDS\s+Version:/i.test(normalized) ||
    /Address\s+[0-9A-Fa-f]{2}:/i.test(normalized) ||
    /Ross-Tech\.com/i.test(normalized);

  if (!isVcds) {
    warnings.push("Unrecognized log format. Expected a standard VCDS Auto-Scan output.");
  }

  // 1. Parse Header / Meta
  // First line date: "Friday,23,October,2026,10:09:14:00009"
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i].trim();

    // Date parsing
    if (!meta.scanDate) {
      const dateMatch = line.match(
        /^[A-Za-z]+,(\d{1,2}),([A-Za-z]+),(\d{4}),(\d{2}:\d{2}:\d{2})/
      );
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0");
        const monthStr = dateMatch[2].toLowerCase();
        const month = MONTH_MAP[monthStr] || "01";
        const year = dateMatch[3];
        const time = dateMatch[4];
        meta.scanDate = `${year}-${month}-${day}T${time}`;
        continue;
      }
    }

    // VCDS Version
    if (!meta.vcdsVersion) {
      const verMatch = line.match(/VCDS Version:\s*([^\s]+)/i);
      if (verMatch) {
        meta.vcdsVersion = verMatch[1].trim();
        continue;
      }
    }

    // VIN and License Plate
    if (!meta.vin || !meta.plate) {
      const vinMatch = line.match(/VIN:\s*([^\s]+)/i);
      if (vinMatch) {
        meta.vin = vinMatch[1].trim();
      }
      const plateMatch = line.match(/License Plate:\s*(.+)$/i);
      if (plateMatch) {
        meta.plate = plateMatch[1].trim();
      }
      if (vinMatch || plateMatch) continue;
    }

    // Mileage
    if (meta.mileageKm === null) {
      const mileageMatch = line.match(/Mileage:\s*(\d+)km(?:-(\d+)mi)?/i);
      if (mileageMatch) {
        meta.mileageKm = parseInt(mileageMatch[1], 10);
        continue;
      }
    }

    // Chassis Type
    if (!meta.chassis) {
      const chassisMatch = line.match(/Chassis Type:\s*(.+)$/i);
      if (chassisMatch) {
        meta.chassis = chassisMatch[1].trim();
        continue;
      }
    }
  }

  // Elapsed time at the end
  const elapsedMatch = normalized.match(/Elapsed Time:\s*([0-9:]+)/i);
  if (elapsedMatch) {
    meta.elapsed = elapsedMatch[1].trim();
  }

  // 2. Parse Module Status Summary list
  // Example: "08-Auto HVAC -- Status: Malfunction 0010"
  // Example: "01-Engine -- Status: OK 0000"
  const summaryStatuses = new Map<string, { statusText: string; statusCode: string }>();
  const summaryRegex = /^\s*([0-9A-Fa-f]{2})-([^-]+?)\s*--\s*Status:\s*(.+?)\s+([0-9A-Fa-f]{4})\s*$/;

  for (const rawLine of lines) {
    const match = rawLine.match(summaryRegex);
    if (match) {
      const addr = match[1].toUpperCase();
      const statusText = match[3].trim();
      const statusCode = match[4].trim();
      summaryStatuses.set(addr, { statusText, statusCode });
    }
  }

  // 3. Extract Module Blocks
  // Each module block starts with:
  // "-------------------------------------------------------------------------------"
  // followed by "Address XX:"
  // Or "Address XX:" at line start
  const moduleBlocks: string[] = [];
  const addressRegex = /Address\s+([0-9A-Fa-f]{2}):/;

  // Split content by dashed separator lines
  const rawSections = normalized.split(/\n-{3,}\n/);

  for (const section of rawSections) {
    const trimmed = section.trim();
    if (addressRegex.test(trimmed)) {
      moduleBlocks.push(trimmed);
    }
  }

  // Fallback if no dashed separators were found but "Address XX:" exists
  if (moduleBlocks.length === 0) {
    const addressIndices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^Address\s+[0-9A-Fa-f]{2}:/i.test(lines[i].trim())) {
        addressIndices.push(i);
      }
    }

    for (let i = 0; i < addressIndices.length; i++) {
      const start = addressIndices[i];
      const end = i + 1 < addressIndices.length ? addressIndices[i + 1] : lines.length;
      const blockText = lines.slice(start, end).join("\n").trim();
      if (blockText) {
        moduleBlocks.push(blockText);
      }
    }
  }

  // 4. Parse each module block
  const modules: ModuleInfo[] = [];

  for (const blockText of moduleBlocks) {
    const mod = parseModule(blockText);
    if (mod.address) {
      const summary = summaryStatuses.get(mod.address);
      if (summary) {
        mod.statusText = summary.statusText;
        mod.statusCode = summary.statusCode;
      }
      modules.push(mod);
    }
  }

  // 5. Detect Duplicates
  // The same physical unit can be listed under two addresses
  // (e.g. 37 Navigation and 56 Radio).
  // Detect by identical VCID or (part number + serial) and mark the second as duplicateOf: address
  for (let i = 0; i < modules.length; i++) {
    for (let j = 0; j < i; j++) {
      const prev = modules[j];
      const curr = modules[i];

      // Check identical VCID (if not empty or placeholder)
      const hasValidVcid =
        prev.vcid &&
        curr.vcid &&
        prev.vcid.length > 5 &&
        prev.vcid === curr.vcid;

      // Check identical Part Number and Serial
      const prevPart = prev.partNoSw || prev.partNoHw;
      const currPart = curr.partNoSw || curr.partNoHw;
      const hasValidSerial =
        prev.serial &&
        curr.serial &&
        prev.serial === curr.serial &&
        prevPart &&
        currPart &&
        prevPart === currPart;

      if (hasValidVcid || hasValidSerial) {
        curr.duplicateOf = prev.address;
        break;
      }
    }
  }

  return { meta, modules, warnings };
}
