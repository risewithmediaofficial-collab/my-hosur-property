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
  "Farmland",
  "Agri Land",
];

const stateOptions = ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Kerala", "Other (Enter Manually)"];
const cityOptions = ["Hosur", "Krishnagiri", "Denkanikottai", "Shoolagiri", "Rayakottai", "Kelamangalam", "Bengaluru", "Other (Enter Manually)"];
const areaOptions = [
  "Bagalur Road",
  "Nallur Road",
  "Avalapalli Road",
  "Alasanatham Road",
  "Kelamangalam Road",
  "Thally Road",
  "Attibele Road",
  "Denkanikottai Road",
  "TVS Road",
  "Athimugam Road",
  "Rayakottai Road",
  "Bagalur",
  "Mathigiri",
  "Sipcot",
  "Kelamangalam",
  "Rayakottai",
  "Avalapalli",
  "Belagondapalli",
  "Bathalapalli",
  "Perandapalli",
  "Zuzuvadi",
  "Kamaraj Nagar",
  "Chennathur",
  "Alasanatham",
  "Anthivadi",
  "Nagondapalli",
  "Uddanapalli",
  "Shoolagiri",
  "Berigai",
  "Thally",
  "Anchetty",
  "Other (Enter Manually)"
];

const districtOptions = [
  "Krishnagiri",
  "Hosur",
  "Denkanikottai",
  "Shoolagiri",
  "Rayakottai",
  "Kelamangalam",
  "Bengaluru",
  "Other (Enter Manually)",
];

const villageOptions = [
  "Bagalur",
  "Mathigiri",
  "Avalapalli",
  "Kelamangalam",
  "Rayakottai",
  "Chennathur",
  "Nallur",
  "Alasanatham",
  "Other (Enter Manually)",
];

