import { useState } from "react";
import toast from "react-hot-toast";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "../components/AppIcons";
import PageHero from "../components/PageHero";
import SeoHead from "../components/SeoHead";
import { FloatingInput } from "../components/ui/input";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_NUMBERS } from "../constants/contactInfo";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import useScrollAnimation from "../hooks/useScrollAnimation";

/* Department / enquiry type rows matching reference table style */
const enquiryRows = [
  { label: "Main / Director - 1", phone: "+91 81109 52245" },
  { label: "Director - 2 (Raja)", phone: "+91 99940 05086" },
  { label: "To Buy or Business Enquire", phone: "+91 99940 05086" },
  { label: "To Sell", phone: "+91 91501 00499" },
  { label: "For Property Listing", phone: "+91 91501 00499" },
  { label: "For Rental Enquire", phone: "+91 91501 00477" },
  { label: "For Office & Home Service Enquire", phone: "+91 91501 00477" },
  { label: "To Reach our Team", phone: "+91 82489 18906" },
];

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
    }, 1200);
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

      {/* ── Main contact section: form (left) + info (right) ── */}
      <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 gsap-section">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

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
                  className="site-button-primary mt-2 w-fit rounded-xl px-8 py-3 text-sm font-bold disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Let's Connect"}
                </button>
              </form>
            </div>

            {/* RIGHT – Get In Touch info */}
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div>
                <h2 className="text-3xl font-bold text-navy leading-tight">
                  Get In Touch<br />With Us
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 max-w-sm">
                  Our team is here to assist you with clarity and care. Reach out via call, email, or by filling out the form. Let's make your property journey smooth and hassle-free.
                </p>
              </div>

              {/* Phone + Email quick links */}
              <div className="flex flex-wrap gap-4">
                {CONTACT_PHONE_NUMBERS.map((phone) => (
                  <a
                    key={phone.tel}
                    href={`tel:${phone.tel}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy/5 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
                  >
                    <PhoneIcon className="h-4 w-4 text-orange flex-shrink-0" />
                    {phone.display}
                  </a>
                ))}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy/5 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
                >
                  <EnvelopeIcon className="h-4 w-4 text-orange flex-shrink-0" />
                  {CONTACT_EMAIL}
                </a>
              </div>

              {/* Enquiry table */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {enquiryRows.map((row, idx) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-5 py-3.5 text-sm ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                  >
                    <span className="text-slate-600 font-medium">{row.label}</span>
                    <span className="font-semibold text-navy">{row.phone}</span>
                  </div>
                ))}
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
