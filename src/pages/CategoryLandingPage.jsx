import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import PropertyCard from "../components/PropertyCard";
import ContactModal from "../components/ContactModal";
import Loader from "../components/Loader";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { fetchProperties } from "../services/api/propertyApi";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildRealEstateAgentSchema,
  buildWebsiteSchema,
} from "../utils/seo";
import {
  ArrowRightIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WhatsAppIcon,
} from "../components/AppIcons";
import { CONTACT_PHONE_NUMBERS, SOCIAL_LINKS } from "../constants/contactInfo";
import { getCategoryLandingBySlug } from "../constants/categoryLandingData";

const CategoryLandingPage = ({ pageSlug }) => {
  const location = useLocation();
  // Derive slug from prop or current pathname (strip leading slash)
  const currentSlug = pageSlug || location.pathname.replace(/^\/+/, "");
  const pageData = getCategoryLandingBySlug(currentSlug);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useScrollAnimation(null, properties.length);

  useEffect(() => {
    if (!pageData) return;
    const controller = new AbortController();
    setLoading(true);

    const loadProperties = async () => {
      try {
        const queryParams = { limit: 12 };
        if (pageData.categoryFilter && pageData.categoryFilter !== "all") {
          queryParams.category = pageData.categoryFilter;
        }
        if (pageData.intentFilter) {
          queryParams.intent = pageData.intentFilter;
        }

        const res = await fetchProperties(queryParams, undefined, controller.signal);
        if (!controller.signal.aborted) {
          setProperties(res.items || []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setProperties([]);
          console.error("Failed to load landing properties:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProperties();
    return () => controller.abort();
  }, [pageData]);

  const breadcrumbs = useMemo(() => [
    { label: "Home", to: "/" },
    { label: "Hosur Real Estate", to: "/hosur-real-estate" },
    ...(pageData && pageData.slug !== "hosur-real-estate"
      ? [{ label: pageData.targetKeyword, to: `/${pageData.slug}` }]
      : []),
  ], [pageData]);

  if (!pageData) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center px-4">
        <h1 className="text-3xl font-bold text-navy">Page Not Found</h1>
        <p className="mt-4 text-slate-600">The requested real estate category page is not available.</p>
        <Link to="/" className="site-button-primary mt-6 inline-block">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const {
    targetKeyword,
    seoTitle,
    metaDescription,
    h1,
    badge,
    subtitle,
    heroStats = [],
    overview = [],
    keyHighlights = [],
    pricingTable = [],
    topLocalities = [],
    buyerChecklist = [],
    faqs = [],
    relatedLandingPages = [],
  } = pageData;

  const primaryPhone = CONTACT_PHONE_NUMBERS[0] || { display: "+91 91501 00499", tel: "+919150100499" };

  return (
    <main className="page-shell w-full bg-slate-50/50">
      <SeoHead
        title={seoTitle}
        description={metaDescription}
        keywords={`${targetKeyword}, real estate in Hosur, Hosur properties, buy property Hosur, Hosur real estate investment, DTCP approved Hosur, MyHosurProperty`}
        canonicalPath={`/${pageData.slug}`}
        schema={[
          buildWebsiteSchema(),
          buildRealEstateAgentSchema(),
          buildBreadcrumbSchema(breadcrumbs),
          buildFaqSchema(faqs),
        ]}
      />

      {/* ── BREADCRUMBS ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-2.5 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.to} className="flex items-center gap-2">
                {idx > 0 && <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-navy">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="hover:text-orange transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-slate-900 text-white px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-[1440px]">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/20 border border-orange/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange">
              <SparklesIcon className="h-3.5 w-3.5" />
              {badge}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              {h1}
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#live-listings"
                className="site-button-primary rounded-xl px-6 py-3 text-sm font-bold shadow-lg"
              >
                Browse Listings ({properties.length > 0 ? `${properties.length}+ Available` : "Explore"})
              </a>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 px-5 py-3 text-sm font-bold text-white transition-all"
              >
                <PhoneIcon className="h-4 w-4 text-orange" />
                Request Callback
              </button>
              <a
                href={`tel:${primaryPhone.tel}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 px-4 py-3 text-sm font-bold text-white transition-all"
                title={`Call ${primaryPhone.display}`}
              >
                <PhoneIcon className="h-4 w-4 text-emerald-400" />
                <span>Call Specialist</span>
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-all"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Quick Stats Grid */}
          {heroStats.length > 0 && (
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-white/10 pt-8">
              {heroStats.map((stat, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-xs">
                  <p className="text-xl sm:text-2xl font-black text-orange">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-300 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LIVE PROPERTY LISTINGS SECTION ── */}
      <section id="live-listings" className="px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange">Verified Inventory</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
                Verified {targetKeyword} in Hosur
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Real properties inspected by MyHosurProperty with legal title scrutiny.
              </p>
            </div>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 text-sm font-bold text-orange hover:text-navy transition-colors self-start sm:self-auto"
            >
              <span>View All Properties in Hosur</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader text="Loading verified listings..." size={36} />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
              <CheckBadgeIcon className="mx-auto h-12 w-12 text-orange/80" />
              <h3 className="mt-3 text-lg font-bold text-navy">New Listings Being Verified</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Our local verification team is currently inspecting fresh {targetKeyword.toLowerCase()} in Hosur.
                Call our advisor directly for off-market and pre-launch options.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="site-button-primary text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl"
                >
                  Get Instant Property Alerts
                </button>
                <Link
                  to="/listings"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-navy hover:bg-slate-50 transition"
                >
                  Browse All Hosur Properties
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MARKET OVERVIEW & HIGHLIGHTS ── */}
      <section className="bg-white border-y border-slate-200 px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1440px] grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">Market Insights</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Hosur Real Estate Market Overview &amp; Growth Trends
            </h2>
            {overview.map((para, i) => (
              <p key={i} className="text-sm sm:text-base leading-relaxed text-slate-700">
                {para}
              </p>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-navy mb-4">Why Choose MyHosurProperty</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {keyHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                    <ShieldCheckIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{hl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Benchmark Table */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange">Price Trends</span>
                <h3 className="text-lg font-bold text-navy">Current Hosur Benchmark Rates</h3>
              </div>
              <DocumentTextIcon className="h-6 w-6 text-slate-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-bold">Locality</th>
                    <th className="pb-2 font-bold">Price Range</th>
                    <th className="pb-2 font-bold text-right">Demand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-navy">
                  {pricingTable.map((row, i) => (
                    <tr key={i} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">{row.area}</td>
                      <td className="py-2.5 text-slate-700">{row.priceRange}</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded-full bg-orange/10 text-orange px-2 py-0.5 text-[11px] font-bold">
                          {row.demand}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-xl bg-navy text-white p-4 text-center">
              <p className="text-xs text-slate-300">Need an accurate valuation for your property?</p>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="mt-2 text-xs font-bold text-orange hover:underline inline-flex items-center gap-1"
              >
                <span>Request Free Hosur Property Valuation</span>
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOP LOCALITIES FOR THIS CATEGORY ── */}
      {topLocalities.length > 0 && (
        <section className="px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-[1440px]">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">Location Guides</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Top Hosur Localities for {targetKeyword}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore area-specific amenities, price per sq.ft, and growth drivers across Hosur neighborhoods.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {topLocalities.map((loc) => (
                <Link
                  key={loc.slug}
                  to={`/location/${loc.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-orange hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <MapPinIcon className="h-5 w-5 text-orange flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-orange">
                      {loc.tag}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm sm:text-base font-bold text-navy group-hover:text-orange transition-colors">
                    {loc.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <span>Explore properties</span>
                    <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BUYER'S VERIFICATION CHECKLIST ── */}
      {buyerChecklist.length > 0 && (
        <section className="bg-slate-900 text-white px-4 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-orange">Due Diligence</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Essential Buyer Checklist for {targetKeyword}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Follow these critical legal verification steps before finalizing any real estate transaction in Hosur, Tamil Nadu.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buyerChecklist.map((item, idx) => (
                <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-5 backdrop-blur-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {idx + 1}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQS SECTION ── */}
      {faqs.length > 0 && (
        <section className="px-4 py-12 sm:px-8 sm:py-16 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-[1440px]">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">Answers You Need</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
              Frequently Asked Questions About {targetKeyword}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Clear answers to common questions regarding approvals, pricing, and registration in Hosur.
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-xs">
                  <h3 className="text-base font-bold text-navy flex items-start gap-2">
                    <span className="text-orange font-black">Q.</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED LANDING PAGES & INTERNAL LINKS ── */}
      {relatedLandingPages.length > 0 && (
        <section className="px-4 py-8 sm:px-8 bg-slate-100 border-t border-slate-200">
          <div className="mx-auto max-w-[1440px]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Explore Related Real Estate Categories in Hosur
            </p>
            <div className="flex flex-wrap gap-2.5">
              {relatedLandingPages.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy hover:border-orange hover:text-orange transition-all shadow-2xs"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/blog"
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy hover:border-orange hover:text-orange transition-all shadow-2xs"
              >
                Hosur Property Buying Guides &amp; Blog
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT MODAL ── */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        propertyTitle={`Enquiry for ${targetKeyword} in Hosur`}
      />
    </main>
  );
};

export default CategoryLandingPage;
