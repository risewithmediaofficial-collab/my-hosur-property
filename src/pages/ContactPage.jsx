import { useState } from "react";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  ThreadsIcon,
  WhatsAppIcon,
  XIcon,
  YouTubeIcon,
} from "../components/AppIcons";
import PageHero from "../components/PageHero";
import SeoHead from "../components/SeoHead";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_NUMBERS,
  SOCIAL_LINKS,
} from "../constants/contactInfo";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import useScrollAnimation from "../hooks/useScrollAnimation";

const ContactPage = () => {
  useScrollAnimation();
  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Contact", to: "/contact" },
  ];

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thank you! We'll connect with you shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 250);
  };

  return (
    <main className="page-shell w-full">
      <SeoHead
        title="Contact MyHosurProperty"
        description="Contact MyHosurProperty for property assistance, real-estate services, and verified listing support in Hosur."
        keywords="contact MyHosurProperty, Hosur property contact, real estate contact Hosur"
        canonicalPath="/contact"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <PageHero
        tag="Contact us"
        title="Talk to My Hosur Property."
        description="Reach our team for property discovery, buying and selling support, registration help, loans, construction coordination, and local real-estate services."
        className="gsap-section"
      />

      {/* ── Main contact section: form (left) + info with inline scroll (right) ── */}
      <section className="bg-white px-4 py-8 sm:px-8 sm:py-14 lg:px-10 gsap-section">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 lg:items-start">

            {/* LEFT – Contact Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card gsap-card">
              <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-orange block" />
                Send Us A Message
              </h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Name <span className="text-orange">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    E-Mail <span className="text-orange">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Phone Number <span className="text-orange">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all">
                    <span className="text-sm font-bold text-slate-500 mr-2 flex-shrink-0">🇮🇳 +91 •</span>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      required
                      className="w-full border-0 bg-transparent py-1 text-sm font-medium text-navy outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Type your message or enquiry details..."
                    className="site-input w-full min-h-[110px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all resize-none"
                  />
                </div>

                <p className="text-xs text-slate-500 leading-5">
                  By submitting this form, I authorize MyHosurProperty and its representatives to contact me via Email, SMS, WhatsApp, or Call with updates and offers.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="site-button-primary mt-2 w-full sm:w-fit rounded-xl px-8 py-3 text-sm font-bold disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Let's Connect"}
                </button>
              </form>
            </div>

            {/* RIGHT – Get In Touch Section Card with Inline Scroll */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-card flex flex-col gap-5 lg:max-h-[640px] lg:overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">For enquiries</p>
                <h2 className="text-3xl font-bold text-navy leading-tight">
                  Get In Touch<br />With Us
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Our team is here to assist you with clarity and care. Reach out via call, email, or by filling out the form. Let's make your property journey smooth and hassle-free.
                </p>
              </div>

              {/* Enquiry contacts */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-navy">Enquiry Contacts</p>
                <div className="grid gap-3">
                  {CONTACT_PHONE_NUMBERS.map((phone) => (
                    <a
                      key={`${phone.role}-${phone.tel}`}
                      href={`tel:${phone.tel}`}
                      className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange hover:bg-white"
                    >
                      <span className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">
                        {phone.role}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                        <PhoneIcon className="h-4 w-4 text-orange flex-shrink-0" />
                        {phone.display}
                      </span>
                    </a>
                  ))}
                </div>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange hover:bg-white"
                >
                  <span className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">Email</span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
                    <EnvelopeIcon className="h-4 w-4 text-orange flex-shrink-0" />
                    {CONTACT_EMAIL}
                  </span>
                </a>
              </div>

              {/* Social Media Links */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Connect On Social Media</p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    Instagram
                  </a>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <FacebookIcon className="h-4 w-4" />
                    Facebook
                  </a>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
                  >
                    <YouTubeIcon className="h-4 w-4" />
                    YouTube
                  </a>
                  <a
                    href={SOCIAL_LINKS.threads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <ThreadsIcon className="h-4 w-4" />
                    Threads
                  </a>
                  <a
                    href={SOCIAL_LINKS.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black"
                  >
                    <XIcon className="h-4 w-4" />
                    X (Twitter)
                  </a>
                </div>
              </div>

              {/* WhatsApp QR & Direct Message Card */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
                <div className="text-center sm:text-left">
                  <span className="inline-block rounded-md bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-1.5">
                    WhatsApp Desk
                  </span>
                  <h3 className="text-base font-bold text-navy">Instant WhatsApp Support</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Click below to start a direct WhatsApp conversation with our support team.
                  </p>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-xs"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Send WhatsApp Message
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 gsap-card">
                <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange" />
                <p className="text-sm leading-7 text-slate-600">{CONTACT_ADDRESS}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
