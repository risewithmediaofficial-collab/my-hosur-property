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
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

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
          `group relative inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            isActive
              ? "text-slate-900"
              : "text-slate-500 hover:text-slate-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span>{item.label}</span>
            <span
              className={`absolute inset-x-4 bottom-1 h-px origin-left bg-slate-900 transition duration-300 ${
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
          `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="px-4 py-3 sm:px-5 lg:px-6">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_22px_rgba(17,17,17,0.04)] sm:px-5">
          <NavLink
            to="/"
            onClick={() => {
              scrollToTop();
              closeMenu();
            }}
            className="inline-flex min-w-0 items-center gap-3 text-slate-900"
          >
            <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
              <BuildingOffice2Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">MyHosurProperty</p>
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Real Estate</p>
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
                `group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-900 text-slate-900"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
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
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-1.5 hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <NavLink
                to="/auth"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-1.5 hover:bg-black"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign in
              </NavLink>
            )}
          </div>

          <button
            type="button"
            className="inline-flex rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="px-4 pb-3 sm:px-5 lg:hidden">
          <div className="mx-auto max-h-[calc(100dvh-4.75rem)] max-w-[1440px] overflow-y-auto rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_30px_rgba(17,17,17,0.05)] sm:px-5">
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
                    `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => {
                    const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                    return (
                      <>
                        <DashboardIcon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                        <span>Dashboard</span>
                      </>
                    );
                  }}
                </NavLink>
              </nav>

              <div className="border-t border-slate-200/70 pt-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                    className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
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
