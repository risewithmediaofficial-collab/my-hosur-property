import { NavLink } from "react-router-dom";
import { primaryNavLinks } from "../constants/navigation";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Footer = () => (
  <footer className="mt-16 border-t border-white/70 bg-transparent pb-5">
    <div className="glass-panel uiverse-card mx-auto grid max-w-7xl gap-6 rounded-3xl px-4 py-10 text-sm text-ink/70 md:grid-cols-3 md:px-8">
      <div>
        <h4 className="font-bold text-ink inline-flex items-center gap-2">
          <BuildingOffice2Icon className="h-5 w-5 text-sage" />
          MyHosurProperty
        </h4>
        <p className="mt-2">Minimal, reliable, and professional property discovery and listing platform.</p>
      </div>
      <div>
        <h4 className="font-bold text-ink">Navigation</h4>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
          {primaryNavLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="text-ink/80 hover:text-ink">
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-ink">Contact & Address</h4>
        <p className="mt-2 inline-flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" />support@myhosurproperty.com</p>
        <p className="mt-1 inline-flex items-center gap-2"><MapPinIcon className="h-4 w-4" />Hosur, Krishnagiri District, Tamil Nadu, India</p>
      </div>
    </div>
    <div className="mx-auto mt-4 max-w-7xl px-4 text-center text-xs font-semibold text-ink/60 md:px-8">
      © 2026 MyHosurProperty. All Rights Reserved.
    </div>
  </footer>
);

export default Footer;
