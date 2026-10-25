import { ModuleInfo, Fault, FreezeFrame } from "./types";

/**
 * Parses a single "Address XX" block from a VCDS Auto-Scan log.
 * Handles both classic and UDS module blocks defensively without throwing.
 */
export function parseModule(blockText: string): ModuleInfo {
  const normalized = blockText.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");

  const moduleInfo: ModuleInfo = {
    address: "",
    name: "Unknown Module",
    subsystems: [],
    faults: [],
  };

  if (!lines.length || !normalized) {
    return moduleInfo;
  }

  // 1. Identify Address line
  // Example: "Address 37: Navigation (J0506)       Labels:. 1T0-035-680.clb"
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const addrMatch = line.match(/^Address\s+([0-9A-Fa-f]{2}):\s*([^(\n\r]+?)(?:\s+\(([^)]+)\))?(?:\s+Labels:.*)?$/i);
    if (addrMatch) {
      headerIndex = i;
      moduleInfo.address = addrMatch[1].toUpperCase();
      moduleInfo.name = addrMatch[2].trim();
      if (addrMatch[3]) {
        moduleInfo.controllerId = addrMatch[3].trim();
      }
      break;
    }
  }

  // If no "Address XX" line found, check if it starts with "Address XX" anywhere in the first few lines
  if (!moduleInfo.address) {
    const fallbackMatch = normalized.match(/Address\s+([0-9A-Fa-f]{2}):?\s*([^(\n\r]+)/i);
    if (fallbackMatch) {
      moduleInfo.address = fallbackMatch[1].toUpperCase();
      moduleInfo.name = fallbackMatch[2].trim();
    }
  }

  // 2. Parse fields and fault section
  let currentSubsystem: { partNo: string; component?: string; coding?: string } | null = null;
  const faultLines: string[] = [];
  let inFaultSection = false;

  for (let i = headerIndex >= 0 ? headerIndex + 1 : 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for end of block (dashes or next Address)
    if (line.startsWith("-----") || line.startsWith("End---")) {
      break;
    }

    // Check for fault section starter
    if (/^\d+\s+Faults?\s+Found:/i.test(line)) {
      inFaultSection = true;
      continue;
    }

    if (/^No fault code found\./i.test(line)) {
      inFaultSection = false;
      continue;
    }

    if (inFaultSection) {
      faultLines.push(rawLine);
      continue;
    }

    // Parse subsystem blocks
    // Example: "Subsystem 1 - Part No: 1K1 955 119 E  Labels: 1KX-955-119.CLB"
    const subMatch = line.match(/^Subsystem\s+\d+\s*-\s*Part No(?: SW)?:\s*([^\s]+(?:\s+[^\s]+)*?)(?:\s+Labels:.*)?$/i);
    if (subMatch) {
      if (currentSubsystem) {
        moduleInfo.subsystems.push(currentSubsystem);
      }
      currentSubsystem = { partNo: subMatch[1].trim() };
      continue;
    }

    if (currentSubsystem) {
      const subCompMatch = line.match(/^Component:\s*(.+)$/i);
      if (subCompMatch) {
        currentSubsystem.component = subCompMatch[1].trim();
        continue;
      }
      const subCodingMatch = line.match(/^Coding:\s*([0-9A-Fa-f]+)/i);
      if (subCodingMatch) {
        currentSubsystem.coding = subCodingMatch[1].trim();
        continue;
      }
    }

    // Parse main module fields
    // Part No SW / HW or Part No
    const partSwHwMatch = line.match(/Part No SW:\s*(.+?)\s+HW:\s*(.+)$/i);
    if (partSwHwMatch) {
      moduleInfo.partNoSw = partSwHwMatch[1].trim();
      moduleInfo.partNoHw = partSwHwMatch[2].trim();
      continue;
    }

    const partSingleMatch = line.match(/^Part No:\s*(.+)$/i);
    if (partSingleMatch) {
      const val = partSingleMatch[1].trim();
      moduleInfo.partNoSw = val;
      moduleInfo.partNoHw = val;
      continue;
    }

    // Component
    const compMatch = line.match(/^Component:\s*(.+)$/i);
    if (compMatch) {
      moduleInfo.component = compMatch[1].trim();
      continue;
    }

    // Revision and Serial number
    const revSerialMatch = line.match(/^Revision:\s*(.+?)\s+Serial number:\s*(.+)$/i);
    if (revSerialMatch) {
      moduleInfo.revision = revSerialMatch[1].trim();
      moduleInfo.serial = revSerialMatch[2].trim();
      continue;
    }

    const revMatch = line.match(/^Revision:\s*(.+)$/i);
    if (revMatch) {
      moduleInfo.revision = revMatch[1].trim();
      continue;
    }

    const serialMatch = line.match(/^Serial number:\s*(.+)$/i);
    if (serialMatch) {
      moduleInfo.serial = serialMatch[1].trim();
      continue;
    }

    // Coding
    const codingMatch = line.match(/^Coding:\s*([0-9A-Fa-f]+)/i);
    if (codingMatch) {
      moduleInfo.coding = codingMatch[1].trim();
      continue;
    }

    // Shop #
    const shopMatch = line.match(/^Shop #:\s*(.+)$/i);
    if (shopMatch) {
      moduleInfo.shopNo = shopMatch[1].trim();
      continue;
    }

    // VCID
    const vcidMatch = line.match(/^VCID:\s*([0-9A-Za-z\-]+)/i);
    if (vcidMatch) {
      moduleInfo.vcid = vcidMatch[1].trim();
      continue;
    }
  }

  if (currentSubsystem) {
    moduleInfo.subsystems.push(currentSubsystem);
  }

  // 3. Parse faults if any
  if (faultLines.length > 0) {
    moduleInfo.faults = parseFaults(faultLines);
  }

  return moduleInfo;
}

/**
 * Splits raw fault lines into distinct Fault objects.
 */
function parseFaults(lines: string[]): Fault[] {
  const faults: Fault[] = [];

  // Group lines by fault code header
  // Classic fault code header: "01520 - Rain and Light Recognition Sensor (G397)"
  // UDS fault code header: "9481988 - Air Quality Sensor"
  // Note: sub-status lines look like "008 - Implausible Signal" (3 digits)
  // A fault code header is 4 to 8 digits
  const faultChunks: string[][] = [];
  let currentChunk: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check if line starts a new fault code: e.g. 5 digits or 7 digits code + " - "
    // (Ensure it's not a 3-digit sub-status)
    const isFaultHeader = /^\d{4,8}\s*-\s*[A-Za-z]/.test(trimmed);

    if (isFaultHeader) {
      if (currentChunk.length > 0) {
        faultChunks.push(currentChunk);
      }
      currentChunk = [rawLine];
    } else {
      if (currentChunk.length > 0) {
        currentChunk.push(rawLine);
      }
    }
  }

  if (currentChunk.length > 0) {
    faultChunks.push(currentChunk);
  }

  for (const chunk of faultChunks) {
    const fault = parseSingleFault(chunk);
    if (fault) {
      faults.push(fault);
    }
  }

  return faults;
}

