import fs from "node:fs";
import path from "node:path";
import { Rns510DatabaseSchema } from "../src/lib/compat/schema";

function validateData() {
  console.log("🔍 Validating RNS 510 and Fault Rules datasets...");

  // 1. Validate data/rns510.json
  const rnsPath = path.resolve(__dirname, "../data/rns510.json");
  if (!fs.existsSync(rnsPath)) {
    console.error("❌ Missing data/rns510.json file!");
    process.exit(1);
  }

  const rawRns = JSON.parse(fs.readFileSync(rnsPath, "utf-8"));
  const parseResult = Rns510DatabaseSchema.safeParse(rawRns);

  if (!parseResult.success) {
    console.error("❌ data/rns510.json failed Zod schema validation:");
    console.error(parseResult.error.format());
    process.exit(1);
  }

  const rnsData = parseResult.data;
  const unitIds = new Set(rnsData.units.map((u) => u.id));
  const firmwareIds = new Set(rnsData.firmwares.map((f) => f.id));
  const mapIds = new Set(rnsData.maps.map((m) => m.id));

  // Check foreign key references in rules
  for (let i = 0; i < rnsData.rules.length; i++) {
    const rule = rnsData.rules[i];

    if (rule.unitId !== "*" && !unitIds.has(rule.unitId)) {
      console.error(`❌ Rule #${i} references non-existent unitId: "${rule.unitId}"`);
      process.exit(1);
    }

    if (rule.firmwareId && !firmwareIds.has(rule.firmwareId)) {
      console.error(`❌ Rule #${i} references non-existent firmwareId: "${rule.firmwareId}"`);
      process.exit(1);
    }

    if (rule.mapId && !mapIds.has(rule.mapId)) {
      console.error(`❌ Rule #${i} references non-existent mapId: "${rule.mapId}"`);
      process.exit(1);
    }

    if (!rule.sources || rule.sources.length === 0) {
      console.error(`❌ Rule #${i} has no sources! Every rule must have at least one source.`);
      process.exit(1);
    }

    for (const source of rule.sources) {
      if (!source.url || !source.url.startsWith("http")) {
        console.error(`❌ Rule #${i} has an invalid source URL: "${source.url}"`);
        process.exit(1);
      }
    }
  }

  // 2. Validate data/fault-rules.json
  const faultRulesPath = path.resolve(__dirname, "../data/fault-rules.json");
  if (!fs.existsSync(faultRulesPath)) {
    console.error("❌ Missing data/fault-rules.json file!");
    process.exit(1);
  }

  const rawFaultRules = JSON.parse(fs.readFileSync(faultRulesPath, "utf-8"));
  if (!Array.isArray(rawFaultRules)) {
    console.error("❌ data/fault-rules.json must be an array of rules!");
    process.exit(1);
  }

  for (let i = 0; i < rawFaultRules.length; i++) {
    const r = rawFaultRules[i];
    if (!r.code || !r.severity || !r.explanation || !r.suggestion || !r.source) {
      console.error(`❌ Fault rule #${i} is missing required fields (code, severity, explanation, suggestion, source):`, r);
      process.exit(1);
    }
    if (!r.explanation.en || !r.explanation.ro || !r.suggestion.en || !r.suggestion.ro) {
      console.error(`❌ Fault rule #${i} must have both 'ro' and 'en' in explanation and suggestion.`);
      process.exit(1);
    }
  }

  console.log("✅ All dataset schemas, foreign keys, and source references verified successfully!");
  process.exit(0);
}

validateData();
