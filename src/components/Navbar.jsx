import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { primaryNavLinks } from "../constants/navigation";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingOffice2Icon,
  CurrencyRupeeIcon,
  HomeIcon,
  InformationCircleIcon,
  KeyIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Squares2X2Icon as Squares2X2SolidIcon } from "@heroicons/react/24/solid";

const navIconMap = {
  Home: HomeIcon,
  "About Us": InformationCircleIcon,
  Plans: CurrencyRupeeIcon,
  Buy: KeyIcon,
  Rent: BuildingOffice2Icon,
  "Post Property": PlusCircleIcon,
  Properties: BuildingOffice2Icon,
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  const closeMenu = () => setMobileMenuOpen(false);

  const onLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const renderDesktopLink = (item) => {
    const Icon = navIconMap[item.label] || HomeIcon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            isActive
              ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-blue-400 group-hover:text-blue-600"}`} />
            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  const renderMobileLink = (item) => {
    const Icon = navIconMap[item.label] || HomeIcon;
    const isActive = location.pathname === item.to;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={closeMenu}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-500"}`} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/96 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <NavLink to="/" onClick={closeMenu} className="inline-flex min-w-0 items-center gap-3 text-slate-900">
          <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[1.1rem] bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)]">
            <BuildingOffice2Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-slate-900">MyHosurProperty</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-500">Real Estate</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-2 py-2 lg:flex">
          {primaryNavLinks.map(renderDesktopLink)}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
                      : "border border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => {
                  const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                  return (
                    <>
                      <DashboardIcon className="h-4 w-4" />
                      <span>{["agent", "broker"].includes(user?.role) ? "Broker Dashboard" : "Dashboard"}</span>
                    </>
                  );
                }}
              </NavLink>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)] transition hover:from-blue-700 hover:to-blue-800"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sign in
            </NavLink>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-2xl border border-blue-100 bg-white p-2.5 text-slate-700 transition hover:bg-blue-50 lg:hidden"
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-blue-100 bg-white lg:hidden">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
            <nav className="flex flex-col gap-2">{primaryNavLinks.map(renderMobileLink)}</nav>
            <div className="border-t border-blue-100 pt-3">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to={dashboardPath}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive ? "bg-blue-600 text-white" : "border border-blue-100 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      }`
                    }
                  >
                    {({ isActive }) => {
                      const DashboardIcon = isActive ? Squares2X2SolidIcon : Squares2X2Icon;
                      return (
                        <>
                          <DashboardIcon className="h-5 w-5" />
                          <span>{["agent", "broker"].includes(user?.role) ? "Broker Dashboard" : "Dashboard"}</span>
                        </>
                      );
                    }}
                  </NavLink>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign in / Create account
                </NavLink>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
