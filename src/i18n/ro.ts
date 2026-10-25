import { Translations } from "./en";

export const ro: Translations = {
  appName: "RNS 510 Companion",
  tagline: "Asistent pentru analiza jurnalelor VCDS și compatibilitatea firmware RNS 510",
  privacyBanner: "Procesat local în browserul tău. Nimic nu este încărcat pe server.",
  nav: {
    analyzer: "Analizator Jurnal VCDS",
    compat: "Verificator Compatibilitate RNS 510",
    home: "Acasă",
  },
  home: {
    heroTitle: "RNS 510 Companion",
    heroSubtitle:
      "O aplicație rapidă și sigură pentru posesorii de RNS 510 și pasionații de retrofit VAG. Inspectează jurnalele de diagnoză VCDS și verifică opțiunile de actualizare fără a trimite date pe vreun server.",
    analyzerCard: {
      title: "Analizator Jurnal VCDS",
      description:
        "Lipește sau încarcă fișierul Auto-Scan (.txt) din VCDS. Obține un rezumat clar, grupuri de evenimente corelate, detecție de date temporale nesigure și explicații prietenoase pentru codurile de eroare.",
      action: "Deschide Analizatorul",
    },
    compatCard: {
      title: "Verificator Compatibilitate RNS 510",
      description:
        "Verifică compatibilitatea firmware-ului și a hărților pentru codul piesei și versiunea hardware RNS 510. Avertismente documentate cu surse, limitări cunoscute și rapoarte din comunitate.",
      action: "Verifică Compatibilitatea",
    },
    privacyTitle: "100% Local și Confidențial",
    privacyText:
      "Jurnalul de diagnoză, seria de șasiu (VIN) și numărul de înmatriculare nu părăsesc calculatorul tău. Toată parsarea și analiza au loc direct în browser.",
  },
  analyzer: {
    title: "Analizator Jurnal VCDS",
    subtitle: "Lipește sau trage fișierul .txt de scanare VCDS mai jos pentru analiză instantanee.",
    dropzonePlaceholder: "Trage fișierul Auto-Scan .txt aici sau apasă pentru a-l selecta",
    pastePlaceholder: "Sau lipește textul complet VCDS Auto-Scan ori un singur bloc Address XX...",
    loadSample: "Încarcă scanare demonstrativă",
    clear: "Șterge",
    anonymizeToggle: "Anonimizează VIN și număr",
    anonymizeActive: "VIN și Număr Mascate",
    comingSoon: "Motorul de parsare și analiza euristică vor fi încărcate în faza următoare.",
  },
  compat: {
    title: "Verificator Compatibilitate RNS 510",
    subtitle: "Verifică versiunile sigure de firmware și compatibilitatea hărților cu avertismente documentate.",
    tabForm: "Căutare Manuală",
    tabPaste: "Lipește Bloc VCDS",
    partNumberLabel: "Cod Piesă (ex: 1T0 035 680 C)",
    hwLabel: "HW / Componentă (opțional, ex: H50 2840)",
    fwLabel: "Versiune Firmware Țintă",
    mapLabel: "Versiune Hartă Țintă",
    checkButton: "Evaluează Compatibilitatea",
    comingSoon: "Motorul de evaluare a compatibilității va fi încărcat în faza următoare.",
  },
  disclaimer: {
    title: "Declinare de Responsabilitate",
    informational: "Informații oferite doar în scop orientativ, nu reprezintă o diagnoză profesională.",
    risk: "Rescrierea de firmware poate defecta iremediabil unitatea (brick) și se efectuează exclusiv pe propriul risc.",
    nonAffiliation: "Nu suntem afiliați cu Volkswagen AG sau Ross-Tech.",
    noFiles: "Acest site nu găzduiește, nu distribuie și nu oferă linkuri de descărcare către fișiere de firmware sau hărți.",
    localProcessing: "Toate analizele de diagnoză și verificările de compatibilitate se execută exclusiv local în browserul tău.",
    copyright: "Toate mărcile înregistrate aparțin proprietarilor de drept.",
  },
  common: {
    language: "Limbă",
    romanian: "Română",
    english: "Engleză",
    unknown: "necunoscut",
  },
};
