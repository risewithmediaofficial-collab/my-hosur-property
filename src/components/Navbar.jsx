import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { primaryNavLinks } from "../constants/navigation";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  HomeIcon,
  InformationCircleIcon,
  PhoneIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Squares2X2Icon as Squares2X2SolidIcon } from "@heroicons/react/24/solid";

const navIconMap = {
  "Our Services": BriefcaseIcon,
  "About Us": InformationCircleIcon,
  Contact: PhoneIcon,
  "List My Property": PlusCircleIcon,
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  useBodyScrollLock(mobileMenuOpen);

  const closeMenu = () => setMobileMenuOpen(false);
  
  const scrollToTop = () => {
    // Temporarily disable smooth scroll for immediate scroll to top
    const htmlElement = document.documentElement;
    const originalScroll = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    
    // Restore smooth scroll after a brief delay
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

  const navLinks = useMemo(() => primaryNavLinks, []);

  const renderDesktopLink = (item) => {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={scrollToTop}
        className={({ isActive }) =>
          `group relative inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold transition ${
            isActive
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span>{item.label}</span>
            <span
              className={`absolute inset-x-3 bottom-1 h-px origin-left bg-white transition duration-300 ${
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </>
        )}
      </NavLink>
    );
  };

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
          `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${
            isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/50"}`} />
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[#06233b]">
      <div className="px-5 py-3 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 bg-transparent">
          <NavLink
            to="/"
            onClick={() => {
              scrollToTop();
              closeMenu();
            }}
            className="inline-flex min-w-0 items-center gap-3 text-white"
          >
            <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center text-white">
              <BuildingOffice2Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight text-white">MyHosurProperty</p>
              <p className="hidden truncate text-[9px] font-semibold uppercase tracking-[0.26em] text-white/55 sm:block">Real Estate</p>
            </div>
          </NavLink>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navLinks.map(renderDesktopLink)}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink
              to={dashboardPath}
              onClick={scrollToTop}
              className={({ isActive }) =>
                `group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => {
                const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                return (
                  <>
                    <DashboardIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </>
                );
              }}
            </NavLink>

            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-transparent px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <NavLink
                to="/auth"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-md bg-[#0b74d1] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#075da8]"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign in
              </NavLink>
            )}
          </div>

          <button
            type="button"
            className="inline-flex rounded-md border border-white/20 p-2 text-white transition hover:bg-white/10 lg:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="px-4 pb-3 sm:px-5 lg:hidden">
          <div className="mx-auto max-h-[calc(100dvh-4.75rem)] max-w-[1440px] overflow-y-auto border-t border-white/10 bg-[#06233b] px-1 py-4 sm:px-2">
            <div className="flex flex-col gap-3">
              <nav className="flex flex-col gap-2">
                {navLinks.map(renderMobileLink)}
                <NavLink
                  to={dashboardPath}
                  onClick={() => {
                    scrollToTop();
                    closeMenu();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition ${
                      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => {
                    const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                    return (
                      <>
                        <DashboardIcon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/50"}`} />
                        <span>Dashboard</span>
                      </>
                    );
                  }}
                </NavLink>
              </nav>

              <div className="pt-3 shadow-[inset_0_1px_0_rgba(16,95,104,0.07)]">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/auth"
                    onClick={() => {
                      scrollToTop();
                      closeMenu();
                    }}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#0b74d1] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#075da8]"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Sign in / Create account
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
