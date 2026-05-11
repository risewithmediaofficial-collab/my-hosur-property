import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { createProperty, updateProperty, uploadPropertyFiles } from "../services/api/propertyApi";

const defaultForm = {
  title: "",
  description: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  houseAddress: "",
  city: "Hosur",
  area: "",
  postedBy: "owner",
  listingType: "sale",
  propertyType: "Apartment",
  price: "",
  bhk: "2",
  bathrooms: "2",
  furnishingStatus: "Unfurnished",
  carpetArea: "",
  builtupArea: "",
  areaUnit: "sqft",
  possessionStatus: "Ready to Move",
  facing: "",
  reraId: "",
  houseDetails: "",
};

const steps = [
  { id: 1, label: "Basic" },
  { id: 2, label: "Property" },
  { id: 3, label: "Media" },
  { id: 4, label: "Publish" },
];

const PropertyPostingForm = ({ heading = "Post Property", onSuccess, initialData = null }) => {
  const navigate = useNavigate();
  const { token, user, refreshProfile } = useAuth();
  const isAdmin = user?.role === "admin";
  const hasPostingAccess = ["seller", "agent", "broker", "builder", "admin"].includes(user?.role) || Boolean(user?.canPostProperty);

  const [form, setForm] = useState(initialData?.form || defaultForm);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(initialData?.images || []);
  const [uploadedDocs, setUploadedDocs] = useState(initialData?.documents || []);
  const [step, setStep] = useState(1);

  const hasActivePlan = useMemo(() => {
    const plan = user?.activePlan;
    if (!plan?.expiresAt) return false;
    return new Date(plan.expiresAt) >= new Date();
  }, [user?.activePlan]);

  const hasPostingQuota = useMemo(
    () => (user?.activePlan?.listingsUsed || 0) < (user?.activePlan?.listingLimit || 0),
    [user?.activePlan?.listingsUsed, user?.activePlan?.listingLimit]
  );

  const remainingPosts = Math.max((user?.activePlan?.listingLimit || 0) - (user?.activePlan?.listingsUsed || 0), 0);

  const canPostForFree = hasActivePlan && hasPostingQuota;


  useEffect(() => {
    refreshProfile?.().catch(() => {});
  }, [refreshProfile]);

  useEffect(() => {
    if (!isAdmin && hasPostingAccess && !canPostForFree && !initialData) {
      toast.error("Your free 30-day posting period has ended or no plan credits left. Buy a plan to post.");
      navigate("/plans");
    }
  }, [canPostForFree, isAdmin, hasPostingAccess, navigate, initialData]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const isStepValid = (s) => {
    if (s === 1) {
      return (
        form.title.trim() &&
        form.price &&
        form.contactName.trim() &&
        form.contactPhone.trim() &&
        form.houseAddress.trim() &&
        form.city.trim() &&
        form.area.trim()
      );
    }
    if (s === 2) {
      return form.propertyType && form.listingType && form.postedBy && form.bhk && form.bathrooms && (form.houseDetails || "").trim().length >= 10;
    }
    return true;
  };

  const uploadAssets = async () => {
    if (!files.length) return;

    try {
      setUploading(true);
      const res = await uploadPropertyFiles(token, files);
      setUploadedImages((prev) => [...prev, ...(res.images || [])]);
      setUploadedDocs((prev) => [...prev, ...(res.documents || [])]);
      setFiles([]);
      toast.success("Files uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitProperty = async (e) => {
    e.preventDefault();
    if (!isStepValid(1) || !isStepValid(2)) {
      toast.error("Please fill all required details in previous steps.");
      setStep(1);
      return;
    }

    try {
      setPublishing(true);
      const safeDetails = (form.houseDetails || form.description || "").trim();
      const description = safeDetails.length >= 10 ? safeDetails : `${safeDetails} - house details`;
      const safeAddress = (form.houseAddress || "").trim();

      const payload = {
        title: form.title.trim() || `Property at ${safeAddress.slice(0, 60) || "Hosur"}`,
        description,
        price: Number(form.price || 0),
        propertyType: form.propertyType,
        bhk: Number(form.bhk || 0),
        bathrooms: Number(form.bathrooms || 0),
        listingType: form.listingType,
        furnishingStatus: form.furnishingStatus,
        listingSource: form.postedBy,
        carpetArea: form.carpetArea ? Number(form.carpetArea) : undefined,
        builtupArea: form.builtupArea ? Number(form.builtupArea) : undefined,
        areaUnit: form.areaUnit,
        possessionStatus: form.possessionStatus,
        facing: form.facing || undefined,
        amenities: [],
        nearbyFacilities: [],
        virtualTourUrl: "",
        images: uploadedImages,
        documents: uploadedDocs,
        verification: {
          reraId: form.reraId || "",
        },
        listingContact: {
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail || user?.email || "",
        },
        location: {
          city: (form.city || "Hosur").trim(),
          area: (form.area || safeAddress.slice(0, 40) || "General").trim(),
          address: safeAddress,
        },
      };

      if (initialData?._id) {
        await updateProperty(token, initialData._id, payload);
        toast.success("Property updated successfully");
      } else {
        await createProperty(token, payload);
        toast.success(isAdmin ? "Property posted live" : "Property submitted successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save property");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="form-modern glass-panel space-y-6 rounded-2xl border border-white/70 bg-white/60 p-6">
      <h2 className="text-xl font-bold">{heading}</h2>

      {!hasPostingAccess && (
        <div className="neo-inset rounded-xl p-4 text-sm text-ink/75">
          Posting is currently disabled for this account. Enable `Property Posting` at signup or use a posting-enabled account.
        </div>
      )}

      {hasPostingAccess && !isAdmin && !canPostForFree && !initialData && (
        <div className="neo-inset rounded-xl p-4">
          <p className="text-sm text-ink/75">Your free 30-day period has expired or your plan credits are used up. Buy a plan to continue posting properties.</p>
          <button onClick={() => navigate("/plans")} className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-stone shadow-soft">
            Go To Plans
          </button>
        </div>
      )}

      {hasPostingAccess && (isAdmin || canPostForFree || initialData) && (
        <form onSubmit={submitProperty} className="space-y-4">
          {!initialData && !isAdmin && (
            <div className="neo-inset rounded-xl p-4 text-sm text-ink/80">
              <p className="font-semibold">Your Active Plan Benefits</p>
              <p className="mt-1">Posting Credits: {remainingPosts} remaining out of {user?.activePlan?.listingLimit || 0}</p>
              <p>Customer Requests: {Math.max((user?.contactAccess?.monthlyLimit || 0) - (user?.contactAccess?.usedCount || 0), 0)} remaining</p>
              <p>Lead Credits: {user?.activePlan?.leadCredits || user?.leadCredits || 0}</p>
              <p>Validity: {user?.activePlan?.expiresAt ? new Date(user.activePlan.expiresAt).toLocaleDateString("en-IN") : "N/A"}</p>
              {!hasPostingQuota && (
                <p className="mt-2 font-semibold text-amber-700">
                  Posting credits are fully used. Buy/upgrade a plan in Plans page to publish new listings.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {steps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => isStepValid(s - 1) && setStep(s.id)}
                disabled={s > step && !isStepValid(step)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${step === s.id ? "bg-ink text-stone" : "bg-stone text-ink opacity-60"}`}
              >
                {s.id}. {s.label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Listing Title <span className="text-red-500">*</span></span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="e.g. 2 BHK Flat for Sale" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Expected Price (Rs) <span className="text-red-500">*</span></span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="Price" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required />
                </label>
              </div>

              <div className="rounded-xl border border-clay/60 bg-white/50 p-4">
                <h3 className="mb-3 font-bold text-ink">Contact Details for this Listing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Contact Name <span className="text-red-500">*</span></span>
                    <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="Your Name" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Mobile Number <span className="text-red-500">*</span></span>
                    <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="Mobile Number" type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} required />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Email ID <span className="text-red-500">*</span></span>
                    <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="Contact Email" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} required />
                  </label>
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink/80">House Address <span className="text-red-500">*</span></span>
                <textarea className="w-full rounded-lg border border-clay px-3 py-2" rows="2" placeholder="Full House Address" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} required />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">City <span className="text-red-500">*</span></span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Locality / Area <span className="text-red-500">*</span></span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" placeholder="Area" value={form.area} onChange={(e) => update("area", e.target.value)} required />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Property Type</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Independent House</option>
                    <option>Plot</option>
                    <option>Commercial</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Listing For</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.listingType} onChange={(e) => update("listingType", e.target.value)}>
                    <option value="sale">Selling</option>
                    <option value="rent">Rent</option>
                    <option value="new-project">New Project</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Posted By</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.postedBy} onChange={(e) => update("postedBy", e.target.value)}>
                    <option value="owner">Owner</option>
                    <option value="agent">Agent</option>
                    <option value="builder">Builder</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">BHK</span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" type="number" placeholder="BHK" value={form.bhk} onChange={(e) => update("bhk", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Bathrooms</span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Carpet Area</span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" type="number" placeholder="Carpet Area" value={form.carpetArea} onChange={(e) => update("carpetArea", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Built-up Area</span>
                  <input className="w-full rounded-lg border border-clay px-3 py-2" type="number" placeholder="Built-up Area" value={form.builtupArea} onChange={(e) => update("builtupArea", e.target.value)} />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Unit</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.areaUnit} onChange={(e) => update("areaUnit", e.target.value)}>
                    <option value="sqft">sq.ft</option>
                    <option value="sqm">sq.m</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Furnishing</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.furnishingStatus} onChange={(e) => update("furnishingStatus", e.target.value)}>
                    <option>Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Possession</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.possessionStatus} onChange={(e) => update("possessionStatus", e.target.value)}>
                    <option>Ready to Move</option>
                    <option>Under Construction</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Facing</span>
                  <select className="w-full rounded-lg border border-clay px-3 py-2" value={form.facing} onChange={(e) => update("facing", e.target.value)}>
                    <option value="">Optional</option>
                    <option>North</option>
                    <option>South</option>
                    <option>East</option>
                    <option>West</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink/80">Property Description <span className="text-red-500">*</span></span>
                <textarea className="w-full rounded-lg border border-clay px-3 py-2" rows="4" minLength={10} placeholder="Provide details about the locality, facilities, and house conditions..." value={form.houseDetails} onChange={(e) => update("houseDetails", e.target.value)} required />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="glass-panel rounded-xl border border-white/70 p-4 relative">
                <h3 className="font-bold text-lg text-ink">Property Images</h3>
                <p className="text-xs text-ink/70 mt-1 mb-3">Upload clear photos of the property (JPG, PNG, WEBP). You can upload up to 5 images.</p>
                <input className="w-full" type="file" multiple accept="image/*" onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  if (selectedFiles.length > 5) {
                    toast.error("You can upload a maximum of 5 images.");
                    e.target.value = "";
                    return;
                  }
                  setFiles(selectedFiles);
                }} />
                <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="neo-btn mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
                  {uploading ? "Uploading..." : "Upload Selected Images"}
                </button>
                {!!uploadedImages.length && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-sage mb-2">Uploaded {uploadedImages.length} images.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {uploadedImages.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden border-2 border-clay shadow-sm group">
                          <img src={src} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-panel rounded-xl border border-white/70 p-4 relative">
                <h3 className="font-bold text-lg text-ink">Brochure / Layout Plan (PDF)</h3>
                <p className="text-xs text-ink/70 mt-1 mb-3">Attach a PDF brochure for buyers to download directly.</p>
                <input className="w-full" type="file" multiple accept="application/pdf" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="neo-btn mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
                  {uploading ? "Uploading..." : "Upload PDF Brochure"}
                </button>
                {!!uploadedDocs.length && <p className="mt-2 text-xs font-semibold text-sage">Uploaded {uploadedDocs.length} documents.</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="neo-inset rounded-xl p-6 text-sm text-ink/80 animate-fade-in space-y-3">
              <h3 className="text-lg font-bold text-ink">Confirm & Publish</h3>
              <p className="font-semibold">Publishing workflow:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Listing will be published live and shown on the home page after you complete posting.</li>
                <li>Buyers can contact via inquiry/callback/visit actions based on your credits.</li>
                <li>You can edit these details anytime from your dashboard.</li>
              </ul>
              <div className="mt-4 p-4 bg-sage/10 rounded-xl border border-sage/20">
                <p className="text-sage font-bold">Ready to take your property live?</p>
                <p className="text-xs text-ink/70 mt-1">Make sure you have uploaded at least one image for better visibility.</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-4 pt-4 mt-6 border-t border-clay/40">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="px-6 py-2 rounded-lg text-sm font-bold text-ink/70 hover:bg-stone transition-all"
              disabled={step === 1}
            >
              Back
            </button>
            <div className="flex gap-3">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => prev + 1)}
                  disabled={!isStepValid(step)}
                  className="rounded-lg bg-ink px-8 py-2.5 text-sm font-extrabold text-stone shadow-lg hover:shadow-xl transition-all disabled:opacity-40"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-lg bg-sage px-10 py-2.5 text-sm font-extrabold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-40 animate-pulse-slow"
                >
                  {publishing ? "Saving..." : initialData ? "Save Changes" : "Publish Property"}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default PropertyPostingForm;
