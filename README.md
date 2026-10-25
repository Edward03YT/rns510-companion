# RNS 510 Companion

[![CI](https://github.com/Edward03YT/rns510-companion/actions/workflows/ci.yml/badge.svg)](https://github.com/Edward03YT/rns510-companion/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

A fast, lightweight, privacy-first companion web application for Volkswagen RNS 510 navigation head units and VCDS Auto-Scan diagnostic logs.

[**Versiunea în limba română (README_RO.md)**](./README_RO.md)

---

## Overview & Architecture

**rns510-companion** is built entirely with **React 19, Next.js (App Router), TypeScript (`strict`), and Tailwind CSS**.

- **Pure npm & standard React stack:** Zero legacy packaging, zero external database, zero server API routes.
- **100% Client-Side Privacy:** All log parsing, heuristics, and compatibility rules run inside the user's browser via native web APIs (`FileReader`, standard DOM). Diagnostic logs, VINs, and serial numbers are never uploaded to any remote server.
- **Deploy Target:** 1-click zero-config deployment on **Vercel** or any static hosting platform.

---

## Main Tools

### 1. VCDS Log Analyzer (`/analyzer`)
- **Dual Input:** Drag-and-drop your VCDS Auto-Scan `.txt` file (supports UTF-8 with automatic fallback to Windows-1252 ANSI) or paste raw text. Includes an instant "Load sample scan" button.
- **Privacy Anonymization Toggle (Default ON):** Automatically masks vehicle identification numbers (`WVWZZZ1KZ*W******`) and license plates (`XX00XXX`) throughout the UI and exports.
- **Correlated Event Clustering:** Automatically identifies and groups multi-module fault entries occurring at the same date and mileage within a ±15-minute window (e.g. CAN gateway communication loss followed by navigation/radio disconnects).
- **Timestamp Reliability Engine:** Detects and flags:
  - `stale`: Fault entries stored more than 180 days before the scan date.
  - `inconsistent`: Freeze-frame timestamps occurring after the scan datetime, or freeze-frame mileages exceeding odometer scan mileage.
  - `default-date`: Unset / factory clock dates (e.g. `2021.03.15` appearing across 3+ distinct vehicle mileages).
- **Duplicate Unit Linking:** Identifies duplicated addresses representing the same physical head unit (e.g. `Address 37 Navigation` and `Address 56 Radio` sharing identical VCID/serial numbers).
- **Severity Classification:** Visual icon + text badges (`CHECK`, `LOW`, `INFO`, `UNKNOWN`) with bilingual explanations and actionable suggestions.
- **Exporting:** One-click "Copy as Markdown" and browser-native "Print / Save as PDF" via custom print stylesheets.

### 2. RNS 510 Compatibility Checker (`/compat`)
- **Dual Input:**
  - **Manual Form:** Look up any part number (e.g. `1T0 035 680 C`) and hardware revision (e.g. `H50 2840`), target firmware (e.g. `5238 (Josi modded)`), and target map volume.
  - **Paste VCDS Block:** Paste an `Address 37` or `Address 56` block directly from your Auto-Scan to auto-extract the part number and hardware revision.
- **Base Number Suffix Selector:** Entering a base part number (e.g. `1T0 035 680`) prompts one-click selection between cataloged revisions (`B` and `C`).
- **Verdicts & Confidence Levels:**
  - Statuses: `WORKS`, `UNSTABLE`, `INCOMPATIBLE`, `UNKNOWN`.
  - Confidence: `tested-by-maintainer`, `community-reported`, `unverified`.
  - Never guesses: unmapped combinations are strictly labeled `UNKNOWN`.
- **Sourced Caveats & Warnings:**
  - Battery charger / engine running requirement during flashing.
  - Slow-speed CD-R burning requirements.
  - Three-button bootloader combo notice (`SETUP + Eject + Info/Mic`).
  - Map partition erase alert on 5238 installations.
  - Map install interruption recovery procedures and GPS antenna test menu verification.
- **Community Datapoint Registry:** Table of real-world test reports with direct prefilled GitHub issue reporting.

---

## Deploying to Vercel

### Option 1: One-Click Deploy
Click the button below to fork and deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: CLI Deploy with npm
```bash
npm install -g vercel
vercel
```

---

## Local Development & Testing

### Prerequisites
- Node.js 20+ (v22+ recommended)
- `npm` (standard package manager)

### Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run Vitest test suite (23 unit tests)
npm test

# Run ESLint check
npm run lint

# Run TypeScript strict type check
npm run typecheck

# Validate compatibility and fault rules schemas
npm run validate:data

# Production build check
npm run build
```

---

## Disclaimers

- **Informational only:** This tool does not provide professional vehicle diagnostics.
- **Flashing risk:** Flashing firmware can permanently brick your head unit and is done strictly at your own risk.
- **Non-affiliation:** This project is not affiliated with Volkswagen AG or Ross-Tech LLC.
- **No file downloads:** This tool does not host, distribute, or provide download links for proprietary firmware or map files.

---

## License

[MIT](./LICENSE) &copy; 2026 RNS 510 Companion Contributors
