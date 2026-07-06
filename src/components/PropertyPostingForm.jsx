import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ClipboardDocumentCheckIcon, CreditCardIcon, TicketIcon, UserCircleIcon, XMarkIcon } from "./AppIcons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { createProperty, updateProperty, uploadPropertyFiles } from "../services/api/propertyApi";
import { updateProfile } from "../services/api/authApi";

const propertyTypes = [
  "Plot",
  "Villa",
  "Flat",
  "Independent House",
  "Rent",
  "Apartment",
  "PG",
  "Commercial Land / Building",
  "Agri Land",
];

const landAreaOptions = ["1200 sq feet", "1500 sq feet", "1800 sq feet", "2400 sq feet"];
const priceOptions = ["7.00 L", "10.00 L", "12.00 L", "15.00 L"];
const independentHouseMinPriceRanges = ["40 to 60 L", "60 to 80 L", "80 L to 1 Cr", "1 Cr to 1.5 Cr"];
const facingOptions = ["East", "West", "North", "South"];
const yesNoOptions = ["Yes", "No"];

const defaultForm = {
  propertyType: "",
  title: "",
  description: "",
  isSold: false,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  country: "India",
  state: "Tamil Nadu",
  district: "Krishnagiri",
  taluk: "Hosur",
  village: "Bagalur",
  houseAddress: "",
  city: "Hosur",
  area: "Bagalur",
  postedBy: "owner",
  listingType: "sale",
  price: "",
  minPrice: "",
  maxPrice: "",
  landArea: "",
  length: "",
  width: "",
  individualPlot: "Yes",
  gatedCommunity: "No",
  cctvCamera: "No",
  security: "No",
  dtcp: "No",
  hmda: "No",
  hntda: "No",
  rera: "No",
  reraId: "",
  bhk: "",
  bathrooms: "",
  furnishingStatus: "Unfurnished",
  floorNumber: "",
  totalFloors: "",
  carpetArea: "",
  builtupArea: "",
  areaUnit: "sqft",
  possessionStatus: "Ready to Move",
  facing: "",
  parking: "No",
  balcony: "No",
  lift: "No",
  powerBackup: "No",
  waterSupply: "No",
  roadAccess: "No",
  boundaryWall: "No",
  electricity: "No",
  sharingType: "",
  monthlyRent: "",
  deposit: "",
  foodIncluded: "No",
  frontage: "",
  roadWidth: "",
  waterSource: "",
  cropSuitable: "",
};

