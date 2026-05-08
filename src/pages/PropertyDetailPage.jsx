import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import ImageGallery from "../components/ImageGallery";
import PropertyCard from "../components/PropertyCard";
import ContactModal from "../components/ContactModal";
import useAuth from "../hooks/useAuth";
import { checkMyLeadStatus, createLead } from "../services/api/leadApi";
import { fetchPropertyById } from "../services/api/propertyApi";
import { currency, formatArea } from "../utils/format";

const PropertyDetailPage = () => {
  const { id } = useParams();
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

  const p = data.property;
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

  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-5 lg:px-6">
      <section className="grid gap-8 lg:grid-cols-[1.28fr_0.72fr]">
        <ImageGallery images={p.images} />

        <aside className="site-section p-6 md:p-7">
          <div className="flex flex-wrap gap-2">
            {p.verification?.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <CheckBadgeIcon className="h-4 w-4 text-blue-600" />
                Verified listing
              </span>
            ) : null}
            {p.verification?.reraId ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                RERA: {p.verification.reraId}
              </span>
            ) : null}
            {p.possessionStatus ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {p.possessionStatus}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{p.title}</h1>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
            <MapPinIcon className="h-4 w-4 text-slate-400" />
            {p.location?.area}, {p.location?.city}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Listed by {p.ownerId?.name || "Owner"} ({p.ownerId?.role || p.listingSource || "owner"})
          </p>

          <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Price</p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">{currency(p.price)}</p>
          </div>

          <div className="mt-6 space-y-3">
            {isApproved ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Approved contact details</p>
                <p className="mt-3 text-lg font-bold text-slate-900">{modalContact.name}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{modalContact.phone}</p>
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
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                Open virtual tour
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="site-section p-6 md:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Overview</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">About this property</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">{p.description}</p>

          <h3 className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Key facts</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
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
                  <span key={facility} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {facility}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </article>

        <article className="site-section p-4 md:p-5">
          <h2 className="px-2 pt-2 text-2xl font-bold text-slate-900">Map view</h2>
          <iframe
            title="Google map"
            className="mt-4 h-80 w-full rounded-[24px] border-0"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          />
        </article>
      </section>

      <section className="site-section p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Locality insights</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Signals around the area</h2>

        {localityEntries.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {localityEntries.map(([key, value]) => (
              <div key={key} className="rounded-[22px] border border-slate-200 bg-white p-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{key}</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{data.localityInsights?.notes}</p>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">More options</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Similar properties</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.similar.map((item) => (
            <PropertyCard key={item._id} item={item} />
          ))}
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
