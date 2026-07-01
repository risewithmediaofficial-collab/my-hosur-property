import { NavLink } from "react-router-dom";
import { primaryNavLinks } from "../constants/navigation";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_NUMBERS } from "../constants/contactInfo";
import BrandLogo from "./BrandLogo";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "./AppIcons";

const serviceLinks = [
  { label: "Our Services", to: "/services" },
  { label: "Contact", to: "/contact" },
  { label: "Buy Property in Hosur", to: "/listings?intent=buy" },
  { label: "Rent Property in Hosur", to: "/listings?intent=rent" },
  { label: "New Projects in Hosur", to: "/listings?intent=new-project" },
  { label: "Post Property Listing", to: "/post-property" },
  { label: "About MyHosurProperty", to: "/about" },
];

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

const Footer = () => (
  <footer className="bg-navy text-white">
    <div className="px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1.1fr]">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex flex-col items-start gap-1">
              <BrandLogo className="h-10 w-auto max-w-[180px] sm:h-12" />
              <span className="text-[11px] font-medium leading-none text-white/60">
                Powered by <span className="font-bold text-white">Gyes Construction</span>
              </span>
            </div>
            <p className="max-w-sm text-sm leading-7 text-white/80">
              A refined property platform for verified listings, clearer property discovery, and reliable buyer-owner communication in Hosur.
            </p>
            <p className="text-sm font-semibold text-orange">My Hosur Property - Trusted Real Estate Partner</p>
          </div>

          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Quick links</h4>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-3" aria-label="Footer navigation">
              {[
                { label: "Home", to: "/" },
                { label: "Our Services", to: "/services" },
                { label: "Bank Loans", to: "/bank-loans" },
                { label: "Plans", to: "/plans" },
                { label: "About Us", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "Post Property", to: "/post-property" },
                { label: "Buy Property", to: "/listings?intent=buy" },
                { label: "Rent Property", to: "/listings?intent=rent" },
                { label: "New Projects", to: "/listings?intent=new-project" },
              ].map((link) => (
                <NavLink key={link.to + link.label} to={link.to} onClick={scrollToTop} className="text-sm text-white/80 transition hover:text-orange">
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Contact</h4>
            <div className="space-y-4 text-sm text-white/90">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 transition hover:text-orange">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0 text-orange" />
                <span className="leading-5">{CONTACT_EMAIL}</span>
              </a>
              {CONTACT_PHONE_NUMBERS.map((phone) => (
                <a key={phone.tel} href={`tel:${phone.tel}`} className="flex items-center gap-3 transition hover:text-orange">
                  <PhoneIcon className="h-4 w-4 flex-shrink-0 text-orange" />
                  <span className="leading-5">{phone.display}</span>
                </a>
              ))}
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-1 h-4 w-4 flex-shrink-0 text-orange" />
                <span className="leading-5">{CONTACT_ADDRESS}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 MyHosurProperty. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <NavLink to="/about" onClick={scrollToTop} className="transition hover:text-orange">
              About Us
            </NavLink>
            <NavLink to="/contact" onClick={scrollToTop} className="transition hover:text-orange">
              Contact
            </NavLink>
            <NavLink to="/listings" onClick={scrollToTop} className="transition hover:text-orange">
              Browse Listings
            </NavLink>
            <NavLink to="/auth" onClick={scrollToTop} className="transition hover:text-orange">
              Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
