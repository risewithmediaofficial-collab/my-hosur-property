import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import SeoLocationLinks from "../components/SeoLocationLinks";
import PropertyCard from "../components/PropertyCard";
import ContactModal from "../components/ContactModal";
import Breadcrumbs from "../components/Breadcrumbs";
import Loader from "../components/Loader";
import { getSeoPageBySlug } from "../constants/seoLocations";
import { fetchProperties } from "../services/api/propertyApi";
import { slugify } from "../utils/format";
import { absoluteUrl } from "../utils/seo";
import { PhoneIcon, WhatsAppIcon, CheckBadgeIcon, ShieldCheckIcon, DocumentTextIcon } from "../components/AppIcons";
import { SOCIAL_LINKS, CONTACT_PHONE_NUMBERS } from "../constants/contactInfo";

const LocationSeoPage = () => {
  const { slug } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Look up predefined page details or build dynamic fallback based on slug
  const seoConfig = getSeoPageBySlug(slug) || {
    slug,
    title: slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Hosur Property",
    h1: `${slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Hosur Property"} in Hosur`,
    locationName: "Hosur",
    category: "all",
    intent: "buy",
    metaTitle: `${slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Hosur Property"} | Hosur Verified Properties`,
    metaDescription: `Discover top verified properties and plots for ${slug ? slug.replace(/-/g, " ") : "Hosur real estate"}. Clear title documents, direct owner listings, and DTCP approved layouts.`,
  };

  const { title, h1, locationName, category, metaTitle, metaDescription } = seoConfig;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProperties = async () => {
      try {
        const queryParams = { limit: 12 };
        if (locationName && locationName.toLowerCase() !== "hosur") {
          queryParams.search = locationName;
        }
        if (category && category !== "all") {
          queryParams.category = category;
        }

        const res = await fetchProperties(queryParams);
        if (isMounted) {
          setProperties(res.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch location properties:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProperties();
    return () => {
      isMounted = false;
    };
  }, [locationName, category]);

  // Schema.org FAQ data for Google Rich Snippets
  const faqList = [
    {
      question: `Why invest in ${title} in Hosur?`,
      answer: `${title} is one of the highest growth corridors in Hosur due to its strategic proximity to Hosur SIPCOT industrial hub, Electronic City Bangalore, NH44 highway connectivity, and rapid infrastructure expansion by Gyes Property & Construction.`,
    },
    {
      question: `Are DTCP plots and properties in ${locationName} verified?`,
      answer: `Yes, at MyHosurProperty, all plot layouts and land properties in ${locationName} undergo legal document verification, title deed inspection, and DTCP/RERA approval checks before listing.`,
    },
    {
      question: `What is the average plot price in ${locationName}, Hosur?`,
      answer: `Property and land prices in ${locationName} range depending on plot dimensions, main road frontage, and DTCP layout amenities. Contact our Hosur Property Experts for current market estimates and valuation services.`,
    },
    {
      question: `Can I get bank loan approval for lands in ${locationName}?`,
      answer: `Yes, properties listed on MyHosurProperty have clear titles and are eligible for bank loan approvals with leading financial partners including SBI, HDFC, ICICI, and LIC Housing Finance.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Hosur Locations",
        item: absoluteUrl("/listings"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: absoluteUrl(`/location/${slug}`),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <SeoHead
        title={metaTitle}
        description={metaDescription}
        canonicalPath={`/location/${slug}`}
        keywords={`${title}, ${locationName} plots, DTCP plots Hosur, Hosur real estate, Hosur Property Experts`}
        schema={[faqSchema, breadcrumbSchema]}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-navy via-navy/95 to-navy text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Listings", to: "/listings" },
              { label: title, to: `/location/${slug}` },
            ]}
          />

          <div className="mt-6 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange/20 border border-orange/40 px-3.5 py-1 text-xs font-bold text-orange uppercase tracking-wider">
              <CheckBadgeIcon className="h-4 w-4" /> Hosur Verified Property Guide
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {h1}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Find verified DTCP layout plots, clear document lands, resale houses, and luxury villas in <span className="font-semibold text-white">{locationName}</span>, Hosur. Directly connect with owners, verified dealers, and trusted Hosur realtors.
            </p>

            {/* Quick Action Badges */}
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${CONTACT_PHONE_NUMBERS[0]?.tel}`}
                className="inline-flex items-center gap-2 rounded-xl bg-orange px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-orange-600 transition"
              >
                <PhoneIcon className="h-4 w-4" /> Call Specialist
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
              >
                <WhatsAppIcon className="h-4 w-4" /> Direct WhatsApp Inquiry
              </a>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                Request Property Callback
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights Ribbon */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-white p-5 shadow-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy">100% Legal Verification</p>
              <p className="text-[11px] text-slate-500">Verified parent deed &amp; DTCP records</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy">Ready for Registration</p>
              <p className="text-[11px] text-slate-500">Clear titles &amp; spot registration ready</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckBadgeIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-navy">Bank Loan Assistance</p>
              <p className="text-[11px] text-slate-500">Approved by SBI, HDFC &amp; ICICI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Available Properties Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy">Properties in {locationName} &amp; Nearby Hosur Hubs</h2>
              <p className="text-xs text-slate-500 mt-1">Live verified property listings in {locationName}</p>
            </div>
            <Link
              to="/listings"
              className="text-xs font-bold text-orange hover:underline transition"
            >
              View All Listings &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader text={`Loading ${title} listings...`} size={40} />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((item) => (
                <PropertyCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold text-navy">No exact properties matching "{locationName}" listed currently</h3>
              <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto">
                Our Hosur Property Specialists have unlisted offline inventory in {locationName}. Connect directly with our experts to find verified DTCP plots.
              </p>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="mt-4 rounded-xl bg-orange px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition"
              >
                Inquire Offline Inventory in {locationName}
              </button>
            </div>
          )}
        </section>

        {/* Location Growth Overview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-3">
            Real Estate Market Overview: {locationName}, Hosur
          </h2>
          <div className="prose prose-slate text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              {locationName} is rapidly emerging as a primary real estate investment zone in Hosur, Tamil Nadu. Situated close to major industrial corridors, including Hosur SIPCOT Phase 1 &amp; Phase 2, IT parks, and national highway networks connecting Hosur to Electronic City Bangalore, properties in {locationName} deliver high capital appreciation and steady rental returns.
            </p>
            <p>
              Whether you are searching for DTCP approved residential layouts, gated community villas, agricultural land, or industrial land parcels, MyHosurProperty ensures every transaction is backed by clear parent title deeds, layout approval documentation, and end-to-end legal support through Gyes Property &amp; Construction.
            </p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">Frequently Asked Questions</span>
            <h2 className="text-xl font-bold text-navy mt-1">Everything You Need to Know About {title}</h2>
          </div>
          <div className="space-y-4">
            {faqList.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-navy">{faq.question}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Internal Links Grid */}
        <SeoLocationLinks currentSlug={slug} />
      </main>

      {/* Inquiry Modal */}
      {isContactModalOpen && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          propertyTitle={`${title} Inquiry`}
        />
      )}
    </div>
  );
};

export default LocationSeoPage;
