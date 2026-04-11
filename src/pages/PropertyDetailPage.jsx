import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ImageGallery from "../components/ImageGallery";
import PropertyCard from "../components/PropertyCard";
import { fetchPropertyById } from "../services/api/propertyApi";
import { checkMyLeadStatus, createLead } from "../services/api/leadApi";
import ContactModal from "../components/ContactModal";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { currency, formatArea } from "../utils/format";

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ property: null, similar: [], localityInsights: null, accessRestricted: false });
  const [myLead, setMyLead] = useState(null);
  const [loadingLead, setLoadingLead] = useState(false);
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
        intentType: intentType,
        message: inquiryText || "Hi, I am interested in this property.",
      });
      setMyLead(res.lead);
      toast.success(intentType === "brochure" ? "Request sent" : "Contact request sent to owner for approval.");
      setModalOpen(false);
      setInquiryText("");
    } catch (e) {
      if (e.response?.status === 402) {
        toast.error("Monthly inquiry limit reached (5 max). Please upgrade your plan to contact more property owners.");
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
        console.log("Property loaded:", result);
        setData(result || { property: null, similar: [], localityInsights: null });
      } catch (error) {
        console.error("Error loading property:", error);
        setError(error.response?.data?.message || "Failed to load property details");
        setData({ property: null, similar: [], localityInsights: null });
      } finally {
        setLoading(false);
      }
    };

    loadProperty();

    if (token) {
      setLoadingLead(true);
      checkMyLeadStatus(token, id)
        .then((res) => setMyLead(res.lead))
        .catch((err) => console.error("Lead status error:", err))
        .finally(() => setLoadingLead(false));
    }
  }, [id, token]);

  if (loading) return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex h-64 items-center justify-center">
        <p className="text-ink/60">Loading property details...</p>
      </div>
    </main>
  );

  if (error || !data.property) return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex h-64 items-center justify-center flex-col gap-4">
        <p className="text-ink/60">{error || "Property not found"}</p>
        <button onClick={() => window.history.back()} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-stone">
          Go Back
        </button>
      </div>
    </main>
  );

  const p = data.property;
  const mapQuery = encodeURIComponent(`${p.location?.area}, ${p.location?.city}`);
  const keyFacts = [
    { label: "BHK", value: p.bhk || "Studio" },
    { label: "Bathrooms", value: p.bathrooms || "-" },
    { label: "Carpet Area", value: p.carpetArea ? formatArea(p.carpetArea, p.areaUnit) : "-" },
    { label: "Built-up Area", value: p.builtupArea ? formatArea(p.builtupArea, p.areaUnit) : "-" },
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

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ImageGallery images={p.images} />
        <aside className="rounded-2xl border border-clay/70 bg-white p-6 shadow-soft transition-all hover:bg-stone/10">
          <h1 className="text-2xl font-extrabold leading-tight">{p.title}</h1>
          <p className="mt-1 text-sm text-ink/70">{p.location?.area}, {p.location?.city}</p>
          <p className="mt-1 text-sm font-semibold text-ink/70">
            Listed by: {p.ownerId?.name || "Owner"} <span className="capitalize">({p.ownerId?.role || p.listingSource || "owner"})</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.verification?.isVerified && <span className="rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage">✓ Verified Listing</span>}
            {p.verification?.reraId && <span className="rounded-full bg-stone px-3 py-1 text-xs font-semibold">RERA: {p.verification.reraId}</span>}
            {p.possessionStatus && <span className="rounded-full bg-stone px-3 py-1 text-xs font-semibold">{p.possessionStatus}</span>}
          </div>
          <p className="mt-4 text-3xl font-extrabold text-sage">{currency(p.price)}</p>

          <div className="mt-6 flex flex-col gap-3">
             {isApproved ? (
               <div className="p-4 bg-sage/10 rounded-xl border border-sage/20">
                 <p className="text-xs font-bold text-sage uppercase mb-2">Approved Contact Details</p>
                 <p className="text-sm font-bold">{modalContact.name}</p>
                 <p className="text-lg font-extrabold text-ink">{modalContact.phone}</p>
                 <p className="text-xs text-ink/60">{modalContact.email}</p>
               </div>
             ) : isPending ? (
               <button disabled className="w-full rounded-xl bg-stone py-3 text-sm font-bold text-ink opacity-70 cursor-not-allowed">
                 Contact Request Pending Approval
               </button>
             ) : (
               <button
                 onClick={() => { setIntentType("contact"); setModalOpen(true); }}
                 className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-stone shadow-md hover:bg-[#2c3e50] transition-all"
               >
                 Request Mobile Number / Call
               </button>
             )}
            
            <button
              onClick={() => { setIntentType("brochure"); setModalOpen(true); }}
              className="w-full rounded-xl border-2 border-clay bg-transparent py-3 text-sm font-bold text-ink hover:bg-clay/10 transition-colors"
            >
              Get Brochure
            </button>
          </div>

          {p.virtualTourUrl && (
            <a href={p.virtualTourUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-sage">
              🎬 Open Virtual Tour
            </a>
          )}
        </aside>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-clay/70 bg-white p-6">
          <h2 className="text-lg font-bold">About this property</h2>
          <p className="mt-3 text-sm leading-6 text-ink/80">{p.description}</p>
          <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-ink/70">Key Facts</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-lg bg-stone p-2">
                <p className="text-[11px] font-semibold uppercase text-ink/60">{fact.label}</p>
                <p className="text-sm font-bold text-ink">{fact.value}</p>
              </div>
            ))}
          </div>
          {!!p.nearbyFacilities?.length && (
            <>
              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-ink/70">Nearby Facilities</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.nearbyFacilities.map((f) => (
                  <span key={f} className="rounded-full bg-stone px-3 py-1 text-xs font-semibold">{f}</span>
                ))}
              </div>
            </>
          )}
        </article>
        <article className="rounded-2xl border border-clay/70 bg-white p-3">
          <h2 className="px-3 pt-3 text-lg font-bold">Map View</h2>
          <iframe
            title="Google map"
            className="mt-3 h-72 w-full rounded-xl border-0"
            loading="lazy"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          />
        </article>
      </section>

      <section className="rounded-2xl border border-clay/70 bg-white p-6">
        <h2 className="text-lg font-bold">Locality Insights</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {Object.entries(data.localityInsights || {}).filter(([k]) => k !== "notes").map(([k, v]) => (
            <div key={k} className="rounded-xl bg-stone p-3 text-center">
              <p className="text-xs font-semibold uppercase text-ink/60">{k}</p>
              <p className="mt-1 text-xl font-bold">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink/70">{data.localityInsights?.notes}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Similar Properties</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data.similar.map((item) => <PropertyCard key={item._id} item={item} />)}
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
