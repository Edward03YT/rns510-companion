"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { ro } from "./ro";
import { en, Translations } from "./en";

export type Locale = "ro" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
}

const STORAGE_KEY = "rns510_locale";
const STORAGE_EVENT = "rns510_locale_change";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getSnapshot(): Locale {
  if (typeof window === "undefined") return "ro";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ro" || saved === "en") return saved;
  } catch {
    // LocalStorage might be restricted
  }
  return "ro";
}

function getServerSnapshot(): Locale {
  return "ro";
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "ro",
  setLocale: () => {},
  toggleLocale: () => {},
  t: ro,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      // LocalStorage might be restricted
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "ro" ? "en" : "ro");
  };

  const t = locale === "en" ? en : ro;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