const landAreaOptions = ["600 sq.ft", "800 sq.ft"];
const plotPriceOptions = [
  "₹1 Lakh to ₹10 Lakhs",
  "₹10 Lakhs to ₹20 Lakhs",
  "₹20 Lakhs to ₹30 Lakhs",
  "₹30 Lakhs to ₹40 Lakhs",
  "₹40 Lakhs to ₹50 Lakhs",
  "₹50 Lakhs to ₹60 Lakhs",
  "₹60 Lakhs to ₹70 Lakhs",
  "₹70 Lakhs to ₹80 Lakhs",
  "₹80 Lakhs to ₹90 Lakhs",
  "₹90 Lakhs to ₹1 Crore",
  "₹1 Crore & Above",
];
const villaPriceOptions = [
  "₹30 Lakhs",
  "₹35 Lakhs",
  "₹40 Lakhs",
  "₹45 Lakhs",
  "₹50 Lakhs",
  "₹55 Lakhs",
  "₹60 Lakhs",
  "₹70 Lakhs",
  "₹80 Lakhs",
  "₹90 Lakhs",
  "₹1 Crore",
  "₹1.20 Crores",
  "₹1.30 Crores",
  "₹1.40 Crores",
  "₹1.50 Crores",
  "₹1.75 Crores",
  "₹2 Crores",
  "₹2 Crores & Above",
];
const flatPriceOptions = [
  "₹20 Lakhs to ₹30 Lakhs",
  "₹30 Lakhs to ₹40 Lakhs",
  "₹40 Lakhs to ₹50 Lakhs",
  "₹50 Lakhs to ₹60 Lakhs",
  "₹60 Lakhs to ₹70 Lakhs",
  "₹70 Lakhs to ₹80 Lakhs",
  "₹80 Lakhs to ₹90 Lakhs",
  "₹90 Lakhs to ₹1 Crore",
  "₹1 Crore to ₹1.50 Crores",
  "₹1.50 Crores to ₹2 Crores",
  "₹2 Crores & Above",
];
const commercialPriceOptions = [
  "₹10 Lakhs to ₹20 Lakhs",
  "₹20 Lakhs to ₹30 Lakhs",
  "₹30 Lakhs to ₹40 Lakhs",
  "₹40 Lakhs to ₹50 Lakhs",
  "₹50 Lakhs to ₹75 Lakhs",
  "₹75 Lakhs to ₹1 Crore",
  "₹1 Crore to ₹2 Crores",
  "₹2 Crores to ₹5 Crores",
  "₹5 Crores & Above",
];
const farmlandPriceOptions = [
  "₹1 Lakh to ₹2 Lakhs",
  "₹2 Lakhs to ₹3 Lakhs",
  "₹3 Lakhs to ₹4 Lakhs",
  "₹4 Lakhs to ₹5 Lakhs",
  "₹5 Lakhs to ₹6 Lakhs",
  "₹6 Lakhs to ₹7 Lakhs",
  "₹7 Lakhs to ₹8 Lakhs",
  "₹8 Lakhs to ₹9 Lakhs",
  "₹9 Lakhs to ₹10 Lakhs",
  "₹10 Lakhs & Above",
];
const agriPriceOptions = [
  "₹1 Lakh to ₹5 Lakhs",
  "₹5 Lakhs to ₹10 Lakhs",
  "₹10 Lakhs to ₹20 Lakhs",
  "₹20 Lakhs to ₹30 Lakhs",
  "₹30 Lakhs to ₹50 Lakhs",
  "₹50 Lakhs to ₹1 Crore",
  "₹1 Crore to ₹2 Crores",
  "₹2 Crores & Above",
];
const pgRentOptions = [
  "₹2,000 to ₹3,000",
  "₹3,000 to ₹4,000",
  "₹4,000 to ₹5,000",
  "₹5,000 to ₹6,000",
  "₹6,000 to ₹7,000",
  "₹7,000 to ₹8,000",
  "₹8,000 to ₹10,000",
  "₹10,000 & Above",
];
const farmlandAreaOptions = [
  "10 Cents",
  "11 Cents",
  "15 Cents",
  "22 Cents",
  "25 Cents",
  "25 Cents & Above",
];
const agriLandAreaOptions = [
  "20 Cents",
  "25 Cents",
  "50 Cents",
  "75 Cents",
  "1 Acre",
  "2 Acres",
  "3 Acres",
  "4 Acres",
  "5 Acres & Above",
];
const houseRentOptions = [
  "₹4,000 to ₹6,000",
  "₹6,000 to ₹8,000",
  "₹8,000 to ₹10,000",
  "₹10,000 to ₹12,000",
  "₹12,000 to ₹15,000",
  "₹15,000 to ₹20,000",
  "₹20,000 to ₹25,000",
  "₹25,000 to ₹30,000",
  "₹30,000 to ₹50,000",
  "₹50,000 & Above",
];
const carParkingOptions = ["1 Car", "2 Cars", "3 Cars", "4+ Cars"];
const carParkingYesNoOptions = ["Yes", "No"];
const waterSourceVillaOptions = ["Borewell", "Layout Water"];
const waterSourceHouseOptions = ["Borewell", "Corporation Water"];
const maintenanceOptions = ["Included", "Not Included"];
const priceOptions = ["7.00 L", "10.00 L", "12.00 L", "15.00 L", "25.00 L", "50.00 L", "75.00 L", "1.00 Cr"];
const facingOptions = ["East", "West", "North", "South", "North East", "North West", "South East", "South West"];
const yesNoOptions = ["Yes", "No"];
const propertyClassOptions = ["General", "SC/ST"];
const soilTypeOptions = ["Red Soil", "Black Soil", "Clay Soil", "Alluvial Soil", "Sandy Soil", "Loam Soil"];

const defaultForm = {
  propertyType: "",
  title: "",
  description: "",
  isSold: false,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  country: "India",
  state: "",
  district: "",
  taluk: "",
  village: "",
  houseAddress: "",
  city: "",
  area: "",
  propertyClass: "General",
  postedBy: "owner",
  listingType: "sale",
  price: "",
  advance: "",
  landArea: "",
  flatArea: "",
  cents: "",
  length: "",
  width: "",
  plotType: "",
  individualPlot: "Yes",
  gatedCommunity: "No",
  cctvCamera: "No",
  security: "No",
  dtcp: "No",
  hntda: "No",
  rera: "No",
  reraId: "",
  bhk: "",
  bathrooms: "",
  furnishingStatus: "Unfurnished",
  floorNumber: "",
  totalFloors: "",
  builtupArea: "",
  areaUnit: "sqft",
  possessionStatus: "Ready to Move",
  facing: "",
  parking: "No",
  carParking: "",
  balcony: "No",
  lift: "No",
  powerBackup: "No",
  waterSupply: "No",
  waterSourceType: "",
  roadAccess: "No",
  boundaryWall: "No",
  electricity: "No",
  sharingType: "",
  monthlyRent: "",
  monthlyMaintenance: "",
  maintenanceType: "",
  layoutPlot: "Yes",
  foodIncluded: "No",
  tv: "No",
  wifi: "No",
  gym: "No",
  washingMachine: "No",
  hotWater: "No",
  frontage: "",
  roadWidth: "",
  waterSource: "",
  cropSuitable: "",
  borewell: "No",
  well: "No",
  soilType: "Red Soil",
  farmhouse: "No",
  farmhouseCount: "1",
  villaType: "Simplex",
};

