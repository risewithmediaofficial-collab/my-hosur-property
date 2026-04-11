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
    <header className="sticky top-0 z-50 border-b border-[#dbe9f8] bg-[#f6fbff]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-base md:px-4 md:py-2 md:text-lg font-extrabold tracking-tight shadow-soft relative z-50">
          <BuildingOffice2Icon className="h-4 w-4 md:h-5 md:w-5 text-[#5a95cb] animate-float-slow" />
          MyHosurProperty
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-[#dbe9f8] bg-white/85 p-1 text-sm font-semibold shadow-soft md:flex">
          {primaryNavLinks.map((item) => {
            const Icon = navIconMap[item.label] || HomeIcon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `uiverse-btn flex items-center gap-1.5 rounded-full px-3 py-2 ${isActive ? "bg-[#a7c6ed] text-ink" : "text-ink/75 hover:bg-[#eef5ff] hover:text-ink"}`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Auth/Dashboard Buttons */}
        <div className="hidden items-center gap-2 text-sm md:flex">
          {isAuthenticated ? (
            <>
              <NavLink className="uiverse-btn rounded-full bg-ink px-4 py-2 font-semibold text-stone shadow-soft inline-flex items-center gap-1.5" to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}>
                <Squares2X2Icon className="h-4 w-4" />
                {["agent", "broker"].includes(user?.role) ? "Broker" : "Dashboard"}
              </NavLink>
              <button onClick={onLogout} className="uiverse-btn rounded-full border border-[#d4e4f6] bg-white px-4 py-2 font-semibold text-ink/80 inline-flex items-center gap-1.5">
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <NavLink className="uiverse-btn rounded-full bg-ink px-4 py-2 font-semibold text-stone shadow-soft inline-flex items-center gap-1.5" to="/auth">
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Login / Signup
            </NavLink>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="relative z-50 md:hidden p-2 text-ink/80 rounded-full hover:bg-white transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full min-h-screen bg-[#f6fbff] px-4 py-4 flex flex-col gap-3 shadow-xl transform origin-top animate-fade-down z-40 border-t border-[#dbe9f8]">
          <nav className="flex flex-col gap-2 font-semibold bg-white p-4 rounded-2xl shadow-soft border border-[#dbe9f8]">
            {primaryNavLinks.map((item) => {
              const Icon = navIconMap[item.label] || HomeIcon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 ${isActive ? "bg-[#a7c6ed]/40 text-ink" : "text-ink/75 hover:bg-[#eef5ff]"}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="bg-white p-4 rounded-2xl shadow-soft border border-[#dbe9f8] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <NavLink 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-stone" 
                  to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                  {["agent", "broker"].includes(user?.role) ? "Broker Dashboard" : "My Dashboard"}
                </NavLink>
                <button 
                  onClick={onLogout} 
                  className="flex justify-center items-center gap-2 rounded-xl border border-[#d4e4f6] px-4 py-3 font-semibold text-ink/80"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <NavLink 
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center items-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-stone shadow-soft" 
                to="/auth"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Login / Signup
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
