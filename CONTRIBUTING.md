# Contributing to RNS 510 Companion

Thank you for your interest in contributing to **rns510-companion**!

## Principles

1. **No Invented Data:** Fault explanations, firmware upgrade paths, and caveats must come from documented forum sources, TPIs, or verified community test results. For anything unknown, the system must say `unknown`, never a speculative guess.
2. **No Copyrighted Files:** Under no circumstances should this repository host, distribute, link to, or reference direct download mirrors for copyrighted Volkswagen navigation maps or proprietary firmware binaries.
3. **Client-Side Privacy:** All log processing must happen completely in the user's browser. No telemetry or server-side log uploads.
4. **Code Quality:** All code comments must be in English with no diacritics. All tests (`pnpm test`), lint (`pnpm lint`), typechecks (`pnpm typecheck`), and data validation (`pnpm validate:data`) must pass before submitting a PR.

---

## Adding Compatibility Rules & Datapoints

All RNS 510 hardware, firmware, maps, and rules live in `data/rns510.json`.

### Rule Confidence Levels

- `tested-by-maintainer`: Verified on physical hardware by a core maintainer.
- `community-reported`: Documented in established enthusiast forums (e.g., Motor-Talk, VWCaliforniaClub, Ross-Tech forum, My-GTI).
- `unverified`: Anecdotal reports or single reports with pending re-verification.

### Rule Status Levels

- `works`: Confirmed functional and operational.
- `unstable`: Installs or runs but triggers known reboots, battery drain, or freezes.
- `incompatible`: Hardware or software revision incompatible; will not install or risks bricking.
- `unknown`: No verified data available.

### Required Sources

Every rule MUST include at least one valid source with `title` and `url`. PRs adding rules without verifiable sources will be rejected by `pnpm validate:data`.

---

## Local Development Workflow

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run Vitest test suite
pnpm test

# Run ESLint
pnpm lint

# Run TypeScript type check
pnpm typecheck

# Validate JSON data against Zod schemas
pnpm validate:data

# Production build check
pnpm build
```
