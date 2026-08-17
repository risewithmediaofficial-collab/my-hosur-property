import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  FlagIcon,
  HomeModernIcon,
  LandIcon,
  MapPinIcon,
  PhoneIcon,
  ShareIcon,
  SparklesIcon,
  UserIcon,
  VillaIcon,
} from "../components/AppIcons";
import PropertyCard from "../components/PropertyCard";
import ContactModal from "../components/ContactModal";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import { checkMyLeadStatus, createLead } from "../services/api/leadApi";
import { fetchPropertyById } from "../services/api/propertyApi";
import {
  fetchSavedProperties,
  toggleSavedProperty,
} from "../services/api/userApi";
import { currency, formatArea } from "../utils/format";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildPropertySlug,
  buildRealEstateAgentSchema,
  getPropertyPath,
  truncateText,
} from "../utils/seo";
import {
  saveInquiryHistoryItem,
  updateInquiryHistoryItem,
} from "../utils/inquiryHistory";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";

const formatDateSafe = (dateVal) => {
  if (!dateVal) return "Recently";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return "Recently";
  }
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    property: null,
    similar: [],
    localityInsights: null,
  });

  const [myLead, setMyLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [intentType, setIntentType] = useState("contact");
  const [savedIds, setSavedIds] = useState([]);
  const [activeMediaTab, setActiveMediaTab] = useState("photos");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeNavTab, setActiveNavTab] = useState("overview");
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);

  const p = data.property;
  const propertyViewCount = Math.max(Number(p?.viewCount || 0), 0);
  const propertyViewLabel = `${propertyViewCount.toLocaleString("en-IN")} ${propertyViewCount === 1 ? "person" : "people"} viewed this property`;

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
      fetchSavedProperties(token)
        .then((res) => setSavedIds((res.items || []).map((item) => item._id)))
        .catch(() => setSavedIds([]));

      checkMyLeadStatus(token, id)
        .then((res) => {
          setMyLead(res.lead);
          if (res?.lead?._id && user?._id) {
            updateInquiryHistoryItem(user._id, res.lead._id, {
              status: res.lead.status,
              createdAt: res.lead.createdAt,
            });
          }
        })
        .catch(() => setMyLead(null));
    }
  }, [id, token, user?._id]);

  const handleToggleSaved = async (propertyId) => {
    if (!token) {
      toast.error("Please login to save properties");
      return;
    }

    const wasSaved = savedIds.includes(propertyId);
    try {
      const res = await toggleSavedProperty(token, { propertyId });
      setSavedIds(res.savedProperties || []);
      toast.success(
        wasSaved
          ? "Removed from saved properties"
          : "Property saved to your dashboard"
      );
    } catch {
      toast.error("Unable to update saved properties");
    }
  };

  const handleSubmitInquiry = async () => {
    if (!token) {
      toast.success("Sign in to contact the owner and request property details.");
      navigate("/auth", { state: { from: location } });
      return;
    }

    try {
      const res = await createLead(token, {
        propertyId: id,
        intentType,
        message: inquiryText || "Hi, I am interested in this property.",
      });
      setMyLead(res.lead);
      saveInquiryHistoryItem(user?._id, {
        id: res.lead?._id || `${id}-${Date.now()}`,
        propertyId: id,
        propertyTitle: p?.title || "Property inquiry",
        propertyLocation: [p?.location?.area, p?.location?.city].filter(Boolean).join(", "),
        ownerName: p?.listingContact?.name || p?.ownerId?.name || "Owner",
        intentType,
        message: inquiryText || "Hi, I am interested in this property.",
        status: res.lead?.status || "pending",
        createdAt: res.lead?.createdAt || new Date().toISOString(),
      });
      toast.success(
        intentType === "brochure"
          ? "Request sent"
          : "Contact request sent to owner for approval."
      );
      setModalOpen(false);
      setInquiryText("");
    } catch (e) {
      if (e.response?.status === 402) {
        toast.error("Monthly inquiry limit reached. Please upgrade your plan.");
      } else {
        toast.error(e.response?.data?.message || "Failed to send inquiry.");
      }
    }
  };

  const safeImages = useMemo(() => {
    if (!p || !Array.isArray(p.images) || p.images.length === 0) {
      return [PROPERTY_PLACEHOLDER_IMAGE];
    }
    return p.images.filter(Boolean);
  }, [p]);

  const activeImage = safeImages[activeImageIndex] || safeImages[0];

  const pricePerSqft = useMemo(() => {
    if (!p || !p.price) return 0;
    const area = p.carpetArea || p.builtupArea || 1000;
    return Math.round(p.price / area);
  }, [p]);

  const propertyPath = p ? getPropertyPath(p) : "";
  const propertySlug = p ? buildPropertySlug(p) : "";

  const breadcrumbs = useMemo(() => {
    if (!p) return [];
    const area = p.location?.area || "Hosur";
    const city = p.location?.city || "Hosur";
    return [
      { label: "Home", to: "/" },
      { label: `Property in ${city}`, to: `/listings?city=${encodeURIComponent(city)}` },
      { label: `${p.propertyType || "Plot"}s in ${city}`, to: `/listings?propertyType=${encodeURIComponent(p.propertyType || "")}` },
      { label: `Plots in ${area}`, to: `/listings?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}` },
      { label: p.title || "Property Details", to: propertyPath },
    ];
  }, [p, propertyPath]);

  const faqItems = useMemo(() => {
    if (!p) return [];
    return [
      {
        question: `What is the price of ${p.title || "this property"}?`,
        answer: `${p.title || "This property"} is listed at ${currency(p.price)} (@ ₹${(pricePerSqft || 0).toLocaleString("en-IN")} per sqft) on MyHosurProperty.`,
      },
      {
        question: `Where is ${p.title || "this property"} located?`,
        answer: `${p.title || "This property"} is located in ${p.location?.area || "Hosur"}, ${p.location?.city || "Hosur"}.`,
      },
      {
        question: `What type of property is ${p.title || "this property"}?`,
        answer: `${p.title || "This property"} is a ${p.bhk ? `${p.bhk} BHK ` : ""}${p.propertyType || "Plot"} available for ${
          p.listingType === "rent" ? "rent" : "sale"
        }.`,
      },
    ];
  }, [p, pricePerSqft]);

  const modalContact = p?.listingContact?.phone
    ? { name: p.listingContact.name, phone: p.listingContact.phone, email: p.ownerId?.email }
    : { name: p?.ownerId?.name, phone: p?.ownerId?.phone, email: p?.ownerId?.email };

  const isApproved = myLead?.status === "approved" || String(p?.ownerId?._id || p?.ownerId) === String(user?._id) || user?.role === "admin";
  const isPending = myLead?.status === "pending";
  const isRejected = myLead?.status === "rejected";
  const isSaved = p?._id ? savedIds.includes(p._id) : false;
  const canEdit = Boolean(p && (user?.role === "admin" || String(p?.ownerId?._id || p?.ownerId) === String(user?._id)));

  const nearbyPlaces = useMemo(() => {
    if (!p) return [];
    if (Array.isArray(p.nearbyFacilities) && p.nearbyFacilities.length > 0) {
      return p.nearbyFacilities.map((name) => ({ name, icon: "📍" }));
    }
    const area = p.location?.area || p.location?.city || "Hosur";
    return [
      { name: `${area} Main Road`, icon: "🛣️" },
      { name: `${area} Bus Stand`, icon: "🚌" },
      { name: `Schools near ${area}`, icon: "🎓" },
      { name: `Hospitals near ${area}`, icon: "🏥" },
      { name: `Markets near ${area}`, icon: "🛍️" },
    ];
  }, [p]);

  const highlights = useMemo(() => {
    if (!p) return [];
    const list = [];
    if (p.facing) list.push(`${p.facing} Facing`);
    if (p.bhk) list.push(`${p.bhk} BHK Layout`);
    if (p.carpetArea || p.builtupArea) list.push(`Spacious ${p.carpetArea || p.builtupArea} ${p.areaUnit || "sqft"}`);
    if (p.possessionStatus) list.push(`${p.possessionStatus} Possession`);
    if (p.verification?.isVerified) list.push("Verified Property Listing");
    if (p.verification?.reraId) list.push(`RERA Approved (${p.verification.reraId})`);
    if (Array.isArray(p.amenities) && p.amenities.length) {
      list.push(...p.amenities.slice(0, 4));
    }
    if (list.length < 4) {
      list.push("Clear Legal Documentation", "Prime Location Access");
    }
    return list;
  }, [p]);

  if (loading) {
    return (
      <main className="page-shell w-full px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center rounded-2xl bg-white p-20 shadow-sm border border-slate-200">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange border-t-transparent" />
          <p className="mt-4 text-sm font-bold text-navy">Loading property details...</p>
        </div>
      </main>
    );
  }

  if (error || !data.property) {
    return (
      <main className="page-shell w-full px-5 py-16 sm:px-8 lg:px-10">
        <SeoHead
          title="Property Unavailable"
          description="This property listing is unavailable or may have been removed."
          noIndex
        />
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-12 text-center shadow-lg border border-slate-200">
          <HomeModernIcon className="h-14 w-14 text-orange" />
          <h1 className="text-2xl font-bold text-navy">Property Unavailable</h1>
          <p className="text-sm text-slate-600">
            {error || "The property you are looking for does not exist."}
          </p>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="site-button-primary mt-2 px-6 py-3 text-sm font-bold"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell w-full bg-slate-50/50 pb-20">
      <SeoHead
        title={`${p?.title || "Property"} in ${p?.location?.area || "Hosur"} - ${currency(p?.price || 0)}`}
        description={truncateText(
          p?.description || `${p?.propertyType || "Property"} in ${p?.location?.area || "Hosur"}, ${p?.location?.city || "Hosur"} listed on MyHosurProperty.`,
          160
        )}
        keywords={`${p?.title || "Property"}, ${p?.propertyType || "Real Estate"} in ${p?.location?.city || "Hosur"}, ${p?.location?.area || "Hosur"} property`}
        canonicalPath={propertyPath}
        image={safeImages[0]}
        type="article"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs), buildFaqSchema(faqItems)]}
      />

      {/* ── 1. TOP BREADCRUMB & DATE BAR ── */}
      <section className="border-b border-slate-200 bg-white px-5 py-3.5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-slate-500">
          <nav className="flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.to}-${index}`} className="inline-flex items-center gap-1.5">
                {index > 0 ? <ChevronRightIcon className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" /> : null}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-navy line-clamp-1">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="transition hover:text-orange">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium shrink-0">
            <span>Posted on {formatDateSafe(p?.createdAt)}</span>
            <span className="h-3 w-px bg-slate-300" aria-hidden />
            <span className="font-semibold text-emerald-600">{p?.possessionStatus || "Ready to move"}</span>
          </div>
        </div>
      </section>

      {/* ── 2. PROPERTY PRICE & HEADER CARD ── */}
      <section className="bg-white border-b border-slate-200 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {/* Price & EMI */}
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
                  {currency(p?.price || 0)}
                </h1>
                <span className="text-sm font-semibold text-slate-500 sm:text-base">
                  @ ₹{pricePerSqft.toLocaleString("en-IN")} per sqft
                </span>
              </div>

              {/* Title & Location */}
              <h2 className="mt-2 text-lg font-bold text-navy sm:text-xl">
                {p.bhk ? `${p.bhk} BHK ` : ""}{p.propertyType || "Residential Land/Plot"} for {p.listingType === "rent" ? "Rent" : "Sale"}
                <span className="font-normal text-slate-600"> in {p.location?.area || "Mathigiri"}, {p.location?.city || "Hosur"}</span>
              </h2>

              {/* RERA & Status Badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {p.verification?.reraId ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                    RERA APPROVED ({p.verification.reraId})
                  </span>
                ) : p.verification?.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                    VERIFIED LISTING
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => navigate(`/edit-property/${p._id}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 border border-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition shadow-sm"
                >
                  Edit Property
                </button>
              )}

              <button
                type="button"
                onClick={() => handleToggleSaved(p._id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition border ${
                  isSaved
                    ? "bg-navy text-white border-navy"
                    : "bg-white border-slate-300 text-navy hover:bg-slate-50"
                }`}
              >
                <BookmarkIcon className="h-4.5 w-4.5" />
                {isSaved ? "Saved" : "Save Property"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: p.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Property link copied!");
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy hover:bg-slate-50 transition"
              >
                <ShareIcon className="h-4.5 w-4.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. HERO SECTION: MEDIA GALLERY + SPECS CARD ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          
          {/* Left Column: Media Gallery Box */}
          <div className="min-w-0 flex flex-col gap-3">
            {/* Gallery Tabs Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab("photos")}
                className={`text-sm font-bold transition pb-1 border-b-2 ${
                  activeMediaTab === "photos"
                    ? "border-orange text-orange"
                    : "border-transparent text-slate-500 hover:text-navy"
                }`}
              >
                Property ({safeImages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab("videos")}
                className={`text-sm font-bold transition pb-1 border-b-2 ${
                  activeMediaTab === "videos"
                    ? "border-orange text-orange"
                    : "border-transparent text-slate-500 hover:text-navy"
                }`}
              >
                Videos ({p.virtualTourUrl ? "1" : "0"})
              </button>
            </div>

            {/* Main Image Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md group">
              <img
                src={activeImage}
                alt={p.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />

              {/* Bottom-left: Eyeball Views Overlay Badge */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-lg border border-white/10">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <EyeIcon className="h-3 w-3" />
                </span>
                <span>{propertyViewLabel}</span>
              </div>

              {/* Bottom-right: Zoom Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenImage(true)}
                className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-md transition hover:bg-orange shadow-lg"
                title="View Fullscreen"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Strip */}
            {safeImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 hide-scrollbar">
                {safeImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
                      activeImageIndex === idx
                        ? "ring-2 ring-orange ring-offset-2 scale-105"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-16 w-20 object-cover sm:h-20 sm:w-24 rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Property Specs Grid Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              
              {/* Price */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100/70 text-amber-700 font-bold">
                  🏷️
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
                  <p className="font-extrabold text-navy text-base mt-0.5">{currency(p.price)}</p>
                  {pricePerSqft > 0 ? (
                    <p className="text-xs text-slate-600 font-medium">@ ₹{pricePerSqft.toLocaleString("en-IN")} per sqft</p>
                  ) : null}
                </div>
              </div>

              {/* Area */}
              {(p.carpetArea || p.builtupArea) ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-700 font-bold">
                    📏
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Area</p>
                    <p className="font-extrabold text-navy text-base mt-0.5">
                      {formatArea(p.carpetArea || p.builtupArea, p.areaUnit)}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700 font-bold">
                  📍
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                  <p className="font-extrabold text-navy text-base mt-0.5">{[p.location?.area, p.location?.city || "Hosur"].filter(Boolean).join(", ")}</p>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100/70 text-purple-700 font-bold">
                  🏠
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Type</p>
                  <p className="font-extrabold text-navy text-base mt-0.5">{p.propertyType || "Residential"}</p>
                </div>
              </div>

              {/* BHK if present */}
              {p.bhk ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100/70 text-indigo-700 font-bold">
                    🛏️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bedrooms</p>
                    <p className="font-extrabold text-navy text-base mt-0.5">{p.bhk} BHK</p>
                  </div>
                </div>
              ) : null}

              {/* Facing if present */}
              {p.facing ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100/70 text-teal-700 font-bold">
                    🧭
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facing</p>
                    <p className="font-extrabold text-navy text-base mt-0.5">{p.facing}</p>
                  </div>
                </div>
              ) : null}

              {/* Possession Status if present */}
              {p.possessionStatus ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100/70 text-sky-700 font-bold">
                    🔑
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Possession</p>
                    <p className="font-extrabold text-navy text-base mt-0.5">{p.possessionStatus}</p>
                  </div>
                </div>
              ) : null}

            </div>

            {/* Owner Contact CTA Action Box */}
            <div className="mt-2 pt-4 border-t border-slate-200/80 flex flex-col gap-3">
              {isApproved ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Approved Owner Contact</p>
                  <p className="mt-1 text-lg font-extrabold text-navy">{modalContact.name}</p>
                  <p className="text-xl font-bold text-orange mt-0.5">{modalContact.phone}</p>
                  {modalContact.email && <p className="text-sm font-semibold text-slate-600 mt-1">{modalContact.email}</p>}
                </div>
              ) : isPending ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-sm font-bold text-amber-800">Contact Request Pending Admin Approval</p>
                  <p className="text-xs text-amber-700 mt-1">Your request is sent to Admin for approval. Owner contact will appear once approved.</p>
                </div>
              ) : isRejected ? (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-center">
                  <p className="text-sm font-bold text-rose-800">Contact Request Declined by Admin</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!token) {
                      toast.success("Sign in to contact the owner and request property details.");
                      navigate("/auth", { state: { from: location } });
                      return;
                    }
                    setIntentType("contact");
                    setModalOpen(true);
                  }}
                  className="site-button-primary flex w-full items-center justify-center gap-2.5 py-3.5 text-base font-bold shadow-md hover:shadow-lg transition"
                >
                  <PhoneIcon className="h-5 w-5" />
                  Get Owner / Dealer Contact Details
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. ABOUT PROPERTY & DESCRIPTION ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-navy">About Property</h3>
              <p className="mt-2 text-sm text-slate-500">
                Address: <span className="font-semibold text-slate-900">{[p.location?.area, p.location?.city || "Hosur"].filter(Boolean).join(", ")}</span>
              </p>
            </div>
            <div className="inline-flex flex-col items-start gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 md:items-end">
              <span className="font-semibold text-slate-900">{p.propertyType || "Property"}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                {p.listingType === "rent" ? "Rent" : "Sale"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {p.propertyType ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Property Type</p>
                  <p className="mt-1 font-semibold text-slate-900">{p.propertyType}</p>
                </div>
              ) : null}
              {p.location?.area ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</p>
                  <p className="mt-1 text-slate-700">
                    {[p.location?.area, p.location?.village, p.location?.taluk, p.location?.district, p.location?.city, p.location?.state, p.location?.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : null}
              {p.landArea ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Land Area</p>
                  <p className="mt-1 font-semibold text-slate-900">{p.landArea} {p.areaUnit || "sqft"}</p>
                </div>
              ) : null}
              {p.builtupArea ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Built-up Area</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatArea(p.builtupArea, p.areaUnit)}</p>
                </div>
              ) : null}
              {p.length ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Length</p>
                  <p className="mt-1 font-semibold text-slate-900">{p.length}</p>
                </div>
              ) : null}
              {p.width ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Width</p>
                  <p className="mt-1 font-semibold text-slate-900">{p.width}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Property Summary</p>
              <p className="mt-3 whitespace-pre-line text-slate-700">{p.description || `Verified ${p.propertyType || "property"} listing in ${p.location?.area || p.location?.city || "Hosur"}. Contact the property owner or listing agent for complete details, site visits, and legal documentation support.`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. LOCATION MAP ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-navy">Location Map</h3>
          <p className="mt-1 text-xs text-slate-500">Explore surrounding area in {[p.location?.area, p.location?.city || "Hosur"].filter(Boolean).join(", ")}.</p>
          
          <iframe
            title="Property Map"
            className="mt-4 h-72 w-full rounded-xl sm:h-80 lg:h-96 border border-slate-200"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${p.location?.area || ""}, ${p.location?.city || "Hosur"}`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          />
        </div>
      </section>

      {/* ── 7. RELATED PROPERTIES ── */}
      {data.similar?.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="border-t border-slate-200 pt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-orange">More Options</p>
            <h2 className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">
              Related Properties in Hosur
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.similar.map((item) => (
                <PropertyCard
                  key={item._id}
                  item={item}
                  onSave={handleToggleSaved}
                  isSaved={savedIds.includes(item._id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. REPORT FOOTER ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Property sold out? Incorrect data?</span>
          <button
            type="button"
            onClick={() => toast.success("Thank you for your report. Our team will review this listing.")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <FlagIcon className="h-3.5 w-3.5 text-slate-500" />
            Report Issue
          </button>
        </div>
      </section>

      {/* Fullscreen Image Lightbox Modal */}
      {isFullscreenImage && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setIsFullscreenImage(false)}
            className="absolute top-5 right-5 text-white font-bold text-2xl hover:text-orange transition"
          >
            ✕
          </button>
          <img src={activeImage} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
        </div>
      )}

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
