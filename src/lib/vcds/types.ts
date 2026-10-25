export type LogMeta = {
  scanDate: string | null; // ISO local datetime from first line (e.g. "2026-10-23T10:09:14")
  vcdsVersion: string | null;
  vin: string | null;
  plate: string | null;
  mileageKm: number | null;
  chassis: string | null;
  elapsed: string | null;
};

export type FreezeFrame = {
  faultStatus?: string;
  priority?: number;
  frequency?: number;
  resetCounter?: number;
  mileageKm?: number;
  date?: string; // date as in log: YYYY.MM.DD
  time?: string; // time as in log: HH:MM:SS
  voltage?: number;
  raw: string[];
};

export type Fault = {
  code: string; // "01520" or "9481988"
  description: string;
  dtc?: string; // UDS style, e.g. "B10AF"
  subStatus: { code: string; text: string }[];
  statusText?: string;
  freezeFrames: FreezeFrame[];
};

export type ModuleInfo = {
  address: string; // "37"
  name: string;
  controllerId?: string;
  statusText?: string;
  statusCode?: string; // from the summary list
  partNoSw?: string;
  partNoHw?: string;
  component?: string;
  revision?: string;
  serial?: string;
  coding?: string;
  shopNo?: string;
  vcid?: string;
  subsystems: { partNo: string; component?: string; coding?: string }[];
  faults: Fault[];
  duplicateOf?: string; // address of the first copy
};

export type ParsedLog = {
  meta: LogMeta;
  modules: ModuleInfo[];
  warnings: string[];
};
