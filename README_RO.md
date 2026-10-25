# RNS 510 Companion (Română)

O aplicație web rapidă, sigură și confidențială dedicată posesorilor de unități de navigație Volkswagen RNS 510 și analizei jurnalelor de diagnoză VCDS Auto-Scan.

[**English Version (README.md)**](./README.md)

---

## Funcționalități principale

1. **Analizator Jurnal VCDS**
   - Trage și plasează (drag & drop) sau lipește fișierul Auto-Scan `.txt` din VCDS.
   - Parsare 100% în browser (niciun bit de date nu părăsește dispozitivul tău).
   - Anonimizare automată pentru serie de șasiu (VIN) și număr de înmatriculare.
   - Gruparea codurilor de eroare în clustere de evenimente (erori stocate la același kilometraj în interval de ±15 minute).
   - Euristică pentru validarea amprentelor temporale (identifică date expirate, ore inconsistente și ceasuri resetate la data implicită din fabrică).
   - Detecție module duplicate (de ex. `Address 37 Navigation` și `Address 56 Radio` reprezentând aceeași unitate fizică).
   - Explicații clare și sugestii de verificare în română și engleză.
   - Export simplu în format Markdown sau salvare ca PDF pentru tipar.

2. **Verificator Compatibilitate RNS 510**
   - Verifică opțiunile de actualizare firmware și hărți în funcție de codul de piesă (ex: `1T0 035 680 C`) și versiunea hardware (`H50 2840`).
   - Autocompletare instantă prin lipirea blocului `Address 37` sau `Address 56` din scanarea VCDS.
   - Avertismente cu surse citate (necesitatea conectării unui redresor, ștergerea automată a hărților vechi, diagnostic antenă GPS).
   - Niveluri transparente de încredere a datelor (`tested-by-maintainer`, `community-reported`, `unverified`).
   - Formular de raportare rezultate pe GitHub pentru membrii comunității.

---

## Garanție de confidențialitate

Toată parsarea și analiza au loc **exclusiv în browserul tău**. Niciun jurnal, cod VIN, număr de înmatriculare sau serie nu este trimis pe vreun server la distanță.

---

## Declinare de responsabilitate

- **Doar scop informativ:** Această aplicație nu constituie o diagnoză auto profesională.
- **Risc de rescriere firmware:** Rescrierea firmware-ului poate bloca permanent unitatea de navigație (brick) și se efectuează exclusiv pe propria răspundere.
- **Neafiliere:** Acest proiect nu este afiliat cu Volkswagen AG sau Ross-Tech LLC.
- **Fără fișiere:** Acest instrument nu găzduiește, nu distribuie și nu oferă linkuri către fișiere descărcabile de firmware sau hărți protejate prin drepturi de autor.

---

## Pornire rapidă

### Cerințe de sistem

- Node.js 20+ (recomandat v22+)
- pnpm 10+ (suportă v12)

### Instalare și rulare

```bash
# Clonează depozitul
git clone https://github.com/your-username/rns510-companion.git
cd rns510-companion

# Instalează dependențele
pnpm install

# Pornește serverul de dezvoltare
pnpm dev
```

Deschide [http://localhost:3000](http://localhost:3000) în browser.

### Verificare și testare

```bash
# Rulare teste Vitest
pnpm test

# Verificare linting ESLint
pnpm lint

# Verificare tipuri TypeScript
pnpm typecheck

# Validare structură date JSON
pnpm validate:data

# Compilare producție
pnpm build
```

---

## Licență

[MIT](./LICENSE)
