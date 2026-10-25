import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseLog } from "@/lib/vcds/parseLog";
import { parseModule } from "@/lib/vcds/parseModule";
import { anonymizeVin, anonymizePlate, anonymizeLog } from "@/lib/vcds/anonymize";

describe("VCDS Parser", () => {
  const samplePath = path.resolve(__dirname, "./fixtures/sample-golf.txt");
  const sampleLog = fs.readFileSync(samplePath, "utf-8");

  it("parses metadata correctly from sample log", () => {
    const parsed = parseLog(sampleLog);

    expect(parsed.meta.scanDate).toBe("2026-10-23T10:09:14");
    expect(parsed.meta.mileageKm).toBe(283050);
    expect(parsed.meta.chassis).toBe("1K-VW36 (1K0)");
    expect(parsed.meta.vcdsVersion).toBe("22.3.1.4");
    expect(parsed.meta.vin).toBe("WVWZZZ1KZ*W******");
    expect(parsed.meta.plate).toBe("XX00XXX");
    expect(parsed.meta.elapsed).toBe("02:50");
  });

  it("parses 20 module blocks and handles addresses 04 and 46 having status but no block", () => {
    const parsed = parseLog(sampleLog);

    // 20 blocks exist in the sample
    expect(parsed.modules.length).toBe(20);

    // Addresses 04 and 46 should not be present in modules, but parser must not throw
    const addresses = parsed.modules.map((m) => m.address);
    expect(addresses).not.toContain("04");
    expect(addresses).not.toContain("46");

    // Modules that are present have their statusText populated from the summary
    const engine = parsed.modules.find((m) => m.address === "01");
    expect(engine?.statusText).toBe("OK");
    expect(engine?.statusCode).toBe("0000");

    const nav = parsed.modules.find((m) => m.address === "37");
    expect(nav?.statusText).toBe("Malfunction");
    expect(nav?.statusCode).toBe("1010");
  });

  it("identifies modules with faults and duplicate module 56", () => {
    const parsed = parseLog(sampleLog);

    const modulesWithFaults = parsed.modules.filter((m) => m.faults.length > 0);
    const faultedAddresses = modulesWithFaults.map((m) => m.address);

    expect(faultedAddresses).toEqual(["08", "09", "19", "37", "42", "56"]);

    // Raw fault entries total 13
    const totalRawFaults = parsed.modules.reduce((acc, m) => acc + m.faults.length, 0);
    expect(totalRawFaults).toBe(13);

    // Module 56 is marked duplicateOf: "37"
    const radio = parsed.modules.find((m) => m.address === "56");
    expect(radio?.duplicateOf).toBe("37");

    // Unique faults after ignoring duplicate module 56: 11 faults
    const uniqueFaults = parsed.modules
      .filter((m) => !m.duplicateOf)
      .reduce((acc, m) => acc + m.faults.length, 0);
    expect(uniqueFaults).toBe(11);
  });

  it("parses module 09 with 3 faults, including two 01520 with distinct sub-statuses", () => {
    const parsed = parseLog(sampleLog);
    const mod09 = parsed.modules.find((m) => m.address === "09");
    expect(mod09).toBeDefined();
    expect(mod09!.faults.length).toBe(3);

    const f1 = mod09!.faults[0];
    expect(f1.code).toBe("01520");
    expect(f1.subStatus[0].code).toBe("008");
    expect(f1.subStatus[0].text).toContain("Implausible Signal");
    expect(f1.freezeFrames.length).toBe(2);
    expect(f1.freezeFrames[0].voltage).toBe(13.8);

    const f2 = mod09!.faults[1];
    expect(f2.code).toBe("01520");
    expect(f2.subStatus[0].code).toBe("004");
    expect(f2.subStatus[0].text).toContain("No Signal/Communication");

    const f3 = mod09!.faults[2];
    expect(f3.code).toBe("01134");
    expect(f3.subStatus[0].code).toBe("000");

    // Subsystems
    expect(mod09!.subsystems.length).toBe(2);
    expect(mod09!.subsystems[0].partNo).toContain("1K1 955 119 E");
  });

  it("parses module 08 UDS style fault with DTC B10AF", () => {
    const parsed = parseLog(sampleLog);
    const mod08 = parsed.modules.find((m) => m.address === "08");
    expect(mod08).toBeDefined();
    expect(mod08!.faults.length).toBe(1);

    const fault = mod08!.faults[0];
    expect(fault.code).toBe("9481988");
    expect(fault.dtc).toBe("B10AF");
    expect(fault.description).toBe("Air Quality Sensor");
    expect(fault.subStatus[0].code).toBe("04 [009]");
    expect(fault.subStatus[0].text).toBe("Internal System Fault");
    expect(fault.statusText).toContain("Confirmed");

    expect(fault.freezeFrames[0].date).toBe("2026.10.23");
    expect(fault.freezeFrames[0].time).toBe("19:34:25");
    expect(fault.freezeFrames[0].mileageKm).toBe(280368);
  });

  it("parses a single pasted module block using parseModule", () => {
    const singleBlock = `
Address 37: Navigation (J0506)       Labels:. 1T0-035-680.clb
   Part No SW: 1T0 035 680 C    HW: 1T0 035 680 C
   Component: RNS-MID       H50 2840
   Revision: AB001001    Serial number: VWZ6Z7L9026007
   Coding: 04000402040000A000
   Shop #: WSC 05314 000 00000
   VCID: 2E53BBBF79174CFF6D-807A

No fault code found.
`;
    const mod = parseModule(singleBlock);
    expect(mod.address).toBe("37");
    expect(mod.name).toBe("Navigation");
    expect(mod.controllerId).toBe("J0506");
    expect(mod.partNoSw).toBe("1T0 035 680 C");
    expect(mod.partNoHw).toBe("1T0 035 680 C");
    expect(mod.component).toBe("RNS-MID       H50 2840");
    expect(mod.serial).toBe("VWZ6Z7L9026007");
    expect(mod.coding).toBe("04000402040000A000");
    expect(mod.shopNo).toBe("WSC 05314 000 00000");
    expect(mod.vcid).toBe("2E53BBBF79174CFF6D-807A");
    expect(mod.faults.length).toBe(0);
  });

  it("parses a minimal hand-written log without faults", () => {
    const minimalLog = `
Thursday,01,January,2026,12:00:00:00000
VCDS Version: 21.9.0
VIN: WVWZZZ1KZ1W111111   License Plate: CJ99ABC
Mileage: 120000km-74564mi

01-Engine -- Status: OK 0000

-------------------------------------------------------------------------------
Address 01: Engine
   Part No SW: 03L 906 022 A
   Component: 2.0l R4 CR
No fault code found.
`;
    const parsed = parseLog(minimalLog);
    expect(parsed.meta.scanDate).toBe("2026-01-01T12:00:00");
    expect(parsed.meta.mileageKm).toBe(120000);
    expect(parsed.modules.length).toBe(1);
    expect(parsed.modules[0].address).toBe("01");
    expect(parsed.modules[0].statusText).toBe("OK");
    expect(parsed.modules[0].faults.length).toBe(0);
    expect(parsed.warnings.length).toBe(0);
  });

  it("handles garbage input gracefully with warnings and no crash", () => {
    const garbage = "This is not a VCDS file at all. Just random text here.\nAnother line.";
    const parsed = parseLog(garbage);

    expect(parsed.modules.length).toBe(0);
    expect(parsed.warnings.length).toBeGreaterThan(0);
    expect(parsed.warnings[0]).toContain("Unrecognized log format");
  });

  it("anonymizes VIN and plate in model and strings", () => {
    expect(anonymizeVin("WVWZZZ1KZ9W123456")).toBe("WVWZZZ1KZ*W******");
    expect(anonymizePlate("B 123 ABC")).toBe("XX00XXX");

    const parsed = parseLog(sampleLog);
    const anon = anonymizeLog(parsed);
    expect(anon.meta.vin).toBe("WVWZZZ1KZ*W******");
    expect(anon.meta.plate).toBe("XX00XXX");
  });
});