const typeFieldConfig = {
  Plot: {
    description: "Land-only details. No BHK, floor, furnishing, or house-facing fields.",
    detailTitle: "Plot Details",
    priceLabel: "Expected Plot Price",
    detailFields: ["landArea", "length", "width", "individualPlot"],
    featureFields: ["gatedCommunity", "cctvCamera", "security", "dtcp", "hmda", "rera"],
  },
  Villa: {
    description: "Independent villa details with rooms, build-up area, and home facilities.",
    detailTitle: "Villa Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["bhk", "bathrooms", "builtupArea", "carpetArea", "furnishingStatus", "facing"],
    featureFields: ["gatedCommunity", "cctvCamera", "security", "parking", "balcony", "powerBackup", "rera"],
  },
  Flat: {
    description: "Flat details with floor, total floors, rooms, and apartment facilities.",
    detailTitle: "Flat Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["bhk", "bathrooms", "builtupArea", "floorNumber", "totalFloors", "furnishingStatus", "facing"],
    featureFields: ["lift", "security", "parking", "balcony", "powerBackup", "rera"],
  },
  "Independent House": {
    description: "House details with rooms, land/building area, and utilities.",
    detailTitle: "Individual House Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["bhk", "bathrooms", "builtupArea", "landArea", "furnishingStatus", "facing"],
    featureFields: ["parking", "waterSupply", "security", "cctvCamera", "dtcp", "hntda", "rera"],
  },
  Rent: {
    description: "Rental property details with rent, deposit, rooms, and basic facilities.",
    detailTitle: "Rental Details",
    priceLabel: "Monthly Rent",
    detailFields: ["bhk", "bathrooms", "monthlyRent", "deposit", "furnishingStatus"],
    featureFields: ["parking", "waterSupply", "security", "lift", "powerBackup"],
  },
  Apartment: {
    description: "Apartment details with floor, rooms, area, and common facilities.",
    detailTitle: "Apartment Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["bhk", "bathrooms", "builtupArea", "floorNumber", "totalFloors", "furnishingStatus", "facing"],
    featureFields: ["lift", "security", "parking", "balcony", "powerBackup", "rera"],
  },
  PG: {
    description: "PG details with sharing type, rent, deposit, food, and safety facilities.",
    detailTitle: "PG Details",
    priceLabel: "Monthly Rent",
    detailFields: ["sharingType", "monthlyRent", "deposit", "furnishingStatus", "bathrooms"],
    featureFields: ["foodIncluded", "security", "cctvCamera", "waterSupply", "powerBackup"],
  },
  "Commercial Land / Building": {
    description: "Commercial property details. No BHK or residential room fields.",
    detailTitle: "Commercial Details",
    priceLabel: "Expected Commercial Price",
    detailFields: ["landArea", "builtupArea", "frontage", "roadWidth"],
    featureFields: ["roadAccess", "parking", "security", "cctvCamera", "dtcp", "rera"],
  },
  "Agri Land": {
    description: "Agricultural land details. No BHK, floor, furnishing, or facing fields.",
    detailTitle: "Agricultural Land Details",
    priceLabel: "Expected Land Price",
    detailFields: ["landArea", "roadWidth", "waterSource", "cropSuitable"],
    featureFields: ["roadAccess", "waterSupply", "electricity", "boundaryWall", "dtcp"],
  },
};

const fieldLabels = {
  landArea: "Land Area",
  length: "Length",
  width: "Width",
  individualPlot: "Individual Plot",
  bhk: "BHK / Rooms",
  bathrooms: "Bathrooms",
  builtupArea: "Built-up Area",
  carpetArea: "Carpet Area",
  furnishingStatus: "Furnishing",
  floorNumber: "Floor Number",
  totalFloors: "Total Floors",
  facing: "Facing",
  monthlyRent: "Monthly Rent",
  deposit: "Deposit",
  sharingType: "Sharing Type",
  frontage: "Frontage",
  roadWidth: "Road Width",
  waterSource: "Water Source",
  cropSuitable: "Crop Suitable",
  gatedCommunity: "Gated Community",
  cctvCamera: "CCTV Camera",
  security: "Security",
  dtcp: "DTCP",
  hmda: "HMDA",
  hntda: "HNTDA Approved",
  rera: "RERA",
  parking: "Parking",
  balcony: "Balcony",
  lift: "Lift",
  powerBackup: "Power Backup",
  waterSupply: "Water Supply",
  roadAccess: "Road Access",
  boundaryWall: "Boundary Wall",
  electricity: "Electricity",
  foodIncluded: "Food Included",
};

const toNumber = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d.]/g, "");
  const amount = Number(cleaned || 0);
  return /l/i.test(String(value)) ? amount * 100000 : amount;
};

const getApiPropertyType = (type) => {
  if (type === "Rent") return "House";
  if (type === "Commercial Land / Building") return "Commercial Land / Building";
  return type;
};

const getListingType = (type) => (type === "Rent" || type === "PG" ? "rent" : "sale");

const roleLabels = {
  buyer: "Buyer",
  customer: "Customer",
  seller: "Owner / Seller",
  agent: "Agent",
  broker: "Broker",
  builder: "Builder",
  admin: "Admin",
};

