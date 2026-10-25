import { z } from "zod";

export const ConfidenceSchema = z.enum([
  "tested-by-maintainer",
  "community-reported",
  "unverified",
]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const StatusSchema = z.enum([
  "works",
  "unstable",
  "incompatible",
  "unknown",
]);
export type Status = z.infer<typeof StatusSchema>;

export const SourceRefSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const UnitSchema = z.object({
  id: z.string().min(1),
  partNumber: z.string().min(1),
  names: z.array(z.string().min(1)),
  hwLabels: z.array(z.string()),
  notes: z.string().optional(),
});
export type Unit = z.infer<typeof UnitSchema>;

export const FirmwareSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  base: z.string().min(1),
  variant: z.enum(["original", "modded"]),
  wipesMaps: z.boolean(),
  features: z.array(z.string()).optional(),
  caveats: z.array(z.string()).optional(),
});
export type Firmware = z.infer<typeof FirmwareSchema>;

export const MapSetSchema = z.object({
  id: z.string().min(1),
  region: z.string().min(1),
  version: z.string().min(1),
  notes: z.string().optional(),
});
export type MapSet = z.infer<typeof MapSetSchema>;

export const RuleSchema = z.object({
  unitId: z.string().min(1), // "*" or unit id
  firmwareId: z.string().optional(),
  mapId: z.string().optional(),
  status: StatusSchema,
  confidence: ConfidenceSchema,
  note: z.string().min(1),
  sources: z.array(SourceRefSchema).min(1, "Rule must have at least one source"),
});
export type Rule = z.infer<typeof RuleSchema>;

export const WarningSchema = z.object({
  id: z.string().min(1),
  text: z.object({
    ro: z.string().min(1),
    en: z.string().min(1),
  }),
  appliesTo: z.string().min(1), // "all" or specific condition
  confidence: ConfidenceSchema.optional(),
  sources: z.array(SourceRefSchema),
});
export type Warning = z.infer<typeof WarningSchema>;

export const DatapointSchema = z.object({
  partNumber: z.string().min(1),
  hw: z.string().optional(),
  firmware: z.string().min(1),
  map: z.string().optional(),
  result: z.string().min(1),
  confidence: ConfidenceSchema,
  reportedBy: z.string().optional(),
  date: z.string().min(1),
});
export type Datapoint = z.infer<typeof DatapointSchema>;

export const Rns510DatabaseSchema = z.object({
  units: z.array(UnitSchema),
  firmwares: z.array(FirmwareSchema),
  maps: z.array(MapSetSchema),
  rules: z.array(RuleSchema),
  warnings: z.array(WarningSchema),
  datapoints: z.array(DatapointSchema),
});
export type Rns510Database = z.infer<typeof Rns510DatabaseSchema>;
