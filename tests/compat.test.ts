import { describe, it, expect } from "vitest";
import { normalizePartNumber, findUnitByPartNumber } from "@/lib/compat/normalize";
import { evaluateCompatibility } from "@/lib/compat/evaluate";
import { parseModule } from "@/lib/vcds/parseModule";
import { RuleSchema } from "@/lib/compat/schema";
import defaultDatabase from "../data/rns510.json";

describe("RNS 510 Compatibility Logic", () => {
  it("normalizes part number variants correctly", () => {
    expect(normalizePartNumber("1t0-035-680 c")).toBe("1T0035680C");
    expect(normalizePartNumber(" 1T0 035 680 C ")).toBe("1T0035680C");
    expect(normalizePartNumber("1T0.035.680.C")).toBe("1T0035680C");
    expect(normalizePartNumber("1t0035680b")).toBe("1T0035680B");
  });

  it("matches units with and without suffix letter", () => {
    const units = defaultDatabase.units;

    // Exact match with suffix letter
    const exactLookup = findUnitByPartNumber("1T0 035 680 C", units);
    expect(exactLookup.exactMatch).toBeDefined();
    expect(exactLookup.exactMatch?.id).toBe("rns510-1t0-035-680-c");
    expect(exactLookup.suffixCandidates.length).toBe(0);

    // Prefix match without suffix letter
    const prefixLookup = findUnitByPartNumber("1T0 035 680", units);
    expect(prefixLookup.exactMatch).toBeNull();
    expect(prefixLookup.suffixCandidates.length).toBe(2);
    const candidateParts = prefixLookup.suffixCandidates.map((c) => c.partNumber);
    expect(candidateParts).toContain("1T0 035 680 B");
    expect(candidateParts).toContain("1T0 035 680 C");
  });

  it("evaluates 5238 (Josi modded) on 1T0 035 680 C as works / community-reported with wipes-maps warning", () => {
    const verdict = evaluateCompatibility({
      partNumber: "1T0 035 680 C",
      firmwareId: "fw-5238-josi",
    });

    expect(verdict.unitKnown).toBe(true);
    expect(verdict.unit?.id).toBe("rns510-1t0-035-680-c");
    expect(verdict.status).toBe("works");
    expect(verdict.confidence).toBe("community-reported");
    expect(verdict.primaryRule).toBeDefined();

    // Contains the battery charger warning and the wipes-maps warning
    const warningIds = verdict.warnings.map((w) => w.id);
    expect(warningIds).toContain("warning-battery-charger");
    expect(warningIds).toContain("warning-map-wipe");
  });

  it("evaluates East Europe V17 on 1T0 035 680 C as unknown", () => {
    const verdict = evaluateCompatibility({
      partNumber: "1T0 035 680 C",
      mapId: "map-east-europe-v17",
    });

    expect(verdict.status).toBe("unknown");
    expect(verdict.confidence).toBe("unverified");
    expect(verdict.primaryRule?.note).toContain("No verified test report for East Europe V17");
  });

  it("pre-fills part number 1T0 035 680 C and hw label H50 2840 from pasted Address 37 block", () => {
    const sampleBlock = `
Address 37: Navigation (J0506)       Labels:. 1T0-035-680.clb
   Part No SW: 1T0 035 680 C    HW: 1T0 035 680 C
   Component: RNS-MID       H50 2840
   Revision: AB001001    Serial number: VWZ6Z7L9026007
   Coding: 04000402040000A000
   Shop #: WSC 05314 000 00000
   VCID: 2E53BBBF79174CFF6D-807A
No fault code found.
`;
    const mod = parseModule(sampleBlock);
    expect(mod.partNoSw).toBe("1T0 035 680 C");
    expect(mod.component).toBe("RNS-MID       H50 2840");

    // Extract hardware label from Component line
    const hwMatch = mod.component?.match(/H\d+\s+\d+/);
    expect(hwMatch?.[0]).toBe("H50 2840");
  });

  it("schema validation rejects a rule without sources", () => {
    const invalidRule = {
      unitId: "*",
      firmwareId: "fw-5238-josi",
      status: "works",
      confidence: "community-reported",
      note: "Test rule without sources",
      sources: [], // Empty sources
    };

    const result = RuleSchema.safeParse(invalidRule);
    expect(result.success).toBe(false);
  });
});
