import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import i18n, { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from "../i18n/i18n";

const LanguageContext = createContext({
  currentLanguage: "en",
  currentLangObj: SUPPORTED_LANGUAGES[0],
  setLanguage: () => {},
  languages: SUPPORTED_LANGUAGES,
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguageState] = useState(() => i18n.language || "en");

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

  const setLanguage = useCallback((langCode) => {
    const validLang = SUPPORTED_LANGUAGES.some((l) => l.code === langCode) ? langCode : "en";
    i18n.changeLanguage(validLang).then(() => {
      setCurrentLanguageState(validLang);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, validLang);
      } catch (e) {
        // ignore
      }
      syncDocumentAttributes(validLang);
    });
  }, [syncDocumentAttributes]);

  useEffect(() => {
    syncDocumentAttributes(currentLanguage);
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

export const useAppLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useAppLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
