import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_NUMBERS,
  SOCIAL_LINKS,
  WHATSAPP_QR_IMAGE,
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
  XIcon,
} from "./AppIcons";

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
  const [showQrModal, setShowQrModal] = useState(false);

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

            {/* Column 4: WhatsApp QR Code Card */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Connect on WhatsApp</h4>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-center">
                <p className="text-xs font-medium text-white/80 mb-2.5">Scan QR code to chat with us instantly</p>
                <div className="mx-auto w-32 h-32 overflow-hidden rounded-lg border-2 border-orange bg-white p-1 shadow-md">
                  <img
                    src={WHATSAPP_QR_IMAGE}
                    alt="WhatsApp QR Code — My Hosur Property"
                    className="h-full w-full object-contain cursor-pointer"
                    onClick={() => setShowQrModal(true)}
                  />
                </div>
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

      {/* QR Code Zoom Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative max-w-sm rounded-2xl bg-white p-6 text-center text-navy shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Scan WhatsApp QR Code</h3>
            <p className="mt-1 text-xs text-slate-500">Scan with your phone camera or WhatsApp to start messaging</p>
            <div className="my-4 mx-auto w-64 h-64 overflow-hidden rounded-xl border-2 border-orange bg-white p-2">
              <img src={WHATSAPP_QR_IMAGE} alt="WhatsApp QR Code" className="h-full w-full object-contain" />
            </div>
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Open WhatsApp Now
            </a>
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="mt-3 block w-full text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
