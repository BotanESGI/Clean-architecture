"use client";

import { useLanguage } from "../contexts/LanguageContext";
import frTranslations from "../lib/translations/fr.json";
import enTranslations from "../lib/translations/en.json";

type TranslationKey = 
  | keyof typeof frTranslations
  | `${keyof typeof frTranslations}.${string}`
  | `${keyof typeof frTranslations}.${string}.${string}`
  | `${keyof typeof frTranslations}.${string}.${string}.${string}`;

const translations = {
  fr: frTranslations,
  en: enTranslations,
};

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return path; // Retourner la clé si la traduction n'existe pas
    }
  }
  return typeof value === "string" ? value : path;
}

export function useTranslation() {
  const { language } = useLanguage();
  const t = (key: TranslationKey): string => {
    return getNestedValue(translations[language], key);
  };

  return { t, language };
}

