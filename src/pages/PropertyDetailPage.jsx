import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import ImageGallery from "../components/ImageGallery";
import PropertyCard from "../components/PropertyCard";
import ContactModal from "../components/ContactModal";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import { checkMyLeadStatus, createLead } from "../services/api/leadApi";
import { fetchPropertyById } from "../services/api/propertyApi";
import { currency, formatArea } from "../utils/format";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPropertySlug,
  buildRealEstateAgentSchema,
  getPropertyPath,
  truncateText,
} from "../utils/seo";

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionSection = motion.section;

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ property: null, similar: [], localityInsights: null, accessRestricted: false });
  const [myLead, setMyLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [intentType, setIntentType] = useState("contact");
  const heroRef = useRef(null);
  const revealRefs = useRef([]);

  const setRevealRef = (node) => {
    if (node && !revealRefs.current.includes(node)) {
      revealRefs.current.push(node);
    }
  };

  const handleSubmitInquiry = async () => {
    if (!token) {
      toast.error("Please login to contact the owner.");
      return;
    }

    try {
      const res = await createLead(token, {
        propertyId: id,
        intentType,
        message: inquiryText || "Hi, I am interested in this property.",
      });
      setMyLead(res.lead);
      toast.success(intentType === "brochure" ? "Request sent" : "Contact request sent to owner for approval.");
      setModalOpen(false);
      setInquiryText("");
    } catch (e) {
      if (e.response?.status === 402) {
        toast.error("Monthly inquiry limit reached. Please upgrade your plan to contact more property owners.");
      } else {
        toast.error(e.response?.data?.message || "Failed to send inquiry.");
      }
    }
  };

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPropertyById(id, token);
        setData(result || { property: null, similar: [], localityInsights: null });
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Failed to load property details");
        setData({ property: null, similar: [], localityInsights: null });
      } finally {
        setLoading(false);
      }
    };

    loadProperty();

    if (token) {
      checkMyLeadStatus(token, id)
        .then((res) => setMyLead(res.lead))
        .catch(() => setMyLead(null));
    }
  }, [id, token]);

  useEffect(() => {
    if (loading || error || !data.property) return undefined;

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll("[data-property-hero]"),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.88,
            ease: "power3.out",
            stagger: 0.1,
          }
        );
      }

      revealRefs.current.forEach((node, index) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.04,
            scrollTrigger: {
              trigger: node,
              start: "top 84%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [data.property, error, loading]);

  const p = data.property;
  const propertyPath = p ? getPropertyPath(p) : "";
  const propertySlug = p ? buildPropertySlug(p) : "";
  const breadcrumbs = useMemo(
    () =>
      p
        ? [
            { label: "Home", to: "/" },
            { label: "Listings", to: "/listings" },
            { label: p.location?.city || "Hosur", to: `/listings?city=${encodeURIComponent(p.location?.city || "Hosur")}` },
            { label: p.title, to: propertyPath },
          ]
        : [],
    [p, propertyPath]
  );
  const faqItems = useMemo(() => {
    if (!p) return [];

    return [
      {
        question: `What is the price of ${p.title}?`,
        answer: `${p.title} is listed at ${currency(p.price)} on MyHosurProperty.`,
      },
      {
        question: `Where is ${p.title} located?`,
        answer: `${p.title} is located in ${p.location?.area}, ${p.location?.city}.`,
      },
      {
        question: `What type of property is ${p.title}?`,
        answer: `${p.title} is a ${p.bhk ? `${p.bhk} BHK ` : ""}${p.propertyType} available for ${p.listingType === "rent" ? "rent" : p.listingType === "new-project" ? "new project enquiries" : "sale"}.`,
      },
    ];
  }, [p]);

  useEffect(() => {
    if (!p || !propertySlug) return;

    if (window.location.pathname !== propertyPath) {
      navigate(propertyPath, { replace: true });
    }
  }, [navigate, p, propertyPath, propertySlug]);

  if (loading) {
    return (
      <main className="w-full px-4 py-10 sm:px-5 lg:px-6">
        <div className="site-section flex h-72 items-center justify-center">
          <p className="text-sm font-medium text-slate-500">Loading property details...</p>
        </div>
      </main>
    );
  }

  if (error || !data.property) {
    return (
      <main className="w-full px-4 py-10 sm:px-5 lg:px-6">
        <SeoHead
          title="Property Unavailable"
          description="This property listing is unavailable or may have been removed from MyHosurProperty."
          noIndex
        />
        <div className="site-section flex h-72 flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Property unavailable</h1>
          <p className="max-w-md text-sm leading-7 text-slate-600">{error || "The property you are looking for does not exist."}</p>
          <button type="button" onClick={() => window.history.back()} className="site-button-primary px-5 py-3 text-sm">
            Go back
          </button>
        </div>
      </main>
    );
  }

  const mapQuery = encodeURIComponent(`${p.location?.area}, ${p.location?.city}`);
  const keyFacts = [
    { label: "BHK", value: p.bhk || "Studio" },
    { label: "Bathrooms", value: p.bathrooms || "-" },
    { label: "Carpet area", value: p.carpetArea ? formatArea(p.carpetArea, p.areaUnit) : "-" },
    { label: "Built-up area", value: p.builtupArea ? formatArea(p.builtupArea, p.areaUnit) : "-" },
    { label: "Furnishing", value: p.furnishingStatus || "-" },
    { label: "Possession", value: p.possessionStatus || "-" },
    { label: "Facing", value: p.facing || "-" },
    { label: "Floor", value: p.totalFloors ? `${p.floorNumber || 0}/${p.totalFloors}` : "-" },
  ];

  const modalContact = p.listingContact?.phone
    ? { name: p.listingContact.name, phone: p.listingContact.phone, email: p.ownerId?.email }
    : { name: p.ownerId?.name, phone: p.ownerId?.phone, email: p.ownerId?.email };

  const isApproved = myLead?.status === "approved" || String(p.ownerId?._id || p.ownerId) === String(user?._id);
  const isPending = myLead?.status === "pending";
  const localityEntries = Object.entries(data.localityInsights || {}).filter(([key]) => key !== "notes");
  const statusPills = [
    p.verification?.isVerified ? "Verified listing" : "",
    p.verification?.reraId ? `RERA ${p.verification.reraId}` : "",
    p.possessionStatus || "",
  ].filter(Boolean);

  return (
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 lg:px-6">
      <SeoHead
        title={`${p.title} in ${p.location?.area || p.location?.city || "Hosur"} - ${currency(p.price)}`}
        description={truncateText(p.description || `${p.propertyType} in ${p.location?.area}, ${p.location?.city} listed on MyHosurProperty.`, 160)}
        keywords={`${p.title}, ${p.propertyType} in ${p.location?.city}, ${p.location?.area} property, ${p.listingType} property in Hosur, ${p.bhk || ""} BHK ${p.propertyType}`}
        canonicalPath={propertyPath}
        image={p.images?.[0]}
        type="article"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs), buildFaqSchema(faqItems)]}
      />
      <Breadcrumbs items={breadcrumbs} className="px-1" />
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,243,236,0.88))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.09)] md:p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(245,200,128,0.16),transparent_22%),radial-gradient(circle_at_86%_16%,rgba(59,130,246,0.11),transparent_20%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.22fr_0.78fr]">
          <div data-property-hero className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              {statusPills.map((pill, index) => (
                <span
                  key={`${pill}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#eadbc4] bg-[#fff8ef] px-3 py-1.5 text-xs font-semibold text-[#8b6b3f]"
                >
                  <CheckBadgeIcon className="h-4 w-4 text-[#b98a53]" />
                  {pill}
                </span>
              ))}
            </div>
            <ImageGallery images={p.images} property={p} />
          </div>

          <aside data-property-hero className="site-section h-fit p-6 md:p-7">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">
              <SparklesIcon className="h-4 w-4" />
              Property overview
            </div>

            <h1 className="mt-4 font-['Fraunces'] text-4xl leading-[1.08] tracking-[-0.04em] text-slate-900">{p.title}</h1>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 text-slate-400" />
              {p.location?.area}, {p.location?.city}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Listed by {p.ownerId?.name || "Owner"} ({p.ownerId?.role || p.listingSource || "owner"})
            </p>

            <div className="mt-6 rounded-[1.6rem] border border-slate-200/70 bg-white/78 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Price</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{currency(p.price)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.15rem] border border-white/80 bg-[#fff8ef] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#8b6b3f]">Property type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{p.propertyType || "Residential"}</p>
                </div>
                <div className="rounded-[1.15rem] border border-white/80 bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Listing type</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{p.listingType || "sale"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {isApproved ? (
                <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/82 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Approved contact details</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{modalContact.name}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{modalContact.phone}</p>
                  <p className="mt-1 text-sm text-slate-500">{modalContact.email}</p>
                </div>
              ) : isPending ? (
                <button type="button" disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 text-sm font-semibold text-slate-500">
                  Contact request pending approval
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIntentType("contact");
                    setModalOpen(true);
                  }}
                  className="site-button-primary flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm"
                >
                  <PhoneIcon className="h-4 w-4" />
                  Request mobile number / call
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIntentType("brochure");
                  setModalOpen(true);
                }}
                className="site-button-secondary flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm"
              >
                <DocumentTextIcon className="h-4 w-4" />
                Request brochure
              </button>

              {p.virtualTourUrl ? (
                <a
                  href={p.virtualTourUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-[#8b6b3f]"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Open virtual tour
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section ref={setRevealRef} className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <MotionArticle
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeUp}
          className="site-section p-6 md:p-8"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Overview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">About this property</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">{p.description}</p>

          <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Key facts</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-[1.45rem] border border-slate-200/70 bg-white/80 px-4 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{fact.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{fact.value}</p>
              </div>
            ))}
          </div>

          {p.nearbyFacilities?.length ? (
            <>
              <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Nearby facilities</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.nearbyFacilities.map((facility) => (
                  <span key={facility} className="rounded-full border border-[#eadbc4] bg-[#fff8ef] px-3 py-1.5 text-xs font-semibold text-[#8b6b3f]">
                    {facility}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </MotionArticle>

        <MotionArticle
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeUp}
          className="site-section p-4 md:p-5"
        >
          <h2 className="px-2 pt-2 text-3xl font-semibold tracking-tight text-slate-900">Map view</h2>
          <p className="px-2 pt-2 text-sm text-slate-500">See how the property sits within the surrounding Hosur pocket.</p>
          <iframe
            title="Google map"
            className="mt-4 h-[26rem] w-full rounded-[1.7rem] border-0"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          />
        </MotionArticle>
      </section>

      <MotionSection
        ref={setRevealRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        className="site-section p-6 md:p-8"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Locality insights</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Signals around the area</h2>

        {localityEntries.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {localityEntries.map(([key, value]) => (
              <div key={key} className="rounded-[1.45rem] border border-slate-200/70 bg-white/80 p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{key}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-5 max-w-3xl text-sm leading-8 text-slate-600">{data.localityInsights?.notes}</p>
      </MotionSection>

      <section ref={setRevealRef} className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">More options</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Similar properties</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.similar.map((item, index) => (
            <MotionDiv
              key={item._id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.16) }}
              whileHover={{ y: -6 }}
            >
              <PropertyCard item={item} />
            </MotionDiv>
          ))}
        </div>
      </section>

      <section className="site-section p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Property FAQs</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Questions buyers usually ask before contacting the owner</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Explore more</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Keep browsing related Hosur property pages</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/listings" className="site-button-primary px-5 py-3 text-sm">
            View all Hosur listings
          </Link>
          <Link to={`/listings?city=${encodeURIComponent(p.location?.city || "Hosur")}`} className="site-button-secondary px-5 py-3 text-sm">
            More property in {p.location?.city || "Hosur"}
          </Link>
          <Link to={`/listings?propertyType=${encodeURIComponent(p.propertyType || "")}`} className="site-button-secondary px-5 py-3 text-sm">
            More {p.propertyType} listings
          </Link>
        </div>
      </section>

      <ContactModal
        user={user}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={inquiryText}
        setValue={setInquiryText}
        onSubmit={handleSubmitInquiry}
        contact={modalContact}
        intentType={intentType}
      />
    </main>
  );
};

export default PropertyDetailPage;
