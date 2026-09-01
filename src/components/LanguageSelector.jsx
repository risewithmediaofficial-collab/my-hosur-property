import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppLanguage } from "../context/LanguageContext";
import { CheckIcon, ChevronDownIcon, GlobeAltIcon } from "./AppIcons";

/**
 * LanguageSelector UI Component
 * Supports variants: 'navbar' (default dropdown), 'topbar', 'mobile' (interactive pill list), 'footer'
 */
const LanguageSelector = ({ variant = "navbar", className = "" }) => {
  const { currentLanguage, currentLangObj, setLanguage, languages, t } = useAppLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (variant !== "navbar" && variant !== "topbar") return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  // Mobile Drawer Variant
  if (variant === "mobile") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <GlobeAltIcon className="h-4 w-4 text-orange" />
            <span>{t("language.select") || "Language"}</span>
          </div>
          <span className="text-[11px] font-semibold text-orange">
            {currentLangObj.nativeName}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-orange bg-orange/10 text-orange shadow-xs ring-1 ring-orange/30"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${lang.gradient} text-xs font-bold text-white shadow-xs`}
                >
                  {lang.scriptBadge}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold leading-tight text-slate-900">
                    {lang.nativeName}
                  </p>
                  <p className="truncate text-[10px] text-slate-400 font-medium">
                    {lang.name}
                  </p>
                </div>
                {isSelected && (
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-orange" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Footer Variant
  if (variant === "footer") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70 mr-1">
          <GlobeAltIcon className="h-3.5 w-3.5 text-orange" />
          <span>{t("footer.chooseLanguage") || "Language"}:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-orange text-white shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
                title={`Switch to ${lang.name}`}
              >
                <span className="font-bold text-[11px]">{lang.scriptBadge}</span>
                <span>{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Topbar Compact Variant
  if (variant === "topbar") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-black bg-orange text-white">
            {currentLangObj.scriptBadge}
          </span>
          <span>{currentLangObj.nativeName}</span>
          <ChevronDownIcon
            className={`h-3 w-3 text-white/70 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 top-full z-[100] mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5"
            >
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                {t("language.select") || "Select Language"}
              </div>
              <div className="space-y-0.5">
                {languages.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-orange/10 text-orange font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white bg-gradient-to-br ${lang.gradient}`}
                      >
                        {lang.scriptBadge}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-900">
                          {lang.nativeName}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-orange" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Navbar Variant (Default)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-orange bg-orange/5 text-orange shadow-xs ring-1 ring-orange/20"
            : "border-slate-200 bg-white text-navy hover:border-orange/50 hover:bg-surface hover:text-orange"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Language"
      >
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black text-white bg-gradient-to-br ${currentLangObj.gradient} shadow-2xs`}
        >
          {currentLangObj.scriptBadge}
        </div>
        <span className="font-bold tracking-tight">{currentLangObj.nativeName}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full z-[100] mt-2 w-64 rounded-2xl border border-slate-200 bg-white/98 p-2 shadow-2xl backdrop-blur-md ring-1 ring-black/5"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t("language.select") || "Select Language"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                5 Languages
              </span>
            </div>

            <div className="space-y-1">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-orange/10 text-orange shadow-2xs ring-1 ring-orange/20"
                        : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${lang.gradient} text-xs font-bold text-white shadow-xs transition-transform group-hover:scale-105`}
                    >
                      {lang.scriptBadge}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold leading-tight text-slate-900 group-hover:text-navy">
                        {lang.nativeName}
                      </p>
                      <p className="truncate text-[10px] text-slate-400 font-medium">
                        {lang.name}
                      </p>
                    </div>
                    {isSelected ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange text-white">
                        <CheckIcon className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-300 group-hover:text-slate-500 uppercase">
                        {lang.code}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
