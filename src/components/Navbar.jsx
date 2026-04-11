import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { primaryNavLinks } from "../constants/navigation";
import {
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  KeyIcon,
  PlusCircleIcon,
  Squares2X2Icon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const navIconMap = {
  Home: HomeIcon,
  "About Us": InformationCircleIcon,
  Plans: CurrencyRupeeIcon,
  Buy: KeyIcon,
  Rent: BuildingOffice2Icon,
  "Post Property": PlusCircleIcon,
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Logo */}
        <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-2 font-bold text-lg text-slate-900 hover:text-blue-600 transition">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md">
            <BuildingOffice2Icon className="h-5 w-5" />
          </div>
          MyHosurProperty
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {primaryNavLinks.map((item) => {
            const Icon = navIconMap[item.label] || HomeIcon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Auth/Dashboard Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <NavLink 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow-sm" 
                to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              >
                <Squares2X2Icon className="h-4 w-4" />
                {["agent", "broker"].includes(user?.role) ? "Broker" : "Dashboard"}
              </NavLink>
              <button 
                onClick={onLogout} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <NavLink 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition shadow-sm" 
              to="/auth"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Login / Signup
            </NavLink>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-lg z-40">
          <div className="px-4 py-4 flex flex-col gap-3">
            <nav className="flex flex-col gap-1">
              {primaryNavLinks.map((item) => {
                const Icon = navIconMap[item.label] || HomeIcon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            
            <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <NavLink 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition" 
                    to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                    {["agent", "broker"].includes(user?.role) ? "Broker Dashboard" : "My Dashboard"}
                  </NavLink>
                  <button 
                    onClick={onLogout} 
                    className="flex justify-center items-center gap-2 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <NavLink 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition" 
                  to="/auth"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Login / Signup
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
