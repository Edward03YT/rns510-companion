# RNS 510 Companion (Română)

[![CI](https://github.com/Edward03YT/rns510-companion/actions/workflows/ci.yml/badge.svg)](https://github.com/Edward03YT/rns510-companion/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

O aplicație web rapidă, sigură și confidențială dedicată posesorilor de unități de navigație Volkswagen RNS 510 și analizei jurnalelor de diagnoză VCDS Auto-Scan.

[**English Version (README.md)**](./README.md)

---

## Arhitectură și Confidențialitate

**rns510-companion** este dezvoltat integral cu **React 19, Next.js (App Router), TypeScript (`strict`) și Tailwind CSS**.

- **Format pur npm & React standard:** Fără unelte de împachetare vechi sau proprietare, fără baze de date, fără rute API pe server.
- **Confidențialitate 100% în Browser:** Parsarea jurnalelor, euristica și regulile de compatibilitate se execută exclusiv pe dispozitivul tău prin intermediul API-urilor native de browser (`FileReader`, DOM). Jurnalele de diagnoză, seriile VIN și codurile de componente nu sunt transmise niciodată pe vreun server la distanță.
- **Optimizat pentru Vercel:** Poate fi implementat instantaneu pe Vercel ca site static de mare viteză cu un singur clic.

---

## Instrumente Principale

### 1. Analizator Jurnal VCDS (`/analyzer`)
- **Încărcare Flexibilă:** Trage și plasează fișierul Auto-Scan `.txt` (suportă codare UTF-8 cu trecere automată la Windows-1252 ANSI) sau lipește textul direct. Include butonul "Încarcă scanare demonstrativă".
- **Anonimizare Automată (Activat implicit):** Maschează automat seria de șasiu (`WVWZZZ1KZ*W******`) și numărul de înmatriculare (`XX00XXX`) atât în interfață, cât și în rapoartele exportate.
- **Clustere de Evenimente Corelate:** Identifică și grupează automat erorile din module diferite produse la același kilometraj și dată într-un interval scurt de ±15 minute (ex: întreruperea comunicării pe magistrala CAN urmată de deconectarea modulului de navigație).
- **Detecție Timestamp Nesigur:**
  - `stale`: Erori stocate cu mai mult de 180 de zile înainte de data scanării.
  - `inconsistent`: Date din freeze-frame cu oră ulterioară scanării sau kilometraj mai mare decât odometrul curent.
  - `default-date`: Ceasuri neregulate / resetate din fabrică (ex: data `2021.03.15` repetată la 4 kilometraje diferite).
- **Corelare Module Duplicate:** Detectează adresele care reprezintă aceeași unitate fizică (ex: `Address 37 Navigation` și `Address 56 Radio` având aceeași serie și VCID).
- **Clasificare Severitate:** Ecusoane vizuale cu pictogramă + text (`CHECK`, `LOW`, `INFO`, `UNKNOWN`), însoțite de explicații clare și recomandări în limba română.
- **Export Simplu:** Copiere directă ca raport Markdown și tipărire sau salvare ca PDF prin stylesheet optimizat pentru tipar.

### 2. Verificator Compatibilitate RNS 510 (`/compat`)
- **Două Moduri de Căutare:**
  - **Formular Manual:** Căutare după codul piesei (ex: `1T0 035 680 C`), versiunea hardware (`H50 2840`), versiunea dorită de firmware (ex: `5238 (Josi modded)`) și harta dorită.
  - **Lipire Bloc VCDS:** Lipește blocul `Address 37` sau `Address 56` din Auto-Scan pentru autocompletarea automată a codului și a reviziei hardware.
- **Selector Rapid de Sufix:** Dacă introduci codul de bază fără litera de final (ex: `1T0 035 680`), aplicația îți oferă opțiunea de a selecta rapid între versiunile `B` și `C`.
- **Decizii și Niveluri de Încredere:**
  - Stări: `FUNCȚIONEAZĂ`, `INSTABIL`, `INCOMPATIBIL`, `NECUNOSCUT`.
  - Niveluri de încredere: `testat pe unitate fizică`, `raportat în comunitate`, `neverificat`.
  - Fără presupuneri: combinațiile nedocumentate sunt marcate strict drept `NECUNOSCUT`.
- **Avertismente cu Surse Citate:**
  - Obligativitatea conectării unui redresor auto pe durata resoftării.
  - Cerințe pentru scrierea CD-urilor la viteză redusă (2x / 4x).
  - Combinația de taste pentru modul bootloader (`SETUP + Eject + Info/Mic`).
  - Avertisment privind ștergerea partiției de hărți la instalarea versiunii 5238.
  - Verificarea antenei GPS și soluții pentru instalări de hărți întrerupte.
- **Tabel Datapoints din Comunitate:** Listă de rapoarte reale cu opțiunea de trimitere a unui nou raport precompletat pe GitHub.

---

## Implementare pe Vercel

### Opțiunea 1: Implementare cu 1-Click
Apasă butonul de mai jos pentru a duplica și implementa direct pe Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Opțiunea 2: Implementare prin CLI cu npm
```bash
npm install -g vercel
vercel
```

---

## Dezvoltare Locală și Testare

### Cerințe de sistem
- Node.js 20+ (recomandat v22+)
- `npm` (managerul standard de pachete)

### Comenzi utile

```bash
# Instalare dependențe
npm install

# Rulare server local de dezvoltare
npm run dev

# Rulare suita de teste Vitest (23 teste unitare)
npm test

# Verificare linting cu ESLint
npm run lint

# Verificare tipuri TypeScript (strict)
npm run typecheck

# Validare structură date JSON împotriva schemelor Zod
npm run validate:data

# Compilare de producție
npm run build
```

---

## Declinare de responsabilitate

- **Doar în scop informativ:** Acest instrument nu oferă o diagnoză auto profesională.
- **Risc de blocare (brick):** Rescrierea firmware-ului implică riscuri tehnice reale și se efectuează exclusiv pe răspunderea utilizatorului.
- **Neafiliat:** Proiectul nu este afiliat cu Volkswagen AG sau Ross-Tech LLC.
- **Fără fișiere:** Această aplicație nu găzduiește, nu distribuie și nu furnizează linkuri pentru descărcarea de firmware sau hărți supuse drepturilor de autor.

---

## Licență

[MIT](./LICENSE) &copy; 2026 RNS 510 Companion Contributors
