export const en = {
  appName: "RNS 510 Companion",
  tagline: "Diagnostic log analysis & firmware compatibility helper for VW RNS 510",
  privacyBanner: "Processed locally in your browser. Nothing is uploaded.",
  nav: {
    analyzer: "VCDS Log Analyzer",
    compat: "RNS 510 Compat Checker",
    home: "Home",
  },
  home: {
    heroTitle: "RNS 510 Companion",
    heroSubtitle:
      "A fast, privacy-first companion tool for Volkswagen RNS 510 owners and retrofitter enthusiasts. Inspect your VCDS diagnostic logs and verify unit upgrade paths completely offline.",
    analyzerCard: {
      title: "VCDS Log Analyzer",
      description:
        "Paste or upload your VCDS Auto-Scan log (.txt). Get an instant summary, grouped event clusters, unreliable timestamp detection, and plain-English fault explanations.",
      action: "Launch Log Analyzer",
    },
    compatCard: {
      title: "RNS 510 Compat Checker",
      description:
        "Check firmware and map compatibility for your RNS 510 part number and hardware revision. Sourced warnings, known caveats, and community test reports.",
      action: "Check Compatibility",
    },
    privacyTitle: "100% Client-Side & Private",
    privacyText:
      "Your diagnostic logs, VIN, and license plates never leave your computer. All parsing, heuristics, and compatibility rules run inside your web browser.",
  },
  analyzer: {
    title: "VCDS Log Analyzer",
    subtitle: "Paste or drop your VCDS Auto-Scan .txt log below for instant local analysis.",
    dropzonePlaceholder: "Drag & drop your VCDS Auto-Scan .txt file here, or click to browse",
    pastePlaceholder: "Or paste your full VCDS Auto-Scan text or single Address XX block here...",
    loadSample: "Load sample scan",
    clear: "Clear",
    anonymizeToggle: "Anonymize VIN & plate",
    anonymizeActive: "VIN & Plate Masked",
    comingSoon: "Log parser and heuristic analyzer will be loaded in the next step.",
  },
  compat: {
    title: "RNS 510 Compat Checker",
    subtitle: "Verify safe firmware upgrade paths and map compatibility with sourced caveats.",
    tabForm: "Manual Search",
    tabPaste: "Paste VCDS Block",
    partNumberLabel: "Part Number (e.g. 1T0 035 680 C)",
    hwLabel: "HW / Component (optional, e.g. H50 2840)",
    fwLabel: "Target Firmware",
    mapLabel: "Target Map",
    selectNoneFw: "Select target firmware (optional)...",
    selectNoneMap: "Select target map (optional)...",
    checkButton: "Evaluate Compatibility",
    resetButton: "Reset",
    datapointsTitle: "Community Test Reports & Real Datapoints",
    reportResult: "Report Your Test Result",
    sources: "Documented Sources & Community References",
    warnings: "Crucial Update Warnings & Risks",
    unknownNotice: "Unknown / Not Covered in Database",
    pasteInstructions:
      "Paste an Address 37 (Navigation) or Address 56 (Radio) block from your VCDS Auto-Scan. Part number and hardware revision will be extracted automatically.",
    pastePlaceholder:
      "Address 37: Navigation (J0506) ...\n   Part No SW: 1T0 035 680 C    HW: 1T0 035 680 C\n   Component: RNS-MID       H50 2840...",
    parseAndFill: "Extract & Evaluate",
    candidatePrompt: "Multiple unit revisions match this base number. Please select your exact suffix:",
    filterPart: "Filter by Part Number:",
    allParts: "All Part Numbers",
    noDatapoints: "No reports found for this filter.",
  },
  disclaimer: {
    title: "Important Disclaimers",
    informational: "Informational only, not professional diagnosis.",
    risk: "Flashing firmware can brick a unit and is done strictly at your own risk.",
    nonAffiliation: "Not affiliated with Volkswagen AG or Ross-Tech.",
    noFiles: "This website does not host, distribute, or link to firmware or map download files.",
    localProcessing: "All diagnostic parsing and compatibility checks occur locally in your browser.",
    copyright: "All trademarks belong to their respective owners.",
  },
  common: {
    language: "Language",
    romanian: "Romana",
    english: "English",
    unknown: "unknown",
  },
};

export type Translations = typeof en;
