import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { createProperty, updateProperty, uploadPropertyFiles } from "../services/api/propertyApi";
import { PROPERTY_REQUEST_TYPES } from "../constants/serviceRequests";

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

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(17,17,17,0.03)] outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5";

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
    <section className="form-modern glass-panel space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_32px_rgba(17,17,17,0.04)]">
      <h2 className="text-xl font-bold">{heading}</h2>

      {!hasPostingAccess && (
        <div className="neo-inset rounded-xl p-4 text-sm text-slate-600">
          Posting is currently disabled for this account. Enable `Property Posting` at signup or use a posting-enabled account.
        </div>
      )}

      {hasPostingAccess && !isAdmin && !canPostForFree && !initialData && (
        <div className="neo-inset rounded-xl p-4">
          <p className="text-sm text-slate-600">Your free 30-day period has expired or your plan credits are used up. Buy a plan to continue posting properties.</p>
          <button onClick={() => navigate("/plans")} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Go To Plans
          </button>
        </div>
      )}

      {hasPostingAccess && (isAdmin || canPostForFree || initialData) && (
        <form onSubmit={submitProperty} className="space-y-4">
          {!initialData && !isAdmin && (
            <div className="neo-inset rounded-xl p-4 text-sm text-slate-700">
              <p className="font-semibold">Your Active Plan Benefits</p>
              <p className="mt-1">Posting Credits: {remainingPosts} remaining out of {user?.activePlan?.listingLimit || 0}</p>
              <p>Customer Requests: {Math.max((user?.contactAccess?.monthlyLimit || 0) - (user?.contactAccess?.usedCount || 0), 0)} remaining</p>
              <p>Lead Credits: {user?.activePlan?.leadCredits || user?.leadCredits || 0}</p>
              <p>Validity: {user?.activePlan?.expiresAt ? new Date(user.activePlan.expiresAt).toLocaleDateString("en-IN") : "N/A"}</p>
              {!hasPostingQuota && (
                <p className="mt-2 font-semibold text-slate-700">
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
                className={`rounded-full px-3 py-1 text-xs font-semibold ${step === s.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {s.id}. {s.label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Listing Title <span className="text-red-500">*</span></span>
                  <input className={fieldClass} placeholder="e.g. 2 BHK Flat for Sale" value={form.title} onChange={(e) => update("title", e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Expected Price (Rs) <span className="text-red-500">*</span></span>
                  <input className={fieldClass} placeholder="Price" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-3 font-bold text-slate-900">Contact Details for this Listing</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Contact Name <span className="text-red-500">*</span></span>
                    <input className={fieldClass} placeholder="Your Name" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Mobile Number <span className="text-red-500">*</span></span>
                    <input className={fieldClass} placeholder="Mobile Number" type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} required />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-1 block text-sm font-semibold text-ink/80">Email ID <span className="text-red-500">*</span></span>
                    <input className={fieldClass} placeholder="Contact Email" type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} required />
                  </label>
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink/80">House Address <span className="text-red-500">*</span></span>
                <textarea className={fieldClass} rows="2" placeholder="Full House Address" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} required />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">City <span className="text-red-500">*</span></span>
                  <input className={fieldClass} placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Locality / Area <span className="text-red-500">*</span></span>
                  <input className={fieldClass} placeholder="Area" value={form.area} onChange={(e) => update("area", e.target.value)} required />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Property Type</span>
                  <select className={fieldClass} value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
                    {PROPERTY_REQUEST_TYPES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Listing For</span>
                  <select className={fieldClass} value={form.listingType} onChange={(e) => update("listingType", e.target.value)}>
                    <option value="sale">Selling</option>
                    <option value="rent">Rent</option>
                    <option value="new-project">New Project</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Posted By</span>
                  <select className={fieldClass} value={form.postedBy} onChange={(e) => update("postedBy", e.target.value)}>
                    <option value="owner">Owner</option>
                    <option value="agent">Agent</option>
                    <option value="builder">Builder</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">BHK</span>
                  <input className={fieldClass} type="number" placeholder="BHK" value={form.bhk} onChange={(e) => update("bhk", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Bathrooms</span>
                  <input className={fieldClass} type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Carpet Area</span>
                  <input className={fieldClass} type="number" placeholder="Carpet Area" value={form.carpetArea} onChange={(e) => update("carpetArea", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Built-up Area</span>
                  <input className={fieldClass} type="number" placeholder="Built-up Area" value={form.builtupArea} onChange={(e) => update("builtupArea", e.target.value)} />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Unit</span>
                  <select className={fieldClass} value={form.areaUnit} onChange={(e) => update("areaUnit", e.target.value)}>
                    <option value="sqft">sq.ft</option>
                    <option value="sqm">sq.m</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Furnishing</span>
                  <select className={fieldClass} value={form.furnishingStatus} onChange={(e) => update("furnishingStatus", e.target.value)}>
                    <option>Furnished</option>
                    <option>Semi-Furnished</option>
                    <option>Unfurnished</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Possession</span>
                  <select className={fieldClass} value={form.possessionStatus} onChange={(e) => update("possessionStatus", e.target.value)}>
                    <option>Ready to Move</option>
                    <option>Under Construction</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-ink/80">Facing</span>
                  <select className={fieldClass} value={form.facing} onChange={(e) => update("facing", e.target.value)}>
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
                <textarea className={fieldClass} rows="4" minLength={10} placeholder="Provide details about the locality, facilities, and house conditions..." value={form.houseDetails} onChange={(e) => update("houseDetails", e.target.value)} required />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <div className="glass-panel relative rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-bold text-slate-900">Property Images</h3>
                <p className="mb-3 mt-1 text-xs text-slate-500">Upload clear photos of the property (JPG, PNG, WEBP). You can upload up to 5 images.</p>
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
                    <p className="mb-2 text-xs font-semibold text-slate-700">Uploaded {uploadedImages.length} images.</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {uploadedImages.map((src, idx) => (
                        <div key={idx} className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 shadow-sm">
                          <img src={src} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-panel relative rounded-[24px] border border-slate-200 p-4">
                <h3 className="text-lg font-bold text-slate-900">Brochure / Layout Plan (PDF)</h3>
                <p className="mb-3 mt-1 text-xs text-slate-500">Attach a PDF brochure for buyers to download directly.</p>
                <input className="w-full" type="file" multiple accept="application/pdf" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="neo-btn mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
                  {uploading ? "Uploading..." : "Upload PDF Brochure"}
                </button>
                {!!uploadedDocs.length && <p className="mt-2 text-xs font-semibold text-slate-700">Uploaded {uploadedDocs.length} documents.</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="neo-inset animate-fade-up space-y-3 rounded-[24px] p-6 text-sm text-slate-700">
              <h3 className="text-lg font-bold text-slate-900">Confirm & Publish</h3>
              <p className="font-semibold">Publishing workflow:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Listing will be published live and shown on the home page after you complete posting.</li>
                <li>Buyers can contact via inquiry/callback/visit actions based on your credits.</li>
                <li>You can edit these details anytime from your dashboard.</li>
              </ul>
              <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">Ready to take your property live?</p>
                <p className="mt-1 text-xs text-slate-500">Make sure you have uploaded at least one image for better visibility.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="rounded-lg px-6 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
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
                  className="rounded-lg bg-slate-900 px-8 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-black disabled:opacity-40"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-2xl bg-slate-900 px-10 py-3 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(17,17,17,0.08)] transition-all hover:-translate-y-[6px] hover:bg-black disabled:opacity-40"
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
