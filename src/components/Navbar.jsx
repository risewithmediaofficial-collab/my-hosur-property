import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { useAppLanguage } from "../context/LanguageContext";
import { CONTACT_EMAIL, CONTACT_PHONE_NUMBERS } from "../constants/contactInfo";
import BrandLogo, { logoSrc } from "./BrandLogo";
import LanguageSelector from "./LanguageSelector";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BookmarkIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  EnvelopeIcon,
  FlagIcon,
  HomeIcon,
  InformationCircleIcon,
  LoanIcon,
  PhoneIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  Squares2X2SolidIcon,
  XMarkIcon,
} from "./AppIcons";

const navIconMap = {
  "/": HomeIcon,
  "/services": BriefcaseIcon,
  "/bank-loans": LoanIcon,
  "/plans": LoanIcon,
  "/about": InformationCircleIcon,
  "/contact": PhoneIcon,
  "/post-property": PlusCircleIcon,
};

const desktopNavLinks = [
  { labelKey: "nav.home", defaultLabel: "Home", to: "/" },
  { labelKey: "nav.services", defaultLabel: "Our Services", to: "/services" },
  { labelKey: "nav.bankLoans", defaultLabel: "Bank Loans", to: "/bank-loans" },
  { labelKey: "nav.plans", defaultLabel: "Plans", to: "/plans" },
  { labelKey: "nav.aboutUs", defaultLabel: "About Us", to: "/about" },
  { labelKey: "nav.contact", defaultLabel: "Contact", to: "/contact" },
];

const mobileNavLinks = [
  ...desktopNavLinks,
  { labelKey: "nav.listProperty", defaultLabel: "List My Property", to: "/post-property" },
];