const typeFieldConfig = {
  Plot: {
    description: "Land-only details. No BHK, floor, or furnishing fields.",
    detailTitle: "Plot Details",
    priceLabel: "Expected Plot Price",
    detailFields: ["propertyClass", "landArea", "length", "width", "plotType", "facing", "individualPlot", "layoutPlot"],
    featureFields: ["gatedCommunity", "cctvCamera", "security", "dtcp", "hntda", "rera"],
  },
  Villa: {
    description: "Independent villa details with rooms, land/build-up area, car parking, water source, and facilities.",
    detailTitle: "Villa Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["propertyClass", "villaType", "bhk", "bathrooms", "builtupArea", "landArea", "furnishingStatus", "facing", "carParking", "waterSourceType"],
    featureFields: ["gatedCommunity", "cctvCamera", "security", "balcony", "powerBackup", "hntda", "rera"],
  },
  Flat: {
    description: "Flat details with floor, rooms, flat area, and facilities.",
    detailTitle: "Flat Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["propertyClass", "flatArea", "bhk", "bathrooms", "builtupArea", "landArea", "floorNumber", "totalFloors", "furnishingStatus", "facing"],
    featureFields: ["lift", "security", "parking", "balcony", "powerBackup", "hntda", "rera"],
  },
  "Independent House": {
    description: "House details with rooms, land/building area, car parking, water source, and utilities.",
    detailTitle: "Individual House Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["propertyClass", "bhk", "bathrooms", "builtupArea", "landArea", "furnishingStatus", "facing", "carParking", "waterSourceType"],
    featureFields: ["security", "cctvCamera", "dtcp", "hntda", "rera"],
  },
  Rent: {
    description: "Rental house details with monthly rent, car parking, maintenance, water source, and facilities.",
    detailTitle: "Rental Details",
    priceLabel: "Monthly Rent",
    detailFields: ["propertyClass", "bhk", "bathrooms", "monthlyRent", "advance", "furnishingStatus", "carParking", "waterSourceType", "monthlyMaintenance"],
    featureFields: ["security", "lift", "powerBackup", "hntda", "rera"],
  },
  Apartment: {
    description: "Apartment details with floor, rooms, land area, and common facilities.",
    detailTitle: "Apartment Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["propertyClass", "bhk", "bathrooms", "builtupArea", "landArea", "floorNumber", "totalFloors", "furnishingStatus", "facing"],
    featureFields: ["lift", "security", "parking", "balcony", "powerBackup", "hntda", "rera"],
  },
  PG: {
    description: "PG / Hostel details with sharing type, rent, advance, TV, WiFi, Gym, Washing Machine, and Hot Water.",
    detailTitle: "PG Details",
    priceLabel: "Monthly Rent",
    detailFields: ["propertyClass", "sharingType", "monthlyRent", "advance", "furnishingStatus", "bathrooms"],
    featureFields: ["foodIncluded", "tv", "wifi", "gym", "washingMachine", "hotWater", "security", "cctvCamera", "waterSupply", "powerBackup", "hntda", "rera"],
  },
  "Commercial Land / Building": {
    description: "Commercial land & building details with length, width, and approvals.",
    detailTitle: "Commercial Details",
    priceLabel: "Expected Commercial Price",
    detailFields: ["propertyClass", "landArea", "builtupArea", "length", "width", "frontage", "roadWidth"],
    featureFields: ["dtcp", "hntda", "rera", "roadAccess", "parking", "security", "cctvCamera"],
  },
  Farmland: {
    description: "Farmland details with land area, soil type, borewell, well, and crop suitability.",
    detailTitle: "Farmland Details",
    priceLabel: "Expected Farmland Price",
    detailFields: ["propertyClass", "landArea", "roadWidth", "waterSource", "soilType", "cropSuitable"],
    featureFields: ["borewell", "well", "farmhouse", "roadAccess", "waterSupply", "electricity", "boundaryWall"],
  },
  "Agri Land": {
    description: "Agricultural land details — land area in cents or acres. No HNTDA or RERA fields.",
    detailTitle: "Agricultural Land Details",
    priceLabel: "Expected Land Price",
    detailFields: ["propertyClass", "landArea", "roadWidth", "waterSource", "soilType", "cropSuitable"],
    featureFields: ["borewell", "well", "farmhouse", "roadAccess", "waterSupply", "electricity", "boundaryWall"],
  },
};

