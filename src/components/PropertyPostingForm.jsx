import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { createProperty, updateProperty, uploadPropertyFiles } from "../services/api/propertyApi";

const propertyTypes = [
  "Plot",
  "Villa",
  "Flat",
  "Individual House",
  "Rent",
  "Apartment",
  "PG",
  "Commercial Land / Building",
  "Agri Land",
];

const landAreaOptions = ["1200 sq feet", "1500 sq feet", "1800 sq feet", "2400 sq feet"];
const priceOptions = ["7.00 L", "10.00 L", "12.00 L", "15.00 L"];
const facingOptions = ["East", "West", "North", "South"];
const yesNoOptions = ["Yes", "No"];

const defaultForm = {
  propertyType: "",
  title: "",
  description: "",
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
  "Individual House": {
    description: "House details with rooms, land/building area, and utilities.",
    detailTitle: "Individual House Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["bhk", "bathrooms", "builtupArea", "landArea", "furnishingStatus", "facing"],
    featureFields: ["parking", "waterSupply", "security", "cctvCamera", "dtcp", "rera"],
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

const fieldClass =
  "w-full rounded-[1.1rem] border border-transparent bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,76,82,0.08),inset_0_0_0_1px_rgba(15,76,82,0.08)] outline-none transition duration-300 placeholder:text-slate-400 focus:bg-white focus:shadow-[0_12px_30px_rgba(15,76,82,0.1),inset_0_0_0_1px_rgba(15,118,110,0.42)]";

const yesNoClass =
  "rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.1em] transition duration-300";

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

const PropertyPostingForm = ({ heading = "Post Property", onSuccess, initialData = null }) => {
  const navigate = useNavigate();
  const { token, user, refreshProfile } = useAuth();
  const isAdmin = user?.role === "admin";
  const hasPostingAccess = ["seller", "agent", "broker", "builder", "admin"].includes(user?.role) || Boolean(user?.canPostProperty);

  const [form, setForm] = useState(initialData?.form || defaultForm);
  const [modalOpen, setModalOpen] = useState(Boolean(initialData));
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(initialData?.images || []);
  const [uploadedDocs, setUploadedDocs] = useState(initialData?.documents || []);

  const config = typeFieldConfig[form.propertyType] || null;

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

  const openTypeForm = (type) => {
    setForm((prev) => ({
      ...defaultForm,
      contactName: prev.contactName,
      contactPhone: prev.contactPhone,
      contactEmail: prev.contactEmail,
      country: prev.country || defaultForm.country,
      state: prev.state || defaultForm.state,
      district: prev.district || defaultForm.district,
      taluk: prev.taluk || defaultForm.taluk,
      village: prev.village || defaultForm.village,
      city: prev.city || defaultForm.city,
      area: prev.area || defaultForm.area,
      propertyType: type,
      listingType: getListingType(type),
    }));
    setFiles([]);
    setUploadedImages([]);
    setUploadedDocs([]);
    setModalOpen(true);
  };

  const validateForm = () => {
    const required = [
      form.propertyType,
      form.contactName.trim(),
      form.contactPhone.trim(),
      form.contactEmail.trim(),
      form.country.trim(),
      form.state.trim(),
      form.district.trim(),
      form.taluk.trim(),
      form.village.trim(),
      form.area.trim(),
      form.houseAddress.trim(),
      form.description.trim(),
    ];

    if (required.some((value) => !value)) return false;
    if (!form.price && !form.maxPrice && !form.monthlyRent) return false;
    if (form.description.trim().length < 10) return false;

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

    if (!validateForm()) {
      toast.error("Please fill contact, location, price, and description details.");
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
        form.minPrice ? `Min Price: ${form.minPrice}` : "",
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
        amenities,
        nearbyFacilities: [],
        virtualTourUrl: "",
        images: uploadedImages,
        documents: uploadedDocs,
        verification: {
          reraId: form.rera === "Yes" ? form.reraId : "",
        },
        listingContact: {
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail || user?.email || "",
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
    return <input className={fieldClass} value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder={fieldLabels[field]} />;
  };

  return (
    <section className="form-modern space-y-7 rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,250,248,0.74))] p-4 shadow-[0_22px_70px_rgba(15,76,82,0.1)] sm:p-6 lg:p-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.88fr)_minmax(280px,0.38fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-teal-700">Step 1</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{heading}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Select the property type first. The selected property form will open as a separate section on this page with only the fields needed for that type.
          </p>
        </div>
        <div className="rounded-[1.6rem] bg-white/75 p-4 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workflow</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Choose type, complete details, upload media, and publish from your dashboard.</p>
        </div>
      </div>

      {!hasPostingAccess && (
        <div className="neo-inset rounded-xl p-4 text-sm text-slate-600">
          Posting is currently disabled for this account. Enable Property Posting at signup or use a posting-enabled account.
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
        <>
          {!initialData && !isAdmin && (
            <div className="neo-inset rounded-xl p-4 text-sm text-slate-700">
              <p className="font-semibold">Your Active Plan Benefits</p>
              <p className="mt-1">Posting Credits: {remainingPosts} remaining out of {user?.activePlan?.listingLimit || 0}</p>
              <p>Customer Requests: {Math.max((user?.contactAccess?.monthlyLimit || 0) - (user?.contactAccess?.usedCount || 0), 0)} remaining</p>
              <p>Lead Credits: {user?.activePlan?.leadCredits || user?.leadCredits || 0}</p>
              <p>Validity: {user?.activePlan?.expiresAt ? new Date(user.activePlan.expiresAt).toLocaleDateString("en-IN") : "N/A"}</p>
            </div>
          )}

          {!modalOpen ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_1fr]">
            {propertyTypes.map((type) => {
              const item = typeFieldConfig[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => openTypeForm(type)}
                  className="group min-h-[150px] rounded-[1.6rem] bg-white/85 p-5 text-left shadow-[0_16px_38px_rgba(15,76,82,0.08),inset_0_0_0_1px_rgba(15,76,82,0.07)] transition duration-300 hover:-translate-y-1.5 hover:bg-teal-50 hover:shadow-[0_24px_48px_rgba(15,76,82,0.14),inset_0_0_0_1px_rgba(15,118,110,0.22)]"
                >
                  <span className="inline-flex rounded-full bg-teal-700 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(15,118,110,0.18)]">
                    Open Form
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-slate-900">{type}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </button>
              );
            })}
          </div>
          ) : null}

          {modalOpen && config ? (
            <div className="mt-6 overflow-hidden rounded-[2rem] bg-white/86 shadow-[0_24px_70px_rgba(15,76,82,0.12)]">
                <div className="flex flex-wrap items-start justify-between gap-3 bg-[linear-gradient(135deg,rgba(230,247,244,0.96),rgba(255,255,255,0.86))] px-5 py-6 sm:px-7">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-teal-700">Posting Form</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-slate-900">{form.propertyType}</h3>
                    <p className="mt-1 text-sm text-slate-600">{config.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.1)] transition duration-300 hover:-translate-y-0.5 hover:text-teal-700 hover:shadow-[0_12px_24px_rgba(15,76,82,0.12),inset_0_0_0_1px_rgba(15,118,110,0.28)]"
                  >
                    Back to property types
                  </button>
                </div>

                <form onSubmit={submitProperty} className="p-4 sm:p-6 lg:p-7">
                  <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
                    <Section title="Contact Details">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Contact Name" required><input className={fieldClass} value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Your Name" /></Field>
                        <Field label="Mobile Number" required><input className={fieldClass} type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="Mobile Number" /></Field>
                        <Field label="Email ID" required><input className={fieldClass} type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="Contact Email" /></Field>
                      </div>
                    </Section>

                    <Section title="Location Details">
                      <div className="grid gap-4 md:grid-cols-3">
                        {["country", "state", "district", "taluk", "village", "area"].map((field) => (
                          <Field key={field} label={field[0].toUpperCase() + field.slice(1)} required>
                            <input className={fieldClass} value={form[field]} onChange={(e) => update(field, e.target.value)} />
                          </Field>
                        ))}
                        <Field label="Full Address / Survey Details" required className="md:col-span-3">
                          <textarea className={fieldClass} rows="2" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} placeholder="Street, survey number, landmark" />
                        </Field>
                      </div>
                    </Section>

                    <Section title="Price Details" tone="soft">
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label={config.priceLabel} required>{renderInput(config.priceLabel.includes("Rent") ? "monthlyRent" : "price")}</Field>
                        <Field label="Min Price">{renderInput("minPrice")}</Field>
                        <Field label="Max Price">{renderInput("maxPrice")}</Field>
                      </div>
                    </Section>

                    <Section title={config.detailTitle}>
                      <div className="grid gap-4 md:grid-cols-3">
                        {config.detailFields.map((field) => (
                          <Field key={field} label={fieldLabels[field]}>
                            {renderInput(field)}
                          </Field>
                        ))}
                      </div>
                    </Section>

                    <Section title="Facilities / Features" tone="soft">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {config.featureFields.map((field) => (
                          <div key={field} className="rounded-2xl bg-white/85 p-3 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.08)]">
                            <p className="mb-2 text-sm font-bold text-slate-700">{fieldLabels[field]}</p>
                            <YesNoGroup field={field} value={form[field]} onChange={update} />
                          </div>
                        ))}
                      </div>
                      {form.rera === "Yes" ? (
                        <Field label="RERA ID">
                          <input className={fieldClass} value={form.reraId} onChange={(e) => update("reraId", e.target.value)} placeholder="RERA number" />
                        </Field>
                      ) : null}
                    </Section>

                    <Section title="Description">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Listing Title">
                          <input className={fieldClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={`${form.propertyType} in ${form.village}`} />
                        </Field>
                        <Field label="Posted By">
                          <Select field="postedBy" value={form.postedBy} options={["owner", "agent", "builder"]} onChange={update} />
                        </Field>
                        <Field label="Property Description" required className="md:col-span-2">
                          <textarea className={fieldClass} rows="4" minLength={10} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Explain locality, road access, nearby schools, condition, approvals, and buyer/renter notes." />
                        </Field>
                      </div>
                    </Section>

                    <Section title="Upload Images & Documents" tone="soft" className="xl:col-span-2">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.08)]">
                          <h3 className="text-lg font-bold text-slate-900">Property Images</h3>
                          <p className="mb-3 mt-1 text-xs text-slate-500">Upload clear property images. Maximum 5 files per upload.</p>
                          <input className="w-full" type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
                          <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="neo-btn mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
                            {uploading ? "Uploading..." : "Upload Selected Images"}
                          </button>
                          {!!uploadedImages.length && (
                            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                              {uploadedImages.map((src, idx) => (
                                <div key={idx} className="aspect-square overflow-hidden rounded-xl bg-slate-100 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.08)]">
                                  <img src={src} alt="Uploaded property" className="h-full w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-[1.5rem] bg-white/85 p-4 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.08)]">
                          <h3 className="text-lg font-bold text-slate-900">Brochure / Layout Plan</h3>
                          <p className="mb-3 mt-1 text-xs text-slate-500">Attach PDF layout, approval, or brochure files.</p>
                          <input className="w-full" type="file" multiple accept="application/pdf" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
                          <button type="button" onClick={uploadAssets} disabled={uploading || !files.length} className="neo-btn mt-3 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60">
                            {uploading ? "Uploading..." : "Upload PDF Brochure"}
                          </button>
                          {!!uploadedDocs.length && <p className="mt-3 text-xs font-semibold text-slate-700">Uploaded {uploadedDocs.length} documents.</p>}
                        </div>
                      </div>
                    </Section>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-white pt-4">
                    <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-slate-700 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.1)] transition hover:-translate-y-0.5 hover:text-teal-700">
                      Back to Types
                    </button>
                    <button
                      type="submit"
                      disabled={publishing}
                      className="rounded-2xl bg-teal-800 px-10 py-3 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(15,76,82,0.22)] transition-all hover:-translate-y-[6px] hover:bg-teal-900 disabled:opacity-40"
                    >
                      {publishing ? "Saving..." : initialData ? "Save Changes" : "Publish Property"}
                    </button>
                  </div>
                </form>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};

const Section = ({ title, children, tone = "plain", className = "" }) => (
  <div className={`rounded-[1.7rem] p-4 sm:p-5 ${tone === "soft" ? "bg-teal-50/55" : "bg-slate-50/55"} shadow-[inset_0_0_0_1px_rgba(15,76,82,0.07)] ${className}`}>
    <h3 className="mb-4 text-lg font-extrabold text-slate-950">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, required, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-sm font-semibold text-slate-700">
      {label} {required ? <span className="text-teal-700">*</span> : null}
    </span>
    {children}
  </label>
);

const Select = ({ field, value, options, onChange }) => (
  <select className={fieldClass} value={value} onChange={(e) => onChange(field, e.target.value)}>
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
      <input className={fieldClass} list={listId} value={value} onChange={(e) => onChange(field, e.target.value)} placeholder={placeholder} />
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
        className={`${yesNoClass} ${
          value === option
            ? "bg-teal-800 text-white shadow-[0_10px_20px_rgba(15,76,82,0.18)]"
            : "bg-white text-slate-600 shadow-[inset_0_0_0_1px_rgba(15,76,82,0.1)] hover:text-teal-700 hover:shadow-[inset_0_0_0_1px_rgba(15,118,110,0.28)]"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

export default PropertyPostingForm;
