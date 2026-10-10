import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";

const languageLoaders = {
  ta: () => import("./locales/ta.json"),
  te: () => import("./locales/te.json"),
  kn: () => import("./locales/kn.json"),
  hi: () => import("./locales/hi.json"),
};

const catalogLoaders = {
  ta: () => import("./catalog/ta.json"),
  te: () => import("./catalog/te.json"),
  kn: () => import("./catalog/kn.json"),
  hi: () => import("./catalog/hi.json"),
};

const languageBackend = {
  type: "backend",
  read(language, namespace, callback) {
    const load = (namespace === "catalog" ? catalogLoaders : languageLoaders)[language];
    if (!load) return callback(null, {});
    load().then(({ default: translations }) => callback(null, translations),
      (error) => callback(error, false));
  },
};

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    scriptBadge: "En",
    gradient: "from-blue-600 to-indigo-700",
    color: "#274F9A",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    scriptBadge: "த",
    gradient: "from-amber-500 to-orange-600",
    color: "#FF9914",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    scriptBadge: "తె",
    gradient: "from-emerald-500 to-teal-700",
    color: "#059669",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    scriptBadge: "ಕ",
    gradient: "from-violet-500 to-purple-700",
    color: "#7C3AED",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    scriptBadge: "अ",
    gradient: "from-rose-500 to-red-700",
    color: "#E11D48",
  },
];

export const LANGUAGE_STORAGE_KEY = "myhosurproperty_lang";

const getSavedLanguage = () => {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch  {
    // ignore
  }
  return "en";
};

const initialLang = getSavedLanguage();

export const i18nReady = i18n.use(languageBackend).use(initReactI18next).init({
  resources: {
    en: { translation: en, catalog: {} },
  },
  partialBundledLanguages: true,
  ns: ["translation", "catalog"],
  defaultNS: "translation",
  supportedLngs: SUPPORTED_LANGUAGES.map(({ code }) => code),
  load: "languageOnly",
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