const Navbar = memo(() => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useAppLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 40);
    // passive: true is critical — tells browser we won't call preventDefault()
    // which lets it skip the sync hit on each scroll tick
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  const canShowSavedShortcut = Boolean(isAuthenticated && user?.role !== "admin");

  useBodyScrollLock(mobileMenuOpen);

  const closeMenu = () => setMobileMenuOpen(false);

  const scrollToTop = () => {
    const htmlElement = document.documentElement;
    const originalScroll = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    setTimeout(() => {
      htmlElement.style.scrollBehavior = originalScroll;
    }, 50);
  };

  const onLogout = () => {
    logout();
    closeMenu();
    scrollToTop();
    navigate("/");
  };

  const handlePostFreeProperty = () => {
    scrollToTop();

    if (isAuthenticated) {
      navigate("/post-property");
      return;
    }

    toast.success("Sign in to post your free property listing.");
    navigate("/auth", { state: { from: { pathname: "/post-property" } } });
  };

  const renderDesktopLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={scrollToTop}
      className={({ isActive }) =>
        `relative shrink-0 inline-flex items-center px-2 py-1 xl:px-2.5 xl:py-1.5 2xl:px-3.5 2xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold whitespace-nowrap rounded-lg transition-colors ${
          isActive
            ? "text-orange bg-orange/5 font-bold"
            : "text-navy hover:text-orange hover:bg-slate-50"
        }`
      }
    >
      {t(item.labelKey) || item.defaultLabel}
    </NavLink>
  );

  const renderMobileLink = (item) => {
    const Icon = navIconMap[item.to] || HomeIcon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={() => {
          scrollToTop();
          closeMenu();
        }}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
            isActive ? "bg-orange/10 text-orange font-bold" : "text-navy hover:bg-surface"
          }`
        }
      >
        <Icon className="h-5 w-5" />
        <span>{t(item.labelKey) || item.defaultLabel}</span>
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white">

      {/* Top Bar with Contacts and Language Switcher */}
      <div className="bg-navy text-white py-1 block">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between px-3 sm:px-6 lg:px-8 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1">
            <div className="hidden sm:inline-flex flex-wrap items-center gap-x-4 gap-y-1">
              {CONTACT_PHONE_NUMBERS.map((phone) => (
                <a
                  key={phone.tel}
                  href={`tel:${phone.tel}`}
                  className="inline-flex items-center gap-2 transition hover:text-orange"
                >
                  <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0 text-orange" />
                  {phone.display}
                </a>
              ))}
            </div>
            <a
              href={`tel:${CONTACT_PHONE_NUMBERS[0]?.tel}`}
              className="sm:hidden inline-flex items-center gap-1.5 transition hover:text-orange text-[11px]"
            >
              <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0 text-orange" />
              {CONTACT_PHONE_NUMBERS[0]?.display}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hidden md:inline-flex items-center gap-2 transition hover:text-orange"
            >
              <EnvelopeIcon className="h-3.5 w-3.5 flex-shrink-0 text-orange" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector variant="topbar" />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          isSticky ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-0.5 sm:py-1.5 lg:py-2">
          <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between gap-1.5 sm:gap-2 xl:gap-4">
            {/* Logo */}
            <NavLink
              to="/"
              onClick={() => {
                scrollToTop();
                closeMenu();
              }}
              className="inline-flex min-w-0 shrink-0 flex-col items-center justify-center text-center gap-0.5"
            >
              <img
                src={logoSrc}
                alt="MyHosurProperty"
                className="block h-9 sm:h-11 lg:h-12 xl:h-13 w-auto max-w-[120px] sm:max-w-[150px] lg:max-w-[165px] xl:max-w-[185px] object-contain mx-auto transition-all"
                style={{ maxHeight: "52px", width: "auto" }}
              />
              <span className="hidden xl:inline-block text-[10px] font-medium leading-none text-slate-500 whitespace-nowrap text-center">
                {t("nav.poweredBy") || "Powered by"}{" "}
                <span className="font-bold text-navy">
                  {t("nav.companyName") || "Gyes Property & Construction"}
                </span>
              </span>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden flex-1 items-center justify-center gap-1 xl:gap-1.5 2xl:gap-2.5 lg:flex min-w-0 px-1 overflow-x-auto scrollbar-none">
              {desktopNavLinks.map(renderDesktopLink)}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-1.5 xl:gap-2 2xl:gap-3 lg:flex shrink-0">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to={dashboardPath}
                    onClick={scrollToTop}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-1.5 rounded-lg px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-semibold transition shrink-0 ${
                        isActive ? "text-orange" : "text-navy hover:text-orange"
                      }`
                    }
                    title={t("nav.dashboard") || "Dashboard"}
                    aria-label={t("nav.dashboard") || "Dashboard"}
                  >
                    {({ isActive }) => {
                      const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                      return (
                        <>
                          <DashboardIcon className="h-4 w-4 shrink-0" />
                          <span className="hidden xl:inline">{t("nav.dashboard") || "Dashboard"}</span>
                        </>
                      );
                    }}
                  </NavLink>

                  {canShowSavedShortcut ? (
                    <NavLink
                      to="/dashboard?tab=saved"
                      onClick={scrollToTop}
                      className={({ isActive }) =>
                        `inline-flex h-8 w-8 xl:h-9 xl:w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                          isActive
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-slate-200 text-navy hover:border-orange hover:text-orange"
                        }`
                      }
                      aria-label={t("nav.savedProperties") || "Saved properties"}
                      title={t("nav.savedProperties") || "Saved properties"}
                    >
                      <BookmarkIcon className="h-4 w-4" />
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-bold text-slate-700 shadow-2xs transition-all duration-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer shrink-0"
                    title={t("nav.logout") || "Logout"}
                    aria-label={t("nav.logout") || "Logout"}
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4 text-red-500 shrink-0" />
                    <span className="hidden xl:inline">{t("nav.logout") || "Logout"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePostFreeProperty}
                    className="header-btn-adissia px-3 xl:px-4 2xl:px-5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-[13px] 2xl:text-sm transition-all duration-300 font-bold flex items-center gap-1.5 xl:gap-2 relative shrink-0"
                  >
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white free-blink-badge pointer-events-none uppercase tracking-wider shadow-md">
                      {t("common.free") || "Free"}
                    </span>
                    <FlagIcon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{t("nav.postFreeProperty") || "Post property"}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-[13px] 2xl:text-sm font-bold shadow-2xs transition-all duration-200 cursor-pointer shrink-0 ${
                        loginDropdownOpen
                          ? "border-orange bg-orange text-white"
                          : "border-slate-200 bg-white text-navy hover:border-orange hover:bg-orange/5 hover:text-orange"
                      }`}
                    >
                      <ArrowRightOnRectangleIcon className={`h-4 w-4 shrink-0 ${loginDropdownOpen ? "text-white" : "text-orange"}`} />
                      <span>{t("nav.login") || "Login"}</span>
                      <ChevronDownIcon
                        className={`h-3.5 w-3.5 transition-transform duration-200 shrink-0 ${loginDropdownOpen ? "rotate-180 text-white" : "text-slate-400"}`}
                      />
                    </button>

                    {loginDropdownOpen && (
                      <motion.div
                        className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl py-1 overflow-hidden"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <NavLink
                          to="/auth"
                          onClick={() => {
                            scrollToTop();
                            setLoginDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-orange/5 hover:text-orange"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 text-orange" />
                          <span>{t("nav.login") || "Login"}</span>
                        </NavLink>
                        <div className="my-1 border-t border-slate-100" />
                        <NavLink
                          to="/auth"
                          onClick={() => {
                            scrollToTop();
                            setLoginDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-orange/5 hover:text-orange"
                        >
                          <PlusCircleIcon className="h-4 w-4 text-orange" />
                          <span>{t("nav.createAccount") || "Create Account"}</span>
                        </NavLink>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePostFreeProperty}
                    className="header-btn-adissia px-3 xl:px-4 2xl:px-5 py-1.5 xl:py-2 rounded-lg text-xs xl:text-[13px] 2xl:text-sm transition-all duration-300 font-bold flex items-center gap-1.5 xl:gap-2 relative shrink-0"
                  >
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white free-blink-badge pointer-events-none uppercase tracking-wider shadow-md">
                      {t("common.free") || "Free"}
                    </span>
                    <FlagIcon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{t("nav.postFreeProperty") || "Post property"}</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
              {canShowSavedShortcut ? (
                <NavLink
                  to="/dashboard?tab=saved"
                  onClick={() => {
                    scrollToTop();
                    closeMenu();
                  }}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy shadow-2xs transition hover:border-orange hover:text-orange"
                  aria-label={t("nav.savedProperties") || "Saved properties"}
                  title={t("nav.savedProperties") || "Saved properties"}
                >
                  <BookmarkIcon className="h-4.5 w-4.5" />
                </NavLink>
              ) : null}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 shadow-2xs transition hover:bg-red-50 hover:border-red-300 whitespace-nowrap shrink-0 cursor-pointer"
                  title={t("nav.logout") || "Logout"}
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="whitespace-nowrap">{t("nav.logout") || "Logout"}</span>
                </button>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={scrollToTop}
                  className="hidden sm:inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-2xs transition hover:border-orange hover:text-orange whitespace-nowrap shrink-0"
                >
                  {t("nav.login") || "Login"}
                </NavLink>
              )}

              {/* Hamburger Button */}
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy shadow-2xs hover:bg-slate-50 hover:border-slate-300 focus:outline-none transition-all duration-200 cursor-pointer"
                onClick={() => setMobileMenuOpen((value) => !value)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="relative w-4 h-3.5 flex flex-col justify-between items-center">
                  <span
                    className={`block h-[2px] w-full bg-navy rounded-full transform transition-all duration-300 ${
                      mobileMenuOpen ? "rotate-45 translate-y-[6px]" : ""
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-full bg-navy rounded-full transition-all duration-300 ${
                      mobileMenuOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-[2px] w-full bg-navy rounded-full transform transition-all duration-300 ${
                      mobileMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 pb-4 lg:hidden">
          <div className="mx-auto max-h-[calc(100dvh-5rem)] max-w-[1440px] overflow-y-auto py-3 space-y-4">
            {/* Mobile Language Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <LanguageSelector variant="mobile" />
            </div>

            <nav className="flex flex-col gap-1">{mobileNavLinks.map(renderMobileLink)}</nav>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              <NavLink
                to={dashboardPath}
                onClick={() => {
                  scrollToTop();
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-navy"
              >
                <Squares2X2Icon className="h-5 w-5" />
                {t("nav.dashboard") || "Dashboard"}
              </NavLink>
              {canShowSavedShortcut ? (
                <NavLink
                  to="/dashboard?tab=saved"
                  onClick={() => {
                    scrollToTop();
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-navy"
                >
                  <BookmarkIcon className="h-5 w-5" />
                  {t("nav.savedProperties") || "Saved Properties"}
                </NavLink>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  handlePostFreeProperty();
                  closeMenu();
                }}
                className="header-btn-adissia flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white shadow-lg relative"
              >
                <span className="absolute -top-2.5 right-4 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white free-blink-badge pointer-events-none uppercase tracking-wider shadow-md">
                  {t("common.free") || "Free"}
                </span>
                <FlagIcon className="h-5 w-5" />
                <span>{t("nav.postFreePropertyFull") || "Post your free property"}</span>
              </button>
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/auth"
                    onClick={() => {
                      scrollToTop();
                      closeMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-semibold text-white"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    {t("nav.login") || "Login"}
                  </NavLink>
                  <NavLink
                    to="/auth"
                    onClick={() => {
                      scrollToTop();
                      closeMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-navy bg-white px-4 py-3 text-sm font-semibold text-navy"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    {t("nav.createAccount") || "Create Account"}
                  </NavLink>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-4 py-3 text-sm font-bold text-red-600 shadow-2xs transition hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span>{t("nav.logout") || "Logout"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
