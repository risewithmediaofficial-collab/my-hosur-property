import { NavLink } from "react-router-dom";
import { primaryNavLinks } from "../constants/navigation";
import { BuildingOffice2Icon, EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";

const serviceLinks = [
  { label: "Buy Property in Hosur", to: "/listings?intent=buy" },
  { label: "Rent Property in Hosur", to: "/listings?intent=rent" },
  { label: "New Projects in Hosur", to: "/listings?intent=new-project" },
  { label: "Post Property Listing", to: "/post-property" },
  { label: "About MyHosurProperty", to: "/about" },
];

const Footer = () => (
  <footer className="mt-12 border-t border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.62)_0%,rgba(248,243,236,0.96)_100%)] text-slate-600 backdrop-blur-xl">
    <div className="w-full px-4 py-10 sm:px-5 lg:px-6 lg:py-12">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/60 bg-[linear-gradient(145deg,#111827,#334155)] text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
              <BuildingOffice2Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900">MyHosurProperty</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#9a7441]">Professional platform</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-slate-500">
            A refined property platform for verified listings, calmer discovery, and smoother buyer-owner communication in Hosur.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Navigation</h4>
          <nav className="flex flex-col gap-3">
            {primaryNavLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="text-sm text-slate-500 transition hover:text-slate-900">
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Services</h4>
          <nav className="flex flex-col gap-3" aria-label="Footer services">
            {serviceLinks.map((service) => (
              <NavLink key={service.to} to={service.to} className="text-sm text-slate-500 transition hover:text-slate-900">
                {service.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Contact</h4>
          <div className="space-y-4 text-sm text-slate-500">
            <a href="mailto:support@myhosurproperty.com" className="flex items-start gap-3 transition hover:text-slate-900">
              <EnvelopeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9a7441]" />
              <span>support@myhosurproperty.com</span>
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 transition hover:text-slate-900">
              <PhoneIcon className="h-4 w-4 flex-shrink-0 text-[#9a7441]" />
              <span>+91 98765 43210</span>
            </a>
            <div className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#9a7441]" />
              <span>Hosur, Krishnagiri District, Tamil Nadu 635109, India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright 2026 MyHosurProperty. All rights reserved.</p>
        <div className="flex flex-wrap gap-4">
          <NavLink to="/about" className="transition hover:text-slate-900">About Us</NavLink>
          <NavLink to="/listings" className="transition hover:text-slate-900">Browse Listings</NavLink>
          <NavLink to="/auth" className="transition hover:text-slate-900">Sign In</NavLink>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