const fieldLabels = {
  propertyClass: "Property Category",
  landArea: "Land Area",
  flatArea: "Flat Area",
  cents: "Land Area in Cents",
  length: "Length",
  width: "Width",
  plotType: "Plot Type",
  individualPlot: "Individual Plot",
  layoutPlot: "Layout Plot",
  bhk: "BHK / Rooms",
  bathrooms: "Bathrooms",
  builtupArea: "Built-up Area",
  furnishingStatus: "Furnishing",
  floorNumber: "Floor Number",
  totalFloors: "Total Floors",
  facing: "Facing",
  monthlyRent: "Monthly Rent",
  advance: "Advance",
  sharingType: "Sharing Type",
  frontage: "Frontage",
  roadWidth: "Road Width",
  waterSource: "Water Source",
  waterSourceType: "Water Source",
  cropSuitable: "Crop Suitable",
  gatedCommunity: "Gated Community",
  cctvCamera: "CCTV Camera",
  security: "Security",
  dtcp: "DTCP Approved",
  hntda: "HNTDA Approved",
  rera: "RERA Approved",
  parking: "Parking",
  carParking: "Car Parking",
  balcony: "Balcony",
  lift: "Lift",
  powerBackup: "Power Backup / UPS",
  waterSupply: "Water Supply",
  roadAccess: "Road Access",
  boundaryWall: "Boundary Wall",
  electricity: "Electricity",
  foodIncluded: "Food Included",
  tv: "TV",
  wifi: "WiFi",
  gym: "Gym",
  washingMachine: "Washing Machine",
  hotWater: "Hot Water",
  borewell: "Borewell",
  well: "Open Well / Well",
  soilType: "Soil Type",
  farmhouse: "Farmhouse",
  farmhouseCount: "Number of Farmhouses",
  villaType: "Villa Type",
  monthlyMaintenance: "Monthly Maintenance",
};

