import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { ro } from "@/i18n/ro";

describe("i18n dictionaries", () => {
  it("provides matching keys between EN and RO dictionaries", () => {
    expect(en.appName).toBe("RNS 510 Companion");
    expect(ro.appName).toBe("RNS 510 Companion");

    expect(en.privacyBanner).toContain("Nothing is uploaded");
    expect(ro.privacyBanner).toContain("Nimic nu este încărcat pe server");

    expect(Object.keys(en.nav)).toEqual(Object.keys(ro.nav));
    expect(Object.keys(en.disclaimer)).toEqual(Object.keys(ro.disclaimer));
  });

  it("includes required disclaimers", () => {
    expect(en.disclaimer.informational).toBeDefined();
    expect(en.disclaimer.risk).toBeDefined();
    expect(en.disclaimer.nonAffiliation).toBeDefined();
    expect(en.disclaimer.noFiles).toBeDefined();
  });
});