const formatDate = (value) => {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No expiry";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const PropertyPostingForm = ({ heading = "Post Property", onSuccess, initialData = null }) => {
  const navigate = useNavigate();
  const { token, user, refreshProfile } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEditMode = Boolean(initialData);
  const hasPostingAccess = ["seller", "agent", "broker", "builder", "admin"].includes(user?.role) || Boolean(user?.canPostProperty);

  const [form, setForm] = useState(initialData?.form || defaultForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(initialData?.images || []);
  const [uploadedDocs, setUploadedDocs] = useState(initialData?.documents || []);

  const [profileForm, setProfileForm] = useState({
    email: "",
    address: "",
    role: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        email: user.email || "",
        address: user.address || "",
        role: user.role === "buyer" ? "" : (user.role || ""),
      });
    }
  }, [user]);

  const isProfileIncomplete = !isAdmin && (!user?.email || !user?.address || user?.role === "buyer");

  const config = typeFieldConfig[form.propertyType] || null;
  const formDialogOpen = !isEditMode && modalOpen && Boolean(config);

  useBodyScrollLock(formDialogOpen);

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
  const postingLimit = user?.activePlan?.listingLimit || 0;
  const postingUsed = user?.activePlan?.listingsUsed || 0;
  const contactLimit = user?.contactAccess?.monthlyLimit || user?.activePlan?.contactUnlocks || 0;
  const contactUsed = user?.contactAccess?.usedCount || 0;
  const contactLeft = Math.max(contactLimit - contactUsed, 0);
  const leadCreditsLeft = Math.max((user?.activePlan?.leadCredits || 0) + (user?.leadCredits || 0), 0);
  const planExpired = Boolean(user?.activePlan?.expiresAt && new Date(user.activePlan.expiresAt) < new Date());
  const activePlanName = user?.activePlan?.planId?.name || (isAdmin ? "Admin access" : postingLimit === 1 ? "Free 90-day listing" : "Active posting plan");
  const accountType = roleLabels[user?.role] || "User";
  const accountContact = useMemo(
    () => ({
      name: user?.name?.trim() || form.contactName.trim(),
      phone: user?.phone?.trim() || form.contactPhone.trim(),
      email: user?.email?.trim() || form.contactEmail.trim(),
    }),
    [form.contactEmail, form.contactName, form.contactPhone, user?.email, user?.name, user?.phone]
  );

  useEffect(() => {
    refreshProfile?.().catch(() => {});
  }, [refreshProfile]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      contactName: user.name || prev.contactName,
      contactPhone: user.phone || prev.contactPhone,
      contactEmail: user.email || prev.contactEmail,
    }));
  }, [user]);

  useEffect(() => {
    if (!isAdmin && hasPostingAccess && !canPostForFree && !initialData) {
      toast.error("Your free 90-day posting period has ended or no plan credits left. Buy a plan to post.");
      navigate("/plans");
    }
  }, [canPostForFree, isAdmin, hasPostingAccess, navigate, initialData]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.email || !profileForm.address || !profileForm.role) {
      toast.error("Please fill in all profile details.");
      return;
    }
    setProfileSaving(true);
    try {
      const result = await updateProfile(token, profileForm);
      if (result.success) {
        toast.success("Profile details saved!");
        if (refreshProfile) {
          await refreshProfile();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const preserveContactFields = (prev) => ({
    country: prev.country || defaultForm.country,
    state: prev.state || defaultForm.state,
    district: prev.district || defaultForm.district,
    taluk: prev.taluk || defaultForm.taluk,
    village: prev.village || defaultForm.village,
    city: prev.city || defaultForm.city,
    area: prev.area || defaultForm.area,
  });

  const openTypeForm = (type) => {
    setForm({
      ...defaultForm,
      ...preserveContactFields(form),
      propertyType: type,
      listingType: getListingType(type),
    });
    setFiles([]);
    setUploadedImages([]);
    setUploadedDocs([]);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setForm((prev) => ({ ...defaultForm, ...preserveContactFields(prev) }));
  };

  const validateForm = () => {
    if (!accountContact.name || !accountContact.phone) {
      return "Your account details are incomplete. Please make sure your name and phone number are available before posting.";
    }

    const required = [
      form.propertyType,
      form.country.trim(),
      form.state.trim(),
      form.district.trim(),
      form.taluk.trim(),
      form.village.trim(),
      form.area.trim(),
      form.houseAddress.trim(),
      form.description.trim(),
    ];

    if (required.some((value) => !value)) return "Please fill location, price, and description details.";
    if (!form.price && !form.maxPrice && !form.monthlyRent) return "Please fill location, price, and description details.";
    if (form.propertyType === "Independent House" && !form.minPrice) return "Please select the minimum price range for the independent house listing.";
    if (form.description.trim().length < 10) return "Please add a more detailed property description.";

    return "";
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

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setPublishing(true);
      const apiPropertyType = getApiPropertyType(form.propertyType);
      const price = toNumber(form.price || form.maxPrice || form.monthlyRent);
      const title = form.title.trim() || `${form.propertyType} in ${form.village || form.area}, ${form.taluk || "Hosur"}`;
      const activeConfig = typeFieldConfig[form.propertyType] || { detailFields: [], featureFields: [] };

      const amenities = activeConfig.featureFields
        .filter((field) => form[field] === "Yes")
        .map((field) => fieldLabels[field]);

      const detailLines = [
        `Property Type: ${form.propertyType}`,
        `Location: ${form.village}, ${form.taluk}, ${form.district}, ${form.state}, ${form.country}`,
        form.landArea ? `Land Area: ${form.landArea}` : "",
        form.builtupArea ? `Built-up Area: ${form.builtupArea}` : "",
        form.bhk ? `Rooms: ${form.bhk}` : "",
        form.minPrice ? `Min Price Range: ${form.minPrice}` : "",
        form.propertyType === "Independent House" && form.hntda ? `HNTDA Approved: ${form.hntda}` : "",
        form.maxPrice ? `Max Price: ${form.maxPrice}` : "",
        form.length ? `Length: ${form.length}` : "",
        form.width ? `Width: ${form.width}` : "",
        form.roadWidth ? `Road Width: ${form.roadWidth}` : "",
        form.waterSource ? `Water Source: ${form.waterSource}` : "",
        amenities.length ? `Facilities: ${amenities.join(", ")}` : "",
        form.description,
      ].filter(Boolean);

      const payload = {
        title,
        description: detailLines.join("\n"),
        price,
        propertyType: apiPropertyType,
        bhk: Number(form.bhk || 0),
        bathrooms: Number(form.bathrooms || 0),
        listingType: getListingType(form.propertyType),
        furnishingStatus: form.furnishingStatus,
        listingSource: form.postedBy,
        carpetArea: toNumber(form.carpetArea),
        builtupArea: toNumber(form.builtupArea || form.landArea),
        areaUnit: form.areaUnit,
        possessionStatus: form.possessionStatus,
        facing: form.facing || undefined,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
        totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
        isSold: form.isSold === true || form.isSold === "true",
        amenities,
        nearbyFacilities: [],
        virtualTourUrl: "",
        images: uploadedImages,
        documents: uploadedDocs,
        verification: {
          reraId: form.rera === "Yes" ? form.reraId : "",
        },
        listingContact: {
          name: accountContact.name,
          phone: accountContact.phone,
          email: accountContact.email || "",
        },
        location: {
          city: (form.city || form.taluk || "Hosur").trim(),
          area: (form.area || form.village || "General").trim(),
          address: [form.houseAddress, form.village, form.taluk, form.district, form.state, form.country].filter(Boolean).join(", "),
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

  const renderInput = (field) => {
    if (field === "landArea") {
      return <DataInput field={field} value={form[field]} options={landAreaOptions} onChange={update} placeholder="Select or type land area" />;
    }
    if (["price", "minPrice", "maxPrice", "monthlyRent", "deposit"].includes(field)) {
      return <DataInput field={field} value={form[field]} options={priceOptions} onChange={update} placeholder="Select or type amount" />;
    }
    if (field === "facing") {
      return <Select field={field} value={form[field]} options={["", ...facingOptions]} onChange={update} />;
    }
    if (field === "furnishingStatus") {
      return <Select field={field} value={form[field]} options={["Furnished", "Semi-Furnished", "Unfurnished"]} onChange={update} />;
    }
    if (field === "sharingType") {
      return <Select field={field} value={form[field]} options={["", "Single Sharing", "Two Sharing", "Three Sharing", "Four Sharing"]} onChange={update} />;
    }
    if (field === "individualPlot") {
      return <YesNoGroup field={field} value={form[field]} onChange={update} />;
    }
    return <input className="site-input" value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder={fieldLabels[field]} />;
  };

  const renderFormBody = () => {
    if (!config) return null;

    return (
      <form onSubmit={submitProperty} className="space-y-8">
        <FormSection title="Contact Details">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange">Auto-filled from your account</p>
                <h4 className="mt-1 text-base font-bold text-navy">Registered contact details</h4>
              </div>
              <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Locked to account
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <ReadOnlyField label="Contact Name" value={accountContact.name} fallback="Name not available" />
              <ReadOnlyField label="Mobile Number" value={accountContact.phone} fallback="Phone not available" />
              <ReadOnlyField label="Email ID" value={accountContact.email} fallback="Email not available" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Location Details">
          <div className="grid gap-4 md:grid-cols-3">
            {["country", "state", "district", "taluk", "village", "area"].map((field) => (
              <Field key={field} label={field[0].toUpperCase() + field.slice(1)} required>
                <input className="site-input" value={form[field]} onChange={(e) => update(field, e.target.value)} />
              </Field>
            ))}
            <Field label="Full Address / Survey Details" required className="md:col-span-3">
              <textarea className="site-input min-h-[88px] resize-none" rows="2" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} placeholder="Street, survey number, landmark" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price Details">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={config.priceLabel} required>
              {renderInput(config.priceLabel.includes("Rent") ? "monthlyRent" : "price")}
            </Field>
            {form.propertyType === "Independent House" ? (
              <Field label="Minimum Price Range" required className="md:col-span-2">
                <MinPriceRangeGroup value={form.minPrice} onChange={(value) => update("minPrice", value)} />
              </Field>
            ) : (
              <>
                <Field label="Min Price">{renderInput("minPrice")}</Field>
                <Field label="Max Price">{renderInput("maxPrice")}</Field>
              </>
            )}
          </div>
        </FormSection>

        <FormSection title={config.detailTitle}>
          <div className="grid gap-4 md:grid-cols-3">
            {config.detailFields.map((field) => (
              <Field key={field} label={fieldLabels[field]}>
                {renderInput(field)}
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection title="Facilities / Features">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.featureFields.map((field) => (
              <div key={field}>
                <p className="mb-2 text-sm font-semibold text-navy">{fieldLabels[field]}</p>
                <YesNoGroup field={field} value={form[field]} onChange={update} />
              </div>
            ))}
          </div>
          {form.rera === "Yes" ? (
            <div className="mt-4 max-w-md">
              <Field label="RERA ID">
                <input className="site-input" value={form.reraId} onChange={(e) => update("reraId", e.target.value)} placeholder="RERA number" />
              </Field>
            </div>
          ) : null}
        </FormSection>

        <FormSection title="Description">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Listing Title">
              <input className="site-input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={`${form.propertyType} in ${form.village}`} />
            </Field>
            <Field label="Posted By">
              <Select field="postedBy" value={form.postedBy} options={["owner", "agent", "builder"]} onChange={update} />
            </Field>
            <Field label="Property Description" required className="md:col-span-2">
              <textarea className="site-input min-h-[120px] resize-none" rows="4" minLength={10} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Explain locality, road access, nearby schools, condition, approvals, and buyer/renter notes." />
            </Field>
          </div>
        </FormSection>

        {isEditMode && (
          <FormSection title="Property Status">
            <div className="rounded-lg bg-surface p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isSold === true || form.isSold === "true"}
                  onChange={(e) => update("isSold", e.target.checked)}
                  className="h-5 w-5 cursor-pointer rounded border-slate-300"
                />
                <div>
                  <p className="text-sm font-semibold text-navy">Mark this property as sold</p>
                  <p className="text-xs text-slate-600">Check this box if this property has been sold and is no longer available for sale or rent.</p>
                </div>
              </label>
            </div>
          </FormSection>
        )}

        <FormSection title="Upload Images & Documents">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-4">
              <h4 className="text-sm font-bold text-navy">Property Images</h4>
              <p className="mt-1 text-xs text-slate-500">Upload clear property images. Maximum 5 files per upload.</p>
              <input className="mt-3 w-full text-sm" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
              <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="site-button-secondary mt-3 px-4 py-2 text-sm disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload selected images"}
              </button>
              {!!uploadedImages.length && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {uploadedImages.map((src, idx) => (
                    <div key={idx} className="aspect-square overflow-hidden rounded-lg bg-white">
                      <img src={src} alt="Uploaded property" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface p-4">
              <h4 className="text-sm font-bold text-navy">Brochure / Layout Plan</h4>
              <p className="mt-1 text-xs text-slate-500">Attach PDF layout, approval, or brochure files.</p>
              <input className="mt-3 w-full text-sm" type="file" multiple accept="application/pdf" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
              <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="site-button-secondary mt-3 px-4 py-2 text-sm disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload PDF brochure"}
              </button>
              {!!uploadedDocs.length && <p className="mt-3 text-xs font-semibold text-slate-600">Uploaded {uploadedDocs.length} documents.</p>}
            </div>
          </div>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {!isEditMode ? (
            <button type="button" onClick={closeFormModal} className="site-button-secondary px-5 py-3 text-sm">
              Back to property types
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={publishing} className="site-button-primary px-8 py-3 text-sm disabled:opacity-50">
            {publishing ? "Saving..." : initialData ? "Save changes" : "Publish property"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="section-tag">{isEditMode ? "Edit listing" : "Step 1"}</p>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{heading}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          {isEditMode
            ? "Update your listing details below. All fields match the property type you selected when posting."
            : "Choose a property type below. The posting form opens in a popup with only the fields needed for that type."}
        </p>
      </div>

      {!hasPostingAccess && (
        <div className="rounded-xl bg-surface p-4 text-sm text-slate-600">
          Posting is currently disabled for this account. Enable Property Posting at signup or use a posting-enabled account.
        </div>
      )}

      {user ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange">Account posting details</p>
              <h3 className="mt-1 text-lg font-bold text-navy">Signed in as {user.name || accountType}</h3>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${hasPostingAccess ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {hasPostingAccess ? "Posting enabled" : "Posting disabled"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatusCard
              icon={<UserCircleIcon className="h-5 w-5" />}
              label="Account type"
              value={accountType}
              helper={user.email || "Registered user"}
            />
            <StatusCard
              icon={<CreditCardIcon className="h-5 w-5" />}
              label="Current plan"
              value={activePlanName}
              helper={`${planExpired ? "Expired on" : "Valid till"} ${formatDate(user?.activePlan?.expiresAt)}`}
            />
            <StatusCard
              icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />}
              label="Posting credits left"
              value={isAdmin ? "Unlimited" : `${remainingPosts} left`}
              helper={isAdmin ? "Admin can post without limit" : `${postingUsed} used of ${postingLimit || 0}`}
              tone={remainingPosts > 0 || isAdmin ? "default" : "warning"}
            />
            <StatusCard
              icon={<TicketIcon className="h-5 w-5" />}
              label="Contact / lead credits"
              value={`${contactLeft} contacts`}
              helper={`${leadCreditsLeft} lead credits left`}
            />
          </div>
        </div>
      ) : null}

      {hasPostingAccess && !isAdmin && !canPostForFree && !initialData && (
        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm text-slate-600">Your free 90-day period has expired or your plan credits are used up. Buy a plan to continue posting properties.</p>
          <button onClick={() => navigate("/plans")} className="site-button-primary mt-3 px-4 py-2 text-sm">
            Go to plans
          </button>
        </div>
      )}

      {isProfileIncomplete ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-md mt-6">
          <h3 className="text-xl font-bold text-navy font-philosopher">Complete Your Profile Details</h3>
          <p className="mt-2 text-sm text-slate-600">
            Please fill in these details to post properties.
          </p>
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                className="site-input w-full"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address *</label>
              <input
                type="text"
                required
                className="site-input w-full"
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Hosur, Tamil Nadu"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">I Am A *</label>
              <select
                required
                className="site-input w-full"
                value={profileForm.role}
                onChange={(e) => setProfileForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select Role</option>
                <option value="seller">Property Seller / Owner</option>
                <option value="agent">Agent</option>
                <option value="broker">Broker</option>
                <option value="builder">Builder</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="site-button-primary w-full mt-4 flex justify-center items-center py-2.5 rounded-lg text-sm font-bold text-white animate-pulse hover:animate-none"
            >
              {profileSaving ? "Saving..." : "Save and Proceed"}
            </button>
          </form>
        </div>
      ) : hasPostingAccess && (isAdmin || canPostForFree || initialData) && (
        <>
          {!isEditMode && !modalOpen && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {propertyTypes.map((type) => {
                const item = typeFieldConfig[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => openTypeForm(type)}
                    className="marketing-card group w-full p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-orange"
                  >
                    <span className="inline-flex rounded-lg bg-orange px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Open form
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-navy">{type}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {isEditMode && config ? <div className="marketing-card rounded-xl p-5 sm:p-6">{renderFormBody()}</div> : null}
        </>
      )}

      <Dialog open={formDialogOpen} onClose={closeFormModal} className="relative z-[60]">
        <div className="fixed inset-0 bg-navy/55" aria-hidden="true" />

        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <DialogPanel
            className="modal-panel-white flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-xl shadow-card sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl"
            style={{ background: "#ffffff" }}
          >
            <div className="flex shrink-0 justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange">Posting form</p>
                <DialogTitle className="mt-1 truncate text-xl font-bold text-navy sm:text-2xl">{form.propertyType}</DialogTitle>
                <p className="mt-1 text-sm text-slate-600">{config?.description}</p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-surface hover:text-navy"
                aria-label="Close form"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{renderFormBody()}</div>
          </DialogPanel>
        </div>
      </Dialog>
    </section>
  );
};

const FormSection = ({ title, children, className = "" }) => (
  <div className={className}>
    <h3 className="border-b border-slate-100 pb-2 text-base font-bold text-navy">{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, required, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-orange">*</span> : null}
    </span>
    {children}
  </label>
);

const ReadOnlyField = ({ label, value, fallback }) => (
  <div>
    <p className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</p>
    <div className="site-input flex min-h-[44px] items-center bg-white text-slate-700">
      {value || fallback}
    </div>
  </div>
);

const StatusCard = ({ icon, label, value, helper, tone = "default" }) => (
  <div className={`rounded-xl border p-4 ${tone === "warning" ? "border-orange/30 bg-orange/5" : "border-slate-100 bg-surface"}`}>
    <div className="flex items-start gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone === "warning" ? "bg-orange text-white" : "bg-navy text-white"}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-base font-bold text-navy">{value}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
      </div>
    </div>
  </div>
);

const Select = ({ field, value, options, onChange }) => (
  <select className="site-input" value={value} onChange={(e) => onChange(field, e.target.value)}>
    {options.map((option) => (
      <option key={option} value={option}>
        {option || "Select"}
      </option>
    ))}
  </select>
);

const DataInput = ({ field, value, options, onChange, placeholder }) => {
  const listId = `${field}-options`;
  return (
    <>
      <input className="site-input" list={listId} value={value} onChange={(e) => onChange(field, e.target.value)} placeholder={placeholder} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
};

const YesNoGroup = ({ field, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {yesNoOptions.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(field, option)}
        className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
          value === option ? "bg-navy text-white" : "bg-surface text-slate-600 hover:bg-slate-100"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const MinPriceRangeGroup = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {independentHouseMinPriceRanges.map((range) => (
      <button
        key={range}
        type="button"
        onClick={() => onChange(range)}
        className={`rounded-lg border px-4 py-2.5 text-sm font-bold transition ${
          value === range
            ? "border-orange bg-orange text-white shadow-sm"
            : "border-slate-200 bg-white text-navy hover:border-orange hover:bg-orange/5"
        }`}
      >
        {range}
      </button>
    ))}
  </div>
);

export default PropertyPostingForm;
