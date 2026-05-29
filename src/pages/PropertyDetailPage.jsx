import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  HomeModernIcon,
  MapPinIcon,
  PhoneIcon,
} from "../components/AppIcons";
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
      <main className="page-shell w-full px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center rounded-xl bg-surface py-24">
          <p className="text-sm font-medium text-slate-500">Loading property details...</p>
        </div>
      </main>
    );
  }

  if (error || !data.property) {
    return (
      <main className="page-shell w-full px-5 py-12 sm:px-8 lg:px-10">
        <SeoHead
          title="Property Unavailable"
          description="This property listing is unavailable or may have been removed from MyHosurProperty."
          noIndex
        />
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl bg-surface px-6 py-16 text-center">
          <HomeModernIcon className="h-12 w-12 text-orange" />
          <h1 className="text-2xl font-bold text-navy">Property unavailable</h1>
          <p className="text-sm leading-7 text-slate-600">{error || "The property you are looking for does not exist."}</p>
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
    { label: "Bathrooms", value: p.bathrooms || "—" },
    { label: "Carpet area", value: p.carpetArea ? formatArea(p.carpetArea, p.areaUnit) : "—" },
    { label: "Built-up area", value: p.builtupArea ? formatArea(p.builtupArea, p.areaUnit) : "—" },
    { label: "Furnishing", value: p.furnishingStatus || "—" },
    { label: "Possession", value: p.possessionStatus || "—" },
    { label: "Facing", value: p.facing || "—" },
    { label: "Floor", value: p.totalFloors ? `${p.floorNumber || 0} / ${p.totalFloors}` : "—" },
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

  const listingLabel = p.listingType === "rent" ? "For rent" : p.listingType === "new-project" ? "New project" : "For sale";

  return (
    <main className="page-shell w-full">
      <SeoHead
        title={`${p.title} in ${p.location?.area || p.location?.city || "Hosur"} - ${currency(p.price)}`}
        description={truncateText(p.description || `${p.propertyType} in ${p.location?.area}, ${p.location?.city} listed on MyHosurProperty.`, 160)}
        keywords={`${p.title}, ${p.propertyType} in ${p.location?.city}, ${p.location?.area} property, ${p.listingType} property in Hosur, ${p.bhk || ""} BHK ${p.propertyType}`}
        canonicalPath={propertyPath}
        image={p.images?.[0]}
        type="article"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs), buildFaqSchema(faqItems)]}
      />

      {/* Breadcrumb */}
      <section className="border-b border-slate-100 bg-white px-5 py-4 sm:px-8 lg:px-10">
        <nav className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.to} className="inline-flex items-center gap-1">
              {index > 0 ? <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300" /> : null}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-navy line-clamp-1">{crumb.label}</span>
              ) : (
                <Link to={crumb.to} className="transition hover:text-orange">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </section>

      {/* Gallery + summary */}
      <section className="bg-white px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="min-w-0">
            {statusPills.length ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {statusPills.map((pill) => (
                  <span key={pill} className="inline-flex items-center gap-1.5 rounded-md bg-orange/10 px-2.5 py-1 text-xs font-semibold text-navy">
                    <CheckBadgeIcon className="h-3.5 w-3.5 text-orange" />
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            <ImageGallery images={p.images} property={p} />
          </div>

          <aside className="lg:sticky lg:top-24">
            <span className="inline-flex rounded-md bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              {listingLabel}
            </span>
            <p className="section-tag mt-4">Property overview</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-navy sm:text-3xl">{p.title}</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
              <MapPinIcon className="h-4 w-4 flex-shrink-0 text-orange" />
              {p.location?.area}, {p.location?.city}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Listed by {p.ownerId?.name || "Owner"} · {p.ownerId?.role || p.listingSource || "owner"}
            </p>

            <div className="mt-6 rounded-xl bg-surface p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Price</p>
              <p className="mt-1 text-3xl font-bold text-navy sm:text-4xl">{currency(p.price)}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Type</p>
                  <p className="mt-1 text-sm font-bold text-navy">{p.propertyType || "Residential"}</p>
                </div>
                <div className="rounded-lg bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Listing</p>
                  <p className="mt-1 text-sm font-bold capitalize text-navy">{p.listingType || "sale"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isApproved ? (
                <div className="rounded-xl bg-surface p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approved contact</p>
                  <p className="mt-2 text-lg font-bold text-navy">{modalContact.name}</p>
                  <p className="mt-1 text-xl font-semibold text-orange">{modalContact.phone}</p>
                  {modalContact.email ? <p className="mt-1 text-sm text-slate-500">{modalContact.email}</p> : null}
                </div>
              ) : isPending ? (
                <button type="button" disabled className="w-full rounded-lg bg-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-500">
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
                  Request contact details
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
                  className="link-orange inline-flex items-center gap-2 px-1 text-sm"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  Open virtual tour
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      {/* About + map */}
      <section className="bg-surface px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-2">
          <article>
            <p className="section-tag">Overview</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">About this property</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{p.description}</p>

            <h3 className="mt-8 text-lg font-bold text-navy">Key facts</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="stat-card">
                  <p className="stat-label">{fact.label}</p>
                  <p className="stat-value !text-base !font-bold">{fact.value}</p>
                </div>
              ))}
            </div>

            {p.amenities?.length ? (
              <>
                <h3 className="mt-8 text-lg font-bold text-navy">Amenities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.amenities.map((item) => (
                    <span key={item} className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-navy">
                      {item}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            {p.nearbyFacilities?.length ? (
              <>
                <h3 className="mt-8 text-lg font-bold text-navy">Nearby facilities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.nearbyFacilities.map((facility) => (
                    <span key={facility} className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-navy">
                      {facility}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </article>

          <article>
            <p className="section-tag">Location</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Map view</h2>
            <p className="mt-2 text-sm text-slate-600">See how the property sits within the surrounding Hosur area.</p>
            <iframe
              title="Property location map"
              className="mt-4 h-72 w-full rounded-xl sm:h-80 lg:h-[28rem]"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
          </article>
        </div>
      </section>

      {/* Locality */}
      {(localityEntries.length > 0 || data.localityInsights?.notes) && (
        <section className="bg-white px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <p className="section-tag">Locality insights</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Signals around the area</h2>

            {localityEntries.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {localityEntries.map(([key, value]) => (
                  <div key={key} className="stat-card text-center">
                    <p className="stat-label">{key}</p>
                    <p className="stat-value">{value}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {data.localityInsights?.notes ? (
              <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-600">{data.localityInsights.notes}</p>
            ) : null}
          </div>
        </section>
      )}

      {/* Similar properties */}
      {data.similar?.length > 0 && (
        <section className="bg-surface px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <p className="section-tag">More options</p>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Similar properties</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.similar.map((item) => (
                <PropertyCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-white px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <p className="section-tag">FAQs</p>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Common questions</h2>
          <div className="mt-6 divide-y divide-slate-100">
            {faqItems.map((item) => (
              <article key={item.question} className="py-5 first:pt-0">
                <h3 className="text-base font-bold text-navy">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy px-5 py-14 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px] text-center lg:text-left">
          <p className="section-tag text-orange">Explore more</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Keep browsing Hosur properties</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white lg:mx-0">
            View more listings in {p.location?.city || "Hosur"} or filter by {p.propertyType} to compare similar options.
          </p>
          <div className="mt-6 flex flex-col flex-wrap justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/listings" className="inline-flex items-center justify-center rounded-lg bg-orange px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-hover">
              View all listings
            </Link>
            <Link
              to={`/listings?city=${encodeURIComponent(p.location?.city || "Hosur")}`}
              className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              More in {p.location?.city || "Hosur"}
            </Link>
            <Link
              to={`/listings?propertyType=${encodeURIComponent(p.propertyType || "")}`}
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              More {p.propertyType}
            </Link>
          </div>
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
