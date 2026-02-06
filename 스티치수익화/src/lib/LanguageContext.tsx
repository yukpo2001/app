"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "../data/translations.json";

type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setLanguage(saved);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let result: unknown = (translations as Record<string, unknown>)[language];
    for (const k of keys) {
      result = (result as Record<string, unknown>)?.[k];
    }
    return (result as string) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
