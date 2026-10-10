import i18n from "../i18n/i18n";

export const localizeCatalogText = (text, language = "en") => {
  if (!text || language === "en") return text;
  const key = typeof text === "string" ? text.trim() : "";
  return i18n.getResourceBundle(language, "catalog")?.[key] || text;
};
