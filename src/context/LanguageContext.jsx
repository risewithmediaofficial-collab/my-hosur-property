import { useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "../i18n/i18n";

import { LanguageContext } from "./languageContextValue";

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || "en";
  const languageRequest = useRef(0);

  const syncDocumentAttributes = useCallback((lang) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;

    html.lang = lang;
    html.setAttribute("data-lang", lang);
    if (body) {
      body.setAttribute("data-lang", lang);
      // Remove previous language classes and add active one
      SUPPORTED_LANGUAGES.forEach((l) => body.classList.remove(`lang-${l.code}`));
      body.classList.add(`lang-${lang}`);
    }
  }, []);

  const setLanguage = useCallback(async (langCode) => {
    const validLang = SUPPORTED_LANGUAGES.some((l) => l.code === langCode) ? langCode : "en";
    const request = ++languageRequest.current;
    await i18n.loadLanguages(validLang);
    // A slower download must not override the user's latest selection.
    if (request === languageRequest.current) await i18n.changeLanguage(validLang);
  }, []);

  useEffect(() => {
    syncDocumentAttributes(currentLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch {
      // Language switching still works when browser storage is disabled.
    }
  }, [currentLanguage, syncDocumentAttributes]);

  const currentLangObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  }, [currentLanguage]);

  const value = useMemo(
    () => ({
      currentLanguage,
      currentLangObj,
      setLanguage,
      languages: SUPPORTED_LANGUAGES,
      t,
    }),
    [currentLanguage, currentLangObj, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