const toNumber = (value) => {
  if (!value) return 0;

  const normalized = String(value).trim().toLowerCase();
  const rangeMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:l|cr)?\s*(?:to|-|and above)?\s*(\d*(?:\.\d+)?)?/);
  const baseValue = rangeMatch && rangeMatch[1] ? Number(rangeMatch[1]) : null;
  const isCr = /cr/.test(normalized);
  const isL = /l/.test(normalized) || (!isCr && /\d/.test(normalized));

  if (baseValue === null || Number.isNaN(baseValue)) {
    const cleaned = String(value).replace(/[^\d.]/g, "");
    return Number(cleaned || 0);
  }

  if (isCr) {
    return baseValue * 10000000;
  }

  if (isL) {
    return baseValue * 100000;
  }

  return baseValue;
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
  agent: "Agent / Media",
  broker: "Developer",
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
  const [imageFiles, setImageFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState(initialData?.images || []);
  const [uploadedDocs, setUploadedDocs] = useState(initialData?.documents || []);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!imageFiles.length) {
      setImagePreviews([]);
      return;
    }
    const urls = imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(urls);
    return () => {
      urls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imageFiles]);

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
    setImageFiles([]);
    setDocFiles([]);
    setUploadedImages([]);
    setUploadedDocs([]);
    setModalOpen(true);
  };

  const closeFormModal = () => {
    setModalOpen(false);
    setImageFiles([]);
    setDocFiles([]);
    setForm((prev) => ({ ...defaultForm, ...preserveContactFields(prev) }));
  };

  const validateForm = () => {
    if (!accountContact.name || !accountContact.phone) {
      return "Your account details are incomplete. Please make sure your name and phone number are available before posting.";
    }

    const required = [
      form.propertyType,
      form.state.trim(),
      form.city.trim(),
      form.area.trim(),
    ];

    if (required.some((value) => !value)) return "Please fill location and price details.";
    if (!form.price && !form.monthlyRent) return "Please fill expected price or monthly rent details.";

    return "";
  };

  const MAX_FILE_SIZE_MB = 10;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleImageFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);

    if (oversized.length > 0) {
      oversized.forEach((f) => {
        const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
        toast.error(`⚠️ Image "${f.name}" is ${sizeMb} MB — maximum allowed size is ${MAX_FILE_SIZE_MB} MB. Please compress or resize the image before uploading.`);
      });
    }

    if (valid.length > 5) {
      toast.error(`You can upload a maximum of 5 images at a time. Only the first 5 images were selected.`);
    }

    const finalFiles = valid.slice(0, 5);
    if (finalFiles.length > 0) {
      setImageFiles(finalFiles);
    } else {
      e.target.value = "";
      setImageFiles([]);
    }
  };

  const handleDocFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const oversized = selected.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    const valid = selected.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);

    if (oversized.length > 0) {
      oversized.forEach((f) => {
        const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
        toast.error(`⚠️ File "${f.name}" is ${sizeMb} MB — maximum allowed file size is ${MAX_FILE_SIZE_MB} MB. Please compress the PDF before uploading.`);
      });
    }

    if (valid.length > 5) {
      toast.error(`You can upload a maximum of 5 documents at a time. Only the first 5 were selected.`);
    }

    const finalFiles = valid.slice(0, 5);
    if (finalFiles.length > 0) {
      setDocFiles(finalFiles);
    } else {
      e.target.value = "";
      setDocFiles([]);
    }
  };

  const uploadImageAssets = async () => {
    if (!imageFiles.length) return;

    try {
      setUploading(true);
      const res = await uploadPropertyFiles(token, imageFiles);
      setUploadedImages((prev) => [...prev, ...(res.images || [])]);
      setImageFiles([]);
      const inputEl = document.getElementById("property-image-input");
      if (inputEl) inputEl.value = "";
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadDocAssets = async () => {
    if (!docFiles.length) return;

    try {
      setUploading(true);
      const res = await uploadPropertyFiles(token, docFiles);
      setUploadedDocs((prev) => [...prev, ...(res.documents || [])]);
      setDocFiles([]);
      const inputEl = document.getElementById("property-doc-input");
      if (inputEl) inputEl.value = "";
      toast.success("Documents uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeUploadedDoc = (indexToRemove) => {
    setUploadedDocs((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    const inputEl = document.getElementById("property-image-input");
    if (inputEl) inputEl.value = "";
  };

  const removeSelectedDoc = (indexToRemove) => {
    setDocFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    const inputEl = document.getElementById("property-doc-input");
    if (inputEl) inputEl.value = "";
  };

  const submitProperty = async (e) => {
    if (imageFiles.length > 0) {
      toast.error("Please click 'Upload selected images' before publishing/saving.");
      return;
    }
    if (docFiles.length > 0) {
      toast.error("Please click 'Upload PDF brochure' before publishing/saving.");
      return;
    }
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setPublishing(true);
      const apiPropertyType = getApiPropertyType(form.propertyType);
      const price = toNumber(form.price || form.monthlyRent);
      const title = form.title.trim() || `${form.propertyType} in ${form.area || form.village || form.city}, ${form.city || "Hosur"}`;
      const activeConfig = typeFieldConfig[form.propertyType] || { detailFields: [], featureFields: [] };

      const amenities = activeConfig.featureFields
        .filter((field) => form[field] === "Yes")
        .map((field) => fieldLabels[field]);

      const detailLines = [
        `Property Type: ${form.propertyType}`,
        `Property Category: ${form.propertyClass || "General"}`,
        `Location: ${form.area}, ${form.city}, ${form.district || ""}, ${form.state}`,
        form.landArea ? `Land Area: ${form.landArea}` : "",
        form.flatArea ? `Flat Area: ${form.flatArea}` : "",
        form.cents ? `Cents: ${form.cents}` : "",
        form.builtupArea ? `Built-up Area: ${form.builtupArea}` : "",
        form.bhk ? `Rooms: ${form.bhk}` : "",
        form.advance ? `Advance: ${form.advance}` : "",
        form.layoutPlot ? `Layout Plot: ${form.layoutPlot}` : "",
        form.hntda ? `HNTDA Approved: ${form.hntda}` : "",
        form.rera ? `RERA Approved: ${form.rera}` : "",
        form.length ? `Length: ${form.length}` : "",
        form.width ? `Width: ${form.width}` : "",
        form.soilType ? `Soil Type: ${form.soilType}` : "",
        form.farmhouse === "Yes" ? `Farmhouses: ${form.farmhouseCount || 1}` : "",
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
        layoutPlot: form.layoutPlot,
        bhk: Number(form.bhk || 0),
        bathrooms: Number(form.bathrooms || 0),
        listingType: getListingType(form.propertyType),
        furnishingStatus: form.furnishingStatus,
        listingSource: form.postedBy,
        builtupArea: toNumber(form.builtupArea || form.landArea || form.flatArea),
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
          city: (form.city || "Hosur").trim(),
          area: (form.area || "General").trim(),
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
    if (field === "bhk" && form.propertyType === "Villa") {
      return <Select field={field} value={form[field]} options={["", "2", "3", "4", "5"]} onChange={update} />;
    }
    if (field === "villaType") {
      return <Select field={field} value={form[field]} options={["Simplex", "Duplex"]} onChange={update} />;
    }
    if (field === "propertyClass") {
      return <Select field={field} value={form[field]} options={propertyClassOptions} onChange={update} />;
    }
    if (field === "soilType") {
      return <Select field={field} value={form[field]} options={soilTypeOptions} onChange={update} />;
    }
    if (field === "plotType") {
      return <Select field={field} value={form[field]} options={["", "Layout Plot", "Statistical Plot"]} onChange={update} />;
    }
    if (field === "carParking") {
      const isRent = form.propertyType === "Rent";
      if (isRent) {
        return (
          <div className="flex flex-wrap gap-2">
            {carParkingYesNoOptions.map((opt) => (
              <button key={opt} type="button" onClick={() => update(field, opt)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
                  form[field] === opt ? "border-navy bg-navy text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>{opt}</button>
            ))}
          </div>
        );
      }
      return <Select field={field} value={form[field]} options={["", ...carParkingOptions]} onChange={update} />;
    }
    if (field === "waterSourceType") {
      const isVilla = form.propertyType === "Villa";
      const opts = isVilla ? waterSourceVillaOptions : waterSourceHouseOptions;
      return <Select field={field} value={form[field]} options={["", ...opts]} onChange={update} />;
    }
    if (field === "monthlyMaintenance") {
      return (
        <div className="space-y-2">
          <input
            className="site-input h-11"
            value={form.monthlyMaintenance}
            onChange={(e) => update("monthlyMaintenance", e.target.value)}
            placeholder="Amount (e.g. ₹500)"
          />
          <div className="flex flex-wrap gap-2">
            {maintenanceOptions.map((opt) => (
              <button key={opt} type="button" onClick={() => update("maintenanceType", opt)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
                  form.maintenanceType === opt ? "border-navy bg-navy text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}>{opt}</button>
            ))}
          </div>
        </div>
      );
    }
    if (field === "landArea") {
      if (form.propertyType === "Agri Land") {
        return <DropdownInput field={field} value={form[field]} options={agriLandAreaOptions} onChange={update} placeholder="e.g. 25 Cents" />;
      }
      if (form.propertyType === "Farmland") {
        return <DropdownInput field={field} value={form[field]} options={farmlandAreaOptions} onChange={update} placeholder="e.g. 15 Cents" />;
      }
      return <DropdownInput field={field} value={form[field]} options={landAreaOptions} onChange={update} placeholder="e.g. 600 sq.ft" />;
    }
    if (field === "price") {
      if (form.propertyType === "Plot") {
        return <DropdownInput field={field} value={form[field]} options={plotPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      if (form.propertyType === "Villa" || form.propertyType === "Independent House") {
        return <DropdownInput field={field} value={form[field]} options={villaPriceOptions} onChange={update} placeholder="Select price" />;
      }
      if (form.propertyType === "Flat" || form.propertyType === "Apartment") {
        return <DropdownInput field={field} value={form[field]} options={flatPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      if (form.propertyType === "Commercial Land / Building") {
        return <DropdownInput field={field} value={form[field]} options={commercialPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      if (form.propertyType === "Farmland") {
        return <DropdownInput field={field} value={form[field]} options={farmlandPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      if (form.propertyType === "Agri Land") {
        return <DropdownInput field={field} value={form[field]} options={agriPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      return <DropdownInput field={field} value={form[field]} options={priceOptions} onChange={update} placeholder="e.g. 50 L" />;
    }
    if (field === "monthlyRent") {
      if (form.propertyType === "PG") {
        return <DropdownInput field={field} value={form[field]} options={pgRentOptions} onChange={update} placeholder="Select rent range" />;
      }
      return <DropdownInput field={field} value={form[field]} options={houseRentOptions} onChange={update} placeholder="Select rent range" />;
    }
    if (field === "advance") {
      return <DropdownInput field={field} value={form[field]} options={priceOptions} onChange={update} placeholder="e.g. 50 L" />;
    }
    if (field === "facing") {
      return <Select field={field} value={form[field]} options={["", ...facingOptions]} onChange={update} />;
    }
    if (field === "layoutPlot") {
      return <YesNoGroup field={field} value={form[field]} onChange={update} />;
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
              <ReadOnlyField
                label="Posted By"
                value={roleLabels[user?.role] || form.postedBy || "Owner"}
                fallback="Owner"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Location Details">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            <Field label="State" required>
              <LocationDropdownOrInput field="state" value={form.state} options={stateOptions} onChange={update} placeholder="Type State" />
            </Field>
            <Field label="City / Taluk" required>
              <LocationDropdownOrInput field="city" value={form.city} options={cityOptions} onChange={update} placeholder="Type City" />
            </Field>
            <Field label="Area / Locality" required>
              <LocationDropdownOrInput field="area" value={form.area} options={areaOptions} onChange={update} placeholder="Type Area" />
            </Field>
            <Field label="District">
              <LocationDropdownOrInput field="district" value={form.district} options={districtOptions} onChange={update} placeholder="Type District" />
            </Field>
            <Field label="Village / Landmark">
              <LocationDropdownOrInput field="village" value={form.village} options={villageOptions} onChange={update} placeholder="Type Village" />
            </Field>
            <Field label="Country">
              <input className="site-input h-11" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="India" />
            </Field>
            <Field label="Full Address / Survey Details" className="md:col-span-3">
              <textarea className="site-input min-h-[96px] resize-none" rows="3" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} placeholder="Door No., Street, Survey No., Landmarks" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Price Details">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
            <Field label={config.priceLabel} required>
              {renderInput(config.priceLabel.includes("Rent") ? "monthlyRent" : "price")}
            </Field>
            {(form.propertyType === "Rent" || form.propertyType === "PG") && (
              <Field label="Advance Amount">
                {renderInput("advance")}
              </Field>
            )}
          </div>
        </FormSection>

        <FormSection title={config.detailTitle}>
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {config.detailFields.map((field) => (
              <Field key={field} label={fieldLabels[field]}>
                {renderInput(field)}
              </Field>
            ))}
          </div>
        </FormSection>

        <FormSection title="Facilities / Features">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {config.featureFields.map((field) => (
              <div key={field}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{fieldLabels[field]}</p>
                <YesNoGroup field={field} value={form[field]} onChange={update} />
              </div>
            ))}
          </div>
          {form.farmhouse === "Yes" ? (
            <div className="mt-4 max-w-md">
              <Field label="Number of Farmhouses">
                <input className="site-input h-11" value={form.farmhouseCount} onChange={(e) => update("farmhouseCount", e.target.value)} placeholder="e.g. 1" />
              </Field>
            </div>
          ) : null}
          {form.rera === "Yes" ? (
            <div className="mt-4 max-w-md">
              <Field label="RERA ID">
                <input className="site-input h-11" value={form.reraId} onChange={(e) => update("reraId", e.target.value)} placeholder="Enter RERA registration number" />
              </Field>
            </div>
          ) : null}
        </FormSection>

        <FormSection title="Description">
          <div className="grid gap-4">
            <Field label="Listing Title">
              <input className="site-input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder={`${form.propertyType} in ${form.village || form.area || form.city}`} />
            </Field>
            <Field label="Property Description">
              <textarea className="site-input min-h-[120px] resize-none" rows="4" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property (optional)" />
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
              <p className="mt-1 text-xs text-slate-500">Upload clear property images. Max 5 files per upload. Each image must be under 10 MB.</p>
              <input
                id="property-image-input"
                className="mt-3 w-full text-sm"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
              />
              {!!imagePreviews.length && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Selected for upload:</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-white border border-dashed border-slate-300">
                        <img src={preview.url} alt="Selected preview" className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(idx)}
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition-colors z-10"
                          title="Remove image"
                        >
                          <XMarkIcon className="h-2.5 w-2.5" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                          {preview.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={uploadImageAssets}
                disabled={uploading || !imageFiles.length}
                className={`mt-3 px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  imageFiles.length > 0
                    ? "bg-orange border-orange text-white shadow-md hover:opacity-90 hover:shadow-lg"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {uploading ? "Uploading..." : `Upload selected images${imageFiles.length > 0 ? ` (${imageFiles.length})` : ""}`}
              </button>
              {!!uploadedImages.length && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {uploadedImages.map((src, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg bg-white border border-slate-100">
                      <img src={src} alt="Uploaded property" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(idx)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md opacity-80 hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-surface p-4">
              <h4 className="text-sm font-bold text-navy">Brochure / Layout Plan</h4>
              <p className="mt-1 text-xs text-slate-500">Attach PDF layout, approval, or brochure files. Max 5 files. Each file must be under 10 MB.</p>
              <input
                id="property-doc-input"
                className="mt-3 w-full text-sm"
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleDocFileChange}
              />
              {!!docFiles.length && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-1.5">Selected documents for upload:</p>
                  <div className="space-y-1.5">
                    {docFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs border border-dashed border-slate-300">
                        <span className="truncate text-slate-700 font-medium">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedDoc(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove document"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button type="button" onClick={uploadDocAssets} disabled={uploading || !docFiles.length} className="site-button-secondary mt-3 px-4 py-2 text-sm disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload PDF brochure"}
              </button>
              {!!uploadedDocs.length && (
                <div className="mt-3 space-y-1.5">
                  {uploadedDocs.map((url, idx) => {
                    const filename = url.split("/").pop() || `document-${idx + 1}.pdf`;
                    return (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-2 text-xs border border-slate-100">
                        <span className="truncate text-slate-700 font-semibold">{filename}</span>
                        <button
                          type="button"
                          onClick={() => removeUploadedDoc(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove document"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
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
                placeholder=" "
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
                placeholder=" "
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
                <option value="agent">Agent / Media</option>
                <option value="broker">Developer</option>
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
    <h3 className="border-b border-slate-200/80 pb-2 text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
      <span className="h-3.5 w-1 rounded-full bg-orange block" />
      {title}
    </h3>
    <div className="mt-3.5">{children}</div>
  </div>
);

const Field = ({ label, required, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label} {required ? <span className="text-orange font-bold">*</span> : null}
    </span>
    {children}
  </label>
);

const ReadOnlyField = ({ label, value, fallback }) => (
  <div className="min-w-0">
    <p className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <div
      className="site-input flex h-11 items-center bg-white px-3.5 text-sm font-semibold text-slate-800 border border-slate-200 rounded-xl shadow-xs overflow-hidden"
      title={value || fallback}
    >
      <span className="truncate w-full block">{value || fallback}</span>
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
  <select
    className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all cursor-pointer"
    value={value}
    onChange={(e) => onChange(field, e.target.value)}
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option || "Select"}
      </option>
    ))}
  </select>
);

const DropdownInput = ({ field, value, options, onChange, placeholder }) => {
  const isCustom = Boolean(value) && !options.includes(value);
  const [useManual, setUseManual] = useState(isCustom);
  const showManual = useManual || isCustom;

  return (
    <div className="space-y-1.5">
      {!showManual ? (
        <select
          className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all cursor-pointer"
          value={options.includes(value) ? value : ""}
          onChange={(e) => {
            if (e.target.value === "__manual__") {
              setUseManual(true);
              onChange(field, "");
            } else {
              onChange(field, e.target.value);
            }
          }}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="__manual__">Other (Enter Manually)</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            className="site-input h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => {
              setUseManual(false);
              onChange(field, "");
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Dropdown
          </button>
        </div>
      )}
    </div>
  );
};

const YesNoGroup = ({ field, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {yesNoOptions.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(field, option)}
        className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
          value === option
            ? "border-navy bg-navy text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);

const LocationDropdownOrInput = ({ field, value, options, onChange, placeholder }) => {
  const isCustom = Boolean(value) && !options.includes(value);
  const [useManual, setUseManual] = useState(isCustom);
  const showManual = useManual || isCustom;

  return (
    <div className="space-y-1.5">
      {!showManual ? (
        <select
          className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all cursor-pointer"
          value={options.includes(value) ? value : value ? "Other (Enter Manually)" : ""}
          onChange={(e) => {
            if (e.target.value === "Other (Enter Manually)") {
              setUseManual(true);
              onChange(field, "");
            } else {
              onChange(field, e.target.value);
            }
          }}
        >
          <option value="">Select {field[0].toUpperCase() + field.slice(1)}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          {!options.includes("Other (Enter Manually)") && (
            <option value="Other (Enter Manually)">Other (Enter Manually)</option>
          )}
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            className="site-input h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder || `Type ${field}`}
          />
          <button
            type="button"
            onClick={() => {
              setUseManual(false);
              onChange(field, "");
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Dropdown
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyPostingForm;
