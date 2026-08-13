import { NavLink } from "react-router-dom";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_NUMBERS,
  SOCIAL_LINKS,
} from "../constants/contactInfo";
import BrandLogo from "./BrandLogo";
import {
  EnvelopeIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  ThreadsIcon,
  WhatsAppIcon,
  XIcon,  YouTubeIcon,} from "./AppIcons";

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

const Footer = () => {
  return (
    <footer className="bg-navy text-white">
      <div className="px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1.1fr_0.9fr]">
            {/* Column 1: Brand & Bio */}
            <div className="space-y-4 text-left">
              <div className="flex flex-col items-start text-left gap-1">
                <BrandLogo className="w-24 sm:w-36 max-w-[100px] sm:max-w-[150px] h-auto object-contain object-left block" />
                <span className="text-[11px] font-medium leading-none text-white/60 text-left">
                  Powered by <span className="font-bold text-white">Gyes Property &amp; Construction</span>
                </span>
              </div>
              <p className="max-w-sm text-sm leading-7 text-white/80">
                A refined property platform for verified listings, clearer property discovery, and reliable buyer-owner communication in Hosur.
              </p>
              <p className="text-sm font-semibold text-orange">My Hosur Property - Trusted Real Estate Partner</p>

              {/* Social Media Links */}
              <div className="pt-2">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/60">Follow Us</p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-orange hover:text-white"
                    title="Instagram"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-orange hover:text-white"
                    title="Facebook"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-orange hover:text-white"
                    title="YouTube"
                    aria-label="YouTube"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.threads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-orange hover:text-white"
                    title="Threads"
                    aria-label="Threads"
                  >
                    <ThreadsIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-orange hover:text-white"
                    title="X (Twitter)"
                    aria-label="X (Twitter)"
                  >
                    <XIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500"
                    title="Chat on WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
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

            {/* Column 3: Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Contact</h4>
              <div className="space-y-3.5 text-sm text-white/90">
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

            {/* Column 4: WhatsApp Support */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Connect on WhatsApp</h4>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-center">
                <p className="text-xs font-medium text-white/80 mb-2.5">
                  Chat with our team directly on WhatsApp for quick support.
                </p>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 w-full justify-center"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Direct WhatsApp Chat
                </a>
              </div>
            </div>
          </div>

          {/* SEO Location Links Matrix for Google Crawling */}
          <div className="mt-10 border-t border-white/10 pt-8">
            <h5 className="text-xs font-bold uppercase tracking-[0.18em] text-orange mb-3">
              Popular Hosur Property Locations &amp; Guides
            </h5>
            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              {[
                { name: "Anand Nagar Plots", slug: "anand-nagar-plots" },
                { name: "Bagalur Road Property", slug: "bagalur-road-property" },
                { name: "Mathigiri Plots", slug: "mathigiri-plots" },
                { name: "Mookandapalli Property", slug: "mookandapalli-property" },
                { name: "Zuzuvadi Land", slug: "zuzuvadi-land" },
                { name: "Shoolagiri Property", slug: "shoolagiri-property" },
                { name: "Rayakottai Road Plots", slug: "rayakottai-road-plots" },
                { name: "Hosur SIPCOT Property", slug: "hosur-sipcot-property" },
                { name: "TVS Nagar Plots", slug: "tvs-nagar-plots" },
                { name: "Titan Township Property", slug: "titan-township-property" },
                { name: "Denkanikottai Road Land", slug: "denkanikottai-road-land" },
                { name: "Chennathur Plots", slug: "chennathur-plots" },
                { name: "Kelamangalam Road Property", slug: "kelamangalam-road-property" },
                { name: "Avalapalli Land", slug: "avalapalli-land" },
                { name: "DTCP Plots Bagalur Road", slug: "dtcp-plots-bagalur-road" },
                { name: "Villas in Mathigiri", slug: "villas-in-mathigiri" },
                { name: "Land near SIPCOT Hosur", slug: "land-near-sipcot-hosur" },
                { name: "Best Real Estate Company in Hosur", slug: "best-real-estate-company-in-hosur" },
                { name: "Trusted Property Dealer in Hosur", slug: "trusted-property-dealer-in-hosur" },
              ].map((loc) => (
                <NavLink
                  key={loc.slug}
                  to={`/location/${loc.slug}`}
                  onClick={scrollToTop}
                  className="rounded bg-white/10 px-2.5 py-1 transition hover:bg-orange hover:text-white"
                >
                  {loc.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p>Copyright 2026 MyHosurProperty. All rights reserved.</p>
              <p className="mt-1 text-[11px] text-white/70">
                Developed with{" "}
                <a
                  href="https://risewithmedia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-orange hover:underline transition"
                >
                  risewithmedia.com
                </a>
              </p>
            </div>
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
};

export default Footer;