/**
 * Parses a single fault chunk into a Fault object.
 */
function parseSingleFault(lines: string[]): Fault | null {
  if (!lines.length) return null;

  const headerLine = lines[0].trim();
  const headerMatch = headerLine.match(/^(\d{4,8})\s*-\s*(.+)$/);
  if (!headerMatch) return null;

  const code = headerMatch[1].trim();
  const description = headerMatch[2].trim();

  const fault: Fault = {
    code,
    description,
    subStatus: [],
    freezeFrames: [],
  };

  let currentFreezeFrame: FreezeFrame | null = null;
  let inFreezeFrame = false;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Check for Freeze Frame start
    if (/^Freeze Frame:/i.test(line)) {
      if (currentFreezeFrame) {
        fault.freezeFrames.push(currentFreezeFrame);
      }
      currentFreezeFrame = { raw: [] };
      inFreezeFrame = true;
      continue;
    }

    if (inFreezeFrame && currentFreezeFrame) {
      currentFreezeFrame.raw.push(rawLine);

      // Fault Status
      const statusMatch = line.match(/^Fault Status:\s*([0-9A-Fa-f]+)/i);
      if (statusMatch) {
        currentFreezeFrame.faultStatus = statusMatch[1].trim();
        continue;
      }

      // Priority
      const prioMatch = line.match(/^Fault Priority:\s*(\d+)/i);
      if (prioMatch) {
        currentFreezeFrame.priority = parseInt(prioMatch[1], 10);
        continue;
      }

      // Frequency
      const freqMatch = line.match(/^Fault Frequency:\s*(\d+)/i);
      if (freqMatch) {
        currentFreezeFrame.frequency = parseInt(freqMatch[1], 10);
        continue;
      }

      // Reset counter
      const rstMatch = line.match(/^Reset counter:\s*(\d+)/i);
      if (rstMatch) {
        currentFreezeFrame.resetCounter = parseInt(rstMatch[1], 10);
        continue;
      }

      // Mileage
      const mileageMatch = line.match(/^Mileage:\s*(\d+)\s*km/i);
      if (mileageMatch) {
        currentFreezeFrame.mileageKm = parseInt(mileageMatch[1], 10);
        continue;
      }

      // Date: YYYY.MM.DD
      const dateMatch = line.match(/^Date:\s*(\d{4}\.\d{2}\.\d{2})/i);
      if (dateMatch) {
        currentFreezeFrame.date = dateMatch[1].trim();
        continue;
      }

      // Time: HH:MM:SS
      const timeMatch = line.match(/^Time:\s*(\d{2}:\d{2}:\d{2})/i);
      if (timeMatch) {
        currentFreezeFrame.time = timeMatch[1].trim();
        continue;
      }

      // Voltage: 13.80 V
      const voltMatch = line.match(/Voltage:\s*([\d.]+)\s*V/i);
      if (voltMatch) {
        const v = parseFloat(voltMatch[1]);
        currentFreezeFrame.voltage = v;
        if (fault.freezeFrames.length > 0 && fault.freezeFrames[0].voltage === undefined) {
          fault.freezeFrames[0].voltage = v;
        }
        continue;
      }

      continue;
    }

    // UDS DTC line: e.g. "B10AF 04 [009] - Internal System Fault"
    const udsMatch = line.match(/^([A-Z0-9]{4,6})\s+([0-9A-Fa-f]{2}(?:\s*\[\d+\])?)\s*-\s*(.+)$/);
    if (udsMatch) {
      fault.dtc = udsMatch[1].trim();
      fault.subStatus.push({
        code: udsMatch[2].trim(),
        text: udsMatch[3].trim(),
      });
      continue;
    }

    // Classic sub-status line: e.g. "008 - Implausible Signal - Intermittent" or "000 - -"
    const classicSubMatch = line.match(/^([0-9A-Za-z]{3})\s*-\s*(.+)$/);
    if (classicSubMatch) {
      fault.subStatus.push({
        code: classicSubMatch[1].trim(),
        text: classicSubMatch[2].trim(),
      });
      continue;
    }

    // Status text line: e.g. "Confirmed - Tested Since Memory Clear"
    if (!fault.statusText && /Confirmed|Tested|MIL ON|Intermittent/i.test(line)) {
      fault.statusText = line;
      continue;
    }
  }

  if (currentFreezeFrame) {
    fault.freezeFrames.push(currentFreezeFrame);
  }

  return fault;
}
