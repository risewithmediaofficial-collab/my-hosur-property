import { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { CONTACT_EMAIL, CONTACT_PHONE_NUMBERS } from "../constants/contactInfo";
import { primaryNavLinks } from "../constants/navigation";
import BrandLogo from "./BrandLogo";
import {
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
  "Our Services": BriefcaseIcon,
  Plans: LoanIcon,
  "About Us": InformationCircleIcon,
  Contact: PhoneIcon,
  "List My Property": PlusCircleIcon,
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
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

  const navLinks = useMemo(() => primaryNavLinks, []);

  const renderDesktopLink = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={scrollToTop}
      className={({ isActive }) =>
        `relative inline-flex items-center px-3 py-2 text-sm font-semibold transition ${
          isActive ? "text-orange" : "text-navy hover:text-orange"
        }`
      }
    >
      {item.label}
    </NavLink>
  );

  const renderMobileLink = (item) => {
    const Icon = navIconMap[item.label] || HomeIcon;
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
            isActive ? "bg-orange/10 text-orange" : "text-navy hover:bg-surface"
          }`
        }
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <style>{`
        @keyframes free-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(0.9); }
        }
        .free-blink-badge {
          animation: free-blink 1.2s ease-in-out infinite;
        }
      `}</style>
      <div className="bg-navy text-white py-1 hidden sm:block">
        <div className="mx-auto flex max-w-[1440px] items-center px-5 text-xs sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1">
              {CONTACT_PHONE_NUMBERS.map((phone) => (
                <a key={phone.tel} href={`tel:${phone.tel}`} className="inline-flex items-center gap-2 transition hover:text-orange">
                  <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0 text-orange" />
                  {phone.display}
                </a>
              ))}
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 transition hover:text-orange">
              <EnvelopeIcon className="h-3.5 w-3.5 flex-shrink-0 text-orange" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <div className={`border-b border-slate-200 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${isSticky ? "shadow-md" : "shadow-sm"}`}>
        <div className="px-5 sm:px-8 lg:px-10 py-1 sm:py-1.5 lg:py-2">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
            <NavLink
              to="/"
              onClick={() => {
                scrollToTop();
                closeMenu();
              }}
              className="inline-flex min-w-0 flex-col items-start gap-0.5"
            >
              <BrandLogo className="h-5 w-auto max-w-[60px] sm:h-10 sm:max-w-[140px] lg:h-12 lg:max-w-[160px]" />
              <span className="hidden sm:inline-block text-[10px] font-medium leading-none text-slate-500 sm:text-[11px]">
                Powered by <span className="font-bold text-navy">Gyes Construction</span>
              </span>
            </NavLink>

            <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">{navLinks.map(renderDesktopLink)}</nav>

            <div className="hidden items-center gap-3 lg:flex">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy transition hover:text-orange"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Logout
                  </button>

                  <span className="h-6 w-px bg-slate-200" aria-hidden="true" />

                  <NavLink
                    to={dashboardPath}
                    onClick={scrollToTop}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive ? "text-orange" : "text-navy hover:text-orange"
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                      return (
                        <>
                          <DashboardIcon className="h-4 w-4" />
                          Dashboard
                        </>
                      );
                    }}
                  </NavLink>

                  {canShowSavedShortcut ? (
                  <NavLink
                    to="/dashboard?tab=saved"
                    onClick={scrollToTop}
                    className={({ isActive }) =>
                      `inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                        isActive
                          ? "border-orange bg-orange/10 text-orange"
                          : "border-slate-200 text-navy hover:border-orange hover:text-orange"
                      }`
                    }
                    aria-label="Saved properties"
                    title="Saved properties"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                  </NavLink>
                  ) : null}

                  <button
                    type="button"
                    onClick={handlePostFreeProperty}
                    className="header-btn-adissia px-5 py-2 rounded-lg text-sm transition-all duration-300 font-bold flex items-center gap-2 relative"
                  >
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white free-blink-badge pointer-events-none uppercase tracking-wider shadow-md">
                      Free
                    </span>
                    <FlagIcon className="h-4 w-4" />
                    <span>Post property</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        loginDropdownOpen
                          ? "bg-orange text-white"
                          : "bg-slate-100 text-navy hover:bg-orange/10 hover:text-orange"
                      }`}
                    >
                      Login
                      <ChevronDownIcon className={`h-4 w-4 transition ${loginDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {loginDropdownOpen && (
                      <motion.div
                        className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg"
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
                          className="flex items-center gap-3 rounded-t-lg px-4 py-3 text-sm font-semibold text-navy transition hover:bg-orange/5 hover:text-orange"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Login
                        </NavLink>
                        <div className="border-t border-slate-200" />
                        <NavLink
                          to="/auth"
                          onClick={() => {
                            scrollToTop();
                            setLoginDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-b-lg px-4 py-3 text-sm font-semibold text-navy transition hover:bg-orange/5 hover:text-orange"
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                          Create Account
                        </NavLink>
                      </motion.div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePostFreeProperty}
                    className="header-btn-adissia px-5 py-2 rounded-lg text-sm transition-all duration-300 font-bold flex items-center gap-2 relative"
                  >
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white free-blink-badge pointer-events-none uppercase tracking-wider shadow-md">
                      Free
                    </span>
                    <FlagIcon className="h-4 w-4" />
                    <span>Post property</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 lg:hidden">
              {canShowSavedShortcut ? (
                <NavLink
                  to="/dashboard?tab=saved"
                  onClick={() => {
                    scrollToTop();
                    closeMenu();
                  }}
                  className="inline-flex rounded-lg border border-slate-200 p-1.5 text-navy transition hover:border-orange hover:text-orange"
                  aria-label="Saved properties"
                  title="Saved properties"
                >
                  <BookmarkIcon className="h-4 w-4" />
                </NavLink>
              ) : null}
              {!isAuthenticated ? (
                <NavLink
                  to="/auth"
                  onClick={scrollToTop}
                  className="hidden items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold text-navy transition hover:text-orange xs:inline-flex sm:text-sm"
                >
                  Login
                </NavLink>
              ) : null}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-navy hover:bg-surface focus:outline-none transition-all duration-300"
                onClick={() => setMobileMenuOpen((value) => !value)}
                style={{ width: "32px", height: "32px" }}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="relative w-5 h-4 flex flex-col justify-between items-center">
                  <span className={`block h-[2px] w-full bg-navy rounded-full transform transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                  <span className={`block h-[2px] w-full bg-navy rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-[2px] w-full bg-navy rounded-full transform transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-b border-slate-200 bg-white px-4 pb-4 lg:hidden">
          <div className="mx-auto max-h-[calc(100dvh-5rem)] max-w-[1440px] overflow-y-auto py-3">
            <nav className="flex flex-col gap-1">{navLinks.map(renderMobileLink)}</nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
              <NavLink
                to={dashboardPath}
                onClick={() => {
                  scrollToTop();
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-navy"
              >
                <Squares2X2Icon className="h-5 w-5" />
                Dashboard
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
                  Saved Properties
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
                  Free
                </span>
                <FlagIcon className="h-5 w-5" />
                <span>Post your free property</span>
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
                    Login
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
                    Create Account
                  </NavLink>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-navy"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
