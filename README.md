# RNS 510 Companion

A fast, lightweight, privacy-first companion web application for Volkswagen RNS 510 navigation head units and VCDS Auto-Scan diagnostic logs.

[**Versiunea în limba română (README_RO.md)**](./README_RO.md)

---

## Features

1. **VCDS Log Analyzer**
   - Drag & drop or paste your VCDS Auto-Scan `.txt` logs.
   - 100% in-browser parsing (no data is ever sent to any remote server).
   - Default VIN (`WVWZZZ1KZ*W******`) and license plate anonymization.
   - Event clustering (grouping faults that occurred within ±15 minutes at the same mileage).
   - Timestamp reliability heuristics (flags stale dates, inconsistent clock entries, and default factory dates).
   - Duplicate module detection (e.g. `Address 37` and `Address 56` referencing the same physical unit).
   - Plain-English and Romanian explanations for fault codes.
   - One-click clean Markdown and printable PDF export.

2. **RNS 510 Compatibility Checker**
   - Check firmware and map upgrade paths for your unit part number (e.g., `1T0 035 680 C`) and hardware revision (`H50 2840`).
   - Quick-fill by pasting an `Address 37` or `Address 56` block from your VCDS scan.
   - Strictly sourced warnings (battery charger requirement, map wipe caveats, GPS antenna checks).
   - Sourced data model with transparent confidence labels (`tested-by-maintainer`, `community-reported`, `unverified`).
   - Direct GitHub issue reporting for community test results.

---

## Privacy Guarantee

All log parsing, fault analysis, and compatibility checks take place **strictly inside your web browser**. No diagnostic logs, serial numbers, VINs, or license plates are uploaded or transmitted anywhere.

---

## Disclaimers

- **Informational only:** This tool does not provide professional vehicle diagnostics.
- **Flashing risk:** Flashing firmware can permanently brick your head unit and is done strictly at your own risk.
- **Non-affiliation:** This project is not affiliated with Volkswagen AG or Ross-Tech LLC.
- **No file downloads:** This tool does not host, distribute, or provide download links for proprietary firmware or map files.

---

## Getting Started

### Prerequisites

- Node.js 20+ (v22+ recommended)
- pnpm 10+ (v12 supported)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rns510-companion.git
cd rns510-companion

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Verification & Testing

```bash
# Run Vitest tests
pnpm test

# Run ESLint
pnpm lint

# Run TypeScript check
pnpm typecheck

# Validate data schema
pnpm validate:data

# Production build
pnpm build
```

---

## License

[MIT](./LICENSE)
