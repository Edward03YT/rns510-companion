import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseLog } from "@/lib/vcds/parseLog";
import { analyzeLog } from "@/lib/vcds/analyze";

describe("VCDS Analyzer Engine", () => {
  const samplePath = path.resolve(__dirname, "./fixtures/sample-golf.txt");
  const sampleLog = fs.readFileSync(samplePath, "utf-8");
  const parsed = parseLog(sampleLog);

  it("detects event cluster containing 01300, 01304, 03272 and 01523", () => {
    const analysis = analyzeLog(parsed);

    expect(analysis.clusters.length).toBeGreaterThanOrEqual(1);

    const mainCluster = analysis.clusters.find((c) =>
      c.faults.some((f) => f.code === "01300")
    );

    expect(mainCluster).toBeDefined();
    expect(mainCluster!.mileageKm).toBe(282892);
    expect(mainCluster!.date).toBe("2021.03.15");

    const clusterFaultCodes = mainCluster!.faults.map((f) => f.code);
    expect(clusterFaultCodes).toContain("01300");
    expect(clusterFaultCodes).toContain("01304");
    expect(clusterFaultCodes).toContain("03272");
    expect(clusterFaultCodes).toContain("01523");

    // Duplicate module 56 faults should NOT be duplicated in cluster
    const occurrencesOf01523 = clusterFaultCodes.filter((c) => c === "01523").length;
    expect(occurrencesOf01523).toBe(1);
  });

  it("flags HVAC fault as inconsistent", () => {
    const analysis = analyzeLog(parsed);

    const hvacFault = analysis.analyzedFaults.find(
      (af) => af.moduleAddress === "08" && af.fault.code === "9481988"
    );

    expect(hvacFault).toBeDefined();
    expect(hvacFault!.timestampFlags).toContain("inconsistent");
  });

  it("flags faults dated 2021.03.15 with default-date heuristic", () => {
    const analysis = analyzeLog(parsed);

    // Faults on 2021.03.15 have 4 distinct mileages: 208431, 280652, 282800, 282892
    const march15Faults = analysis.analyzedFaults.filter(
      (af) => af.fault.freezeFrames[0]?.date === "2021.03.15"
    );

    expect(march15Faults.length).toBeGreaterThan(0);
    for (const af of march15Faults) {
      expect(af.timestampFlags).toContain("default-date");
    }
  });

  it("flags stale faults more than 180 days before scan date", () => {
    const analysis = analyzeLog(parsed);

    // 2021.03.15 is years before 2026.10.23, so it must also be flagged stale
    const rainSensorFault = analysis.analyzedFaults.find(
      (af) => af.moduleAddress === "09" && af.fault.code === "01520"
    );

    expect(rainSensorFault).toBeDefined();
    expect(rainSensorFault!.timestampFlags).toContain("stale");
  });

  it("correctly applies fault rules and calculates summary metrics", () => {
    const analysis = analyzeLog(parsed);

    // Summary counts
    expect(analysis.summary.totalModules).toBe(20);
    expect(analysis.summary.modulesWithFaults).toBe(6);
    expect(analysis.summary.modulesOk).toBe(14);
    expect(analysis.summary.totalRawFaults).toBe(13);
    expect(analysis.summary.uniqueFaults).toBe(11);

    // Severity breakdown (unique faults)
    expect(analysis.summary.countsBySeverity.check).toBe(0);
    expect(analysis.summary.countsBySeverity.low).toBe(5); // 01520 (x2), 00109, 00131, B10AF
    expect(analysis.summary.countsBySeverity.info).toBe(6); // 01134, 01300, 01304, 03272, 01523, 00446
    expect(analysis.summary.countsBySeverity.unknown).toBe(0);

    // Worth checking vs probably irrelevant
    expect(analysis.summary.worthChecking.length).toBe(5);
    expect(analysis.summary.probablyIrrelevant.length).toBe(6);

    // Informative note exists in both languages
    expect(analysis.summary.note.en).toContain("Malfunction");
    expect(analysis.summary.note.ro).toContain("Malfunction");
  });

  it("handles unknown fault codes by setting severity unknown and fallback explanation", () => {
    const customLog = {
      meta: {
        scanDate: "2026-10-23T10:00:00",
        vcdsVersion: "22.3",
        vin: null,
        plate: null,
        mileageKm: 100000,
        chassis: null,
        elapsed: null,
      },
      modules: [
        {
          address: "01",
          name: "Engine",
          subsystems: [],
          faults: [
            {
              code: "99999",
              description: "Mysterious Sensor Broken",
              subStatus: [],
              freezeFrames: [],
            },
          ],
        },
      ],
      warnings: [],
    };

    const analysis = analyzeLog(customLog);
    expect(analysis.analyzedFaults[0].severity).toBe("unknown");
    expect(analysis.analyzedFaults[0].explanation?.en).toBe("No explanation in database yet");
    expect(analysis.analyzedFaults[0].explanation?.ro).toBe("Nicio explicație în baza de date momentan");
  });
});
