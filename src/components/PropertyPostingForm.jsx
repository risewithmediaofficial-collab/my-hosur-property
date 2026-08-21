import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ClipboardDocumentCheckIcon, CreditCardIcon, TicketIcon, UserCircleIcon, XMarkIcon } from "./AppIcons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import { createProperty, updateProperty, uploadPropertyFiles } from "../services/api/propertyApi";
import { updateProfile } from "../services/api/authApi";
import RoleChangeModal from "./RoleChangeModal";
import { INDIA_STATE_OPTIONS, searchIndiaLocationNames } from "../services/geoLocationService";
import {
  getAreasByVillage,
  getCountries,
  getDistrictsByState,
  getStatesByCountry,
  getTaluksByDistrict,
  getVillagesByTaluk,
} from "../constants/locationData";

const propertyTypes = [
  "Plot",
  "Villa",
  "Flat",
  "Independent House",
  "Rent",
  "Apartment",
  "Warehouse / Industry",
  "PG",
  "Commercial Land / Building",
  "Rental Income Building",
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

const landAreaOptions = [
  "600 sq.ft",
  "800 sq.ft",
  "1000 sq.ft",
  "1200 sq.ft",
  "1500 sq.ft",
  "1800 sq.ft",
  "2000 sq.ft",
  "2400 sq.ft",
];
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
const commercialLandAreaUnitOptions = ["Cents", "Acres"];
const rentalIncomePriceOptions = [
  "₹5,000 to ₹10,000",
  "₹10,000 to ₹20,000",
  "₹20,000 to ₹30,000",
  "₹30,000 to ₹50,000",
  "₹50,000 to ₹75,000",
  "₹75,000 to ₹1 Lakh",
  "₹1 Lakh to ₹2 Lakhs",
  "₹2 Lakhs & Above",
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
const waterSourceVillaOptions = ["Borewell", "Layout Water", "Corporation Water"];
const waterSourceHouseOptions = ["Borewell", "Corporation Water"];
const maintenanceOptions = ["Included", "Not Included"];
const warehouseTypeOptions = ["Industrial", "Commercial", "Logistics", "Godown", "Cold Storage", "Manufacturing", "Distribution", "Other"];
const propertyConditionOptions = ["New", "Good", "Average", "Needs Renovation"];
const flooringTypeOptions = ["Concrete", "VDF", "Other"];
const vehicleAccessOptions = ["Bike", "Car", "Van", "LCV", "Truck", "32-ft Truck", "Container Truck"];
const priceBasisOptions = ["Built-up Area", "Land Area", "Total Property"];
const maintenanceBillingOptions = ["Monthly", "Quarterly", "Yearly"];
const contactMethodOptions = ["Phone", "WhatsApp", "Email"];
const gateTypeOptions = ["Sliding", "Rolling Shutter", "Swing Gate", "Other"];
const warehouseWaterOptions = ["Corporation Water", "Borewell", "Other"];
const pgTypeOptions = ["Gents", "Ladies"];
const warehouseUsageOptions = [
  "Logistics",
  "E-commerce",
  "Manufacturing",
  "Distribution",
  "Storage",
  "FMCG",
  "Automobile",
  "Engineering",
  "Food Processing",
  "Cold Storage",
  "Retail Storage",
  "Other",
];
const warehouseAmenityFields = [
  "parking",
  "security",
  "cctvCamera",
  "compoundWall",
  "lift",
  "goodsLift",
  "generator",
  "powerBackup",
  "officeRoom",
  "staffRoom",
  "washroom",
  "pantry",
  "loadingArea",
  "storageArea",
  "openYard",
  "solar",
  "fireSafety",
];
const warehouseApprovalFields = [
  "hntdaApproval",
  "dtcpApproval",
  "reraApproval",
  "panchayatApproval",
  "rocApproval",
  "buildingApproval",
  "fireNoc",
  "completionCertificate",
  "occupancyCertificate",
  "propertyTaxPaid",
  "ebConnection",
  "patta",
  "ecAvailable",
];
const cornerOptions = ["Not Corner", "One Side Corner", "Two Side Corner"];
const roadTypeOptions = ["Tar Road", "Concrete Road", "Mud Road", "Gravel Road", "Highway", "Main Road", "Layout Road", "Other"];
const priceOptions = ["7.00 L", "10.00 L", "12.00 L", "15.00 L", "25.00 L", "50.00 L", "75.00 L", "1.00 Cr"];
const facingOptions = ["East", "West", "North", "South", "North East", "North West", "South East", "South West"];
const yesNoOptions = ["Yes", "No"];
const propertyClassOptions = ["General", "AD Condition"];
const hidePropertyClassTypes = ["Rent", "PG", "Commercial Land / Building", "Rental Income Building", "Warehouse", "Warehouse / Industry"];
const soilTypeOptions = ["Red Soil", "Black Soil", "Clay Soil", "Alluvial Soil", "Sandy Soil", "Loam Soil"];

const defaultWarehouseDetails = {
  pincode: "",
  googleMapsLocation: "",
  propertyAge: "",
  constructionYear: "",
  propertyCondition: "",
  totalLandArea: "",
  landAreaUnit: "Sq.ft",
  builtupWarehouseArea: "",
  carpetArea: "",
  groundFloorArea: "",
  firstFloorArea: "",
  otherFloorArea: "",
  openYardArea: "",
  parkingArea: "",
  warehouseType: "",
  ceilingHeight: "",
  clearHeight: "",
  floorLoadCapacity: "",
  flooringType: "",
  numberOfShutters: "",
  shutterHeight: "",
  shutterWidth: "",
  numberOfLoadingBays: "",
  dockLeveler: "No",
  loadingUnloadingArea: "No",
  vehicleAccess: [],
  internalRoadWidth: "",
  truckTurningSpace: "No",
  containerAccess: "No",
  electricityAvailable: "No",
  connectionType: "",
  sanctionedLoad: "",
  transformer: "No",
  transformerCapacity: "",
  generator: "No",
  generatorCapacity: "",
  powerBackup: "No",
  solarPower: "No",
  waterSource: "",
  borewell: "No",
  waterStorageCapacity: "",
  overheadTank: "",
  undergroundTank: "",
  drainageAvailable: "No",
  securityGuard: "No",
  cctv: "No",
  cctvCount: "",
  securityRoom: "No",
  compoundWall: "No",
  mainGate: "No",
  gateType: "",
  fireSafetySystem: "No",
  fireNoc: "No",
  fireExtinguishers: "No",
  fireHydrant: "No",
  sprinklerSystem: "No",
  fireAlarm: "No",
  emergencyExit: "No",
  officeSpace: "No",
  officeArea: "",
  reception: "No",
  managerRoom: "No",
  staffRoom: "No",
  meetingRoom: "No",
  pantry: "No",
  washroom: "No",
  loadingDock: "No",
  dockHeight: "",
  ramp: "No",
  goodsLift: "No",
  forkliftAccess: "No",
  forkliftAvailable: "No",
  hntdaApproval: "No",
  dtcpApproval: "No",
  reraApproval: "No",
  panchayatApproval: "No",
  rocApproval: "No",
  buildingApproval: "No",
  completionCertificate: "No",
  occupancyCertificate: "No",
  propertyTaxPaid: "No",
  ebConnection: "No",
  patta: "No",
  ecAvailable: "No",
  sellingPrice: "",
  pricePerSqft: "",
  priceBasis: "Built-up Area",
  maintenance: "Without Maintenance",
  maintenanceAmount: "",
  maintenanceFrequency: "Monthly",
  suitableFor: [],
  propertyVideo: "",
  virtual360View: "",
  contactPerson: "",
  whatsappNumber: "",
  preferredContactMethod: "Phone",
};

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
  park: "No",
  cctvCamera: "No",
  security: "No",
  dtcp: "No",
  hntda: "No",
  rera: "No",
  panchayatApproval: "No",
  rocApproval: "No",
  reraId: "",
  bhk: "",
  bathrooms: "",
  furnishingStatus: "Unfurnished",
  floorNumber: "",
  totalFloors: "",
  builtupArea: "",
  areaUnit: "sqft",
  measurementType: "Square Feet",
  ratePerUnit: "",
  totalAmount: "",
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
  pgType: "",
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
  roadType: "",
  corner: "",
  waterSource: "",
  cropSuitable: "",
  borewell: "No",
  well: "No",
  soilType: "Red Soil",
  farmhouse: "No",
  farmhouseCount: "1",
  villaType: "Simplex",
  solar: "No",
  geyser: "No",
  ebPhase: "",
  buildAge: "",
  warehouseDetails: defaultWarehouseDetails,
  commercialSubType: "",
  rentalPrice: "",
  commercialLandArea: "",
  commercialLandAreaUnit: "Cents",
};

const typeFieldConfig = {
  Plot: {
    description: "Land-only details. No BHK, floor, or furnishing fields.",
    detailTitle: "Plot Details",
    priceLabel: "Expected Plot Price",
    detailFields: ["propertyClass", "length", "width", "plotType", "facing"],
    featureFields: ["gatedCommunity", "park", "cctvCamera", "security", "dtcp", "hntda", "rera", "panchayatApproval", "rocApproval"],
  },
  Villa: {
    description: "Independent villa details with rooms, land/build-up area, car parking, water source, and facilities.",
    detailTitle: "Villa Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["price", "propertyClass", "villaType", "bhk", "bathrooms", "builtupArea", "furnishingStatus", "facing", "carParking", "waterSourceType", "roadWidth", "roadType"],
    featureFields: ["gatedCommunity", "park", "cctvCamera", "security", "balcony", "powerBackup", "hntda", "rera"],
  },
  Flat: {
    description: "Flat details with registered land area, flat type, facing, and facilities.",
    detailTitle: "Flat Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["price", "flatArea", "furnishingStatus", "facing", "ebPhase"],
    featureFields: ["park", "lift", "security", "parking", "balcony", "powerBackup", "solar", "geyser", "hntda", "rera", "panchayatApproval", "rocApproval"],
  },
  "Independent House": {
    description: "House details with rooms, land/building area, car parking, water source, and utilities.",
    detailTitle: "Individual House Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["price", "propertyClass", "bhk", "bathrooms", "builtupArea", "furnishingStatus", "facing", "carParking", "waterSourceType"],
    featureFields: ["security", "cctvCamera", "dtcp", "hntda", "rera"],
  },
  Rent: {
    description: "Rental house details with monthly rent, car parking, maintenance, water source, and facilities.",
    detailTitle: "Rental Details",
    priceLabel: "Monthly Rent",
    detailFields: ["bhk", "bathrooms", "monthlyRent", "advance", "furnishingStatus", "facing", "carParking", "waterSourceType", "monthlyMaintenance", "roadWidth", "roadType"],
    featureFields: ["security", "lift", "powerBackup", "hntda", "rera"],
  },
  Apartment: {
    description: "Apartment details with floor, rooms, land area, and common facilities.",
    detailTitle: "Apartment Details",
    priceLabel: "Expected Sale Price",
    detailFields: ["price", "propertyClass", "bhk", "bathrooms", "builtupArea", "floorNumber", "totalFloors", "furnishingStatus", "facing"],
    featureFields: ["park", "lift", "security", "parking", "balcony", "powerBackup", "hntda", "rera"],
  },
  PG: {
    description: "PG / Hostel details with sharing type, rent, TV, WiFi, Gym, Washing Machine, and Hot Water.",
    detailTitle: "PG Details",
    priceLabel: "Monthly Rent",
    detailFields: ["pgType", "sharingType", "monthlyRent", "advance", "furnishingStatus", "bathrooms", "facing", "roadWidth", "roadType"],
    featureFields: ["foodIncluded", "tv", "wifi", "gym", "washingMachine", "hotWater", "security", "cctvCamera", "waterSupply", "powerBackup", "hntda", "rera"],
  },
  "Commercial Land / Building": {
    description: "Commercial land & building — choose sub-type: Commercial Land (cents/acres + expected price) or Commercial Building (detailed price structure).",
    detailTitle: "Commercial Details",
    priceLabel: "Expected Commercial Price",
    detailFields: ["builtupArea", "length", "width", "frontage", "roadWidth", "roadType", "corner"],
    featureFields: ["dtcp", "hntda", "rera", "roadAccess", "parking", "security", "cctvCamera"],
  },
  "Rental Income Building": {
    description: "Rental income building — commercial or residential building generating rental income. Includes sale price, monthly rental income, building details, and facilities.",
    detailTitle: "Rental Income Building Details",
    priceLabel: "Expected Sale Price / Rental Income",
    detailFields: ["builtupArea", "bhk", "bathrooms", "furnishingStatus", "facing", "carParking", "waterSourceType", "frontage", "roadWidth", "roadType", "corner"],
    featureFields: ["security", "cctvCamera", "dtcp", "hntda", "rera", "roadAccess", "parking", "lift", "powerBackup"],
  },
  "Warehouse / Industry": {
    description: "Warehouse & Industry details with land/build-up area, access, parking, and logistics-ready facilities.",
    detailTitle: "Warehouse / Industry Details",
    priceLabel: "Expected Warehouse / Industry Price",
    detailFields: ["buildAge", "facing", "roadWidth", "roadType", "frontage", "totalFloors"],
    featureFields: ["parking", "security", "powerBackup", "roadAccess", "electricity"],
  },
  Warehouse: {
    description: "Warehouse & Industry details with land/build-up area, access, parking, and logistics-ready facilities.",
    detailTitle: "Warehouse / Industry Details",
    priceLabel: "Expected Warehouse / Industry Price",
    detailFields: ["buildAge", "facing", "roadWidth", "roadType", "frontage", "totalFloors"],
    featureFields: ["parking", "security", "powerBackup", "roadAccess", "electricity"],
  },
  Farmland: {
    description: "Farmland details with land area, soil type, borewell, well, and crop suitability.",
    detailTitle: "Farmland Details",
    priceLabel: "Expected Farmland Price",
    detailFields: ["propertyClass", "roadWidth", "roadType", "waterSource", "soilType", "cropSuitable"],
    featureFields: ["borewell", "well", "farmhouse", "roadAccess", "waterSupply", "electricity", "boundaryWall"],
  },
  "Agri Land": {
    description: "Agricultural land details — land area in cents or acres. No HNTDA or RERA fields.",
    detailTitle: "Agricultural Land Details",
    priceLabel: "Expected Land Price",
    detailFields: ["propertyClass", "roadWidth", "waterSource", "soilType", "cropSuitable"],
    featureFields: ["borewell", "well", "farmhouse", "roadAccess", "waterSupply", "electricity", "boundaryWall"],
  },
};

const fieldLabels = {
  price: "Expected Sale Price",
  propertyClass: "Property Category",
  landArea: "Land Area",
  flatArea: "Flat Area",
  cents: "Land Area in Cents",
  length: "Length",
  width: "Width",
  plotType: "Plot Type",
  bhk: "BHK / Rooms",
  bathrooms: "Bathrooms",
  builtupArea: "Built-up Area",
  furnishingStatus: "Furnishing",
  floorNumber: "Floor Number",
  totalFloors: "Total Floors",
  measurementType: "Measurement",
  ratePerUnit: "Rate",
  totalAmount: "Total Amount",
  facing: "Facing",
  monthlyRent: "Monthly Rent",
  advance: "Advance",
  sharingType: "Sharing Type",
  pgType: "PG Type",
  frontage: "Frontage",
  roadWidth: "Road Size",
  roadType: "Road Type",
  corner: "Corners",
  waterSource: "Water Source",
  waterSourceType: "Water Source",
  cropSuitable: "Crop Suitable",
  gatedCommunity: "Gated Community",
  park: "Park",
  cctvCamera: "CCTV Camera",
  security: "Security",
  dtcp: "DTCP Approved",
  hntda: "HNTDA Approved",
  rera: "RERA Approved",
  panchayatApproval: "Panchayat Approval",
  rocApproval: "ROC Approval",
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
  compoundWall: "Compound Wall",
  goodsLift: "Goods Lift",
  generator: "Generator",
  officeRoom: "Office Room",
  staffRoom: "Staff Room",
  washroom: "Washroom",
  pantry: "Pantry",
  loadingArea: "Loading Area",
  storageArea: "Storage Area",
  openYard: "Open Yard",
  solar: "Solar",
  geyser: "Geyser",
  ebPhase: "EB Phase",
  buildAge: "Build Age of Warehouse / Industry",
  fireSafety: "Fire Safety",
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  const normalized = String(value).trim();
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return 0;

  const baseValue = Number(match[1]);
  const lower = normalized.toLowerCase();
  const isCr = /\b(cr|crore|crores)\b/.test(lower);
  const isL = /\b(l|lakh|lakhs)\b/.test(lower);

  if (isCr) return baseValue * 10000000;
  if (isL) return baseValue * 100000;
  return baseValue;
};

const computeTotalAmount = (formData) => {
  const areaValue = toNumber(formData.landArea);
  const rateValue = toNumber(formData.ratePerUnit);
  return areaValue > 0 && rateValue > 0 ? areaValue * rateValue : 0;
};

const getApiPropertyType = (type) => {
  if (type === "Rent") return "House";
  if (type === "Commercial Land / Building") return "Commercial Land / Building";
  return type;
};

const getListingType = (type) => (type === "Rent" || type === "PG" ? "rent" : "sale");

const normalizePlotType = (value) => {
  if (value === "Layout Plot" || value === "Layout Flat") return "Residential Plot";
  if (value === "Statistical Plot" || value === "Statistical Flat") return "Individual Plot";
  return value || "";
};

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

  const [form, setForm] = useState(() => {
    if (!initialData?.form) return defaultForm;
    return {
      ...initialData.form,
      plotType: normalizePlotType(initialData.form.plotType),
      warehouseDetails: {
        ...defaultWarehouseDetails,
        ...(initialData.form.warehouseDetails || {}),
      },
    };
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const countryOptions = useMemo(() => getCountries().map((item) => item.name), []);
  const stateOptions = useMemo(
    () => [...new Set([...INDIA_STATE_OPTIONS, ...getStatesByCountry(form.country || "India").map((item) => item.name)])],
    [form.country]
  );
  const districtOptions = useMemo(
    () => getDistrictsByState(form.country || "India", form.state).map((item) => item.name),
    [form.country, form.state]
  );
  const talukOptions = useMemo(
    () => getTaluksByDistrict(form.country || "India", form.state, form.district).map((item) => item.name),
    [form.country, form.state, form.district]
  );
  const villageOptions = useMemo(
    () => getVillagesByTaluk(form.country || "India", form.state, form.district, form.taluk).map((item) => item.name),
    [form.country, form.state, form.district, form.taluk]
  );
  const areaOptions = useMemo(() => {
    const villages = getVillagesByTaluk(form.country || "India", form.state, form.district, form.taluk);
    return villages.flatMap((village) => village.areas || []);
  }, [form.country, form.state, form.district, form.taluk]);
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
  const [showRoleModal, setShowRoleModal] = useState(false);

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
  const canPostForFree = isAdmin || (hasActivePlan && hasPostingQuota);
  const postingLimit = user?.activePlan?.listingLimit || 0;
  const postingUsed = user?.activePlan?.listingsUsed || 0;
  const contactLimit = user?.contactAccess?.monthlyLimit || user?.activePlan?.contactUnlocks || 0;
  const contactUsed = user?.contactAccess?.usedCount || 0;
  const contactLeft = Math.max(contactLimit - contactUsed, 0);
  const leadCreditsLeft = Math.max((user?.activePlan?.leadCredits || 0) + (user?.leadCredits || 0), 0);
  const planExpired = Boolean(user?.activePlan?.expiresAt && new Date(user.activePlan.expiresAt) < new Date());
  const activePlanName = user?.activePlan?.planId?.name || (isAdmin ? "Admin access" : "Active posting plan");
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
      toast.error("You have used your 6 free listings quota or your 6-month free posting period has ended. Please purchase a plan to post additional properties.");
      navigate("/plans");
    }
  }, [canPostForFree, isAdmin, hasPostingAccess, navigate, initialData]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateWarehouse = (key, value) => {
    setForm((prev) => ({
      ...prev,
      warehouseDetails: {
        ...defaultWarehouseDetails,
        ...(prev.warehouseDetails || {}),
        [key]: value,
      },
    }));
  };

  const toggleWarehouseListValue = (key, value) => {
    const currentValues = Array.isArray(form.warehouseDetails?.[key]) ? form.warehouseDetails[key] : [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    updateWarehouse(key, nextValues);
  };

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
      warehouseDetails: { ...defaultWarehouseDetails },
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
    setForm((prev) => ({ ...defaultForm, ...preserveContactFields(prev), warehouseDetails: { ...defaultWarehouseDetails } }));
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
      form.area.trim(),
      form.village.trim(),
    ];

    if (required.some((value) => !value)) return "Please fill location and price details.";

    // Commercial Land / Building — require sub-type selection
    if (form.propertyType === "Commercial Land / Building") {
      if (!form.commercialSubType) return "Please select the commercial sub-type: Commercial Land or Commercial Building.";
      if (form.commercialSubType === "Commercial Land") {
        if (!form.commercialLandArea) return "Please enter the land area (in cents or acres).";
        if (!form.price) return "Please enter the expected price for the commercial land.";
        return "";
      }
      // Commercial Building — require corner
      if (!form.corner) return "Please select the commercial building corners.";
    }

    // Rental Income Building
    if (form.propertyType === "Rental Income Building") {
      if (!form.price && !form.rentalPrice) return "Please enter the expected sale price or the monthly rental income.";
      return "";
    }

    const isWarehouse = form.propertyType === "Warehouse" || form.propertyType === "Warehouse / Industry";
    const isExpectedPriceOnly = ["Villa", "Independent House", "Flat", "Apartment"].includes(form.propertyType);

    if (isExpectedPriceOnly) {
      if (!toNumber(form.price)) return "Please enter the expected sale price.";
      return "";
    }

    if (isWarehouse) {
      const warehouse = { ...defaultWarehouseDetails, ...(form.warehouseDetails || {}) };
      if (!toNumber(warehouse.sellingPrice || form.price)) return "Please enter the warehouse selling price.";
      if (!toNumber(warehouse.totalLandArea || form.landArea) && !toNumber(warehouse.builtupWarehouseArea || form.builtupArea)) {
        return "Please enter warehouse land area or built-up area.";
      }
      return "";
    }

    const areaValue = toNumber(form.landArea || form.flatArea || form.cents || form.builtupArea);
    const rateValue = toNumber(form.ratePerUnit);
    const totalAmount = computeTotalAmount(form);

    if (!areaValue) return "Please enter the total area for price calculation.";
    if (!rateValue) return "Please enter the rate per unit to calculate the total amount.";
    if (!totalAmount) return "Please check area and rate details to calculate the total amount.";

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
      const warehouseDetails = { ...defaultWarehouseDetails, ...(form.warehouseDetails || {}) };
      const monthlyRent = toNumber(form.monthlyRent);
      const priceFieldValue = toNumber(form.price);
      const totalAmount = computeTotalAmount(form);
      const warehouseSellingPrice = toNumber(warehouseDetails.sellingPrice);
      const warehouseBuiltupArea = toNumber(warehouseDetails.builtupWarehouseArea || form.builtupArea);
      const warehousePricePerSqft = warehouseDetails.pricePerSqft || (
        warehouseSellingPrice > 0 && warehouseBuiltupArea > 0 ? Math.round(warehouseSellingPrice / warehouseBuiltupArea) : ""
      );
      const isWarehouse = form.propertyType === "Warehouse" || form.propertyType === "Warehouse / Industry";
      const isExpectedPriceOnly = ["Villa", "Independent House", "Flat", "Apartment", "Rental Income Building"].includes(form.propertyType);
      const isRentListing = getListingType(form.propertyType) === "rent";
      const isCommercialLand = form.propertyType === "Commercial Land / Building" && form.commercialSubType === "Commercial Land";

      const amount = isWarehouse
        ? (warehouseSellingPrice || priceFieldValue || totalAmount)
        : isRentListing ? (monthlyRent || priceFieldValue)
        : isExpectedPriceOnly ? (priceFieldValue || totalAmount)
        : isCommercialLand ? priceFieldValue
        : (totalAmount || priceFieldValue);

      const title = form.title.trim() || `${form.propertyType} in ${form.area || form.village || form.city}, ${form.city || "Hosur"}`;
      const activeConfig = typeFieldConfig[form.propertyType] || { detailFields: [], featureFields: [] };
      const showPropertyClass = !hidePropertyClassTypes.includes(form.propertyType);

      const baseAmenities = activeConfig.featureFields
        .filter((field) => form[field] === "Yes")
        .map((field) => fieldLabels[field]);
      const warehouseAmenities = isWarehouse
        ? warehouseAmenityFields
            .filter((field) => warehouseDetails[field] === "Yes" || form[field] === "Yes")
            .map((field) => fieldLabels[field] || field)
        : [];
      const amenities = [...new Set([...baseAmenities, ...warehouseAmenities])];

      const detailLines = [
        `Property Type: ${form.propertyType}`,
        showPropertyClass ? `Property Category: ${form.propertyClass || "General"}` : "",
        `Location: ${form.area}, ${form.village || ""}, ${form.taluk || ""}, ${form.district || ""}, ${form.state || ""}`,
        form.landArea ? `Land Area: ${form.landArea}` : "",
        form.flatArea ? `Flat Area: ${form.flatArea}` : "",
        form.cents ? `Cents: ${form.cents}` : "",
        form.builtupArea ? `Built-up Area: ${form.builtupArea}` : "",
        form.monthlyRent ? `Monthly Rent: ${form.monthlyRent}` : "",
        form.advance ? `Advance: ${form.advance}` : "",
        form.pgType ? `PG Type: ${form.pgType}` : "",
        form.sharingType ? `Sharing Type: ${form.sharingType}` : "",
        form.length ? `Length: ${form.length}` : "",
        form.width ? `Width: ${form.width}` : "",
        form.frontage ? `Frontage: ${form.frontage}` : "",
        form.roadWidth ? `Road Width: ${form.roadWidth}` : "",
        form.roadType ? `Road Type: ${form.roadType}` : "",
        form.corner ? `Corners: ${form.corner}` : "",
        form.cropSuitable ? `Crop Suitable: ${form.cropSuitable}` : "",
        form.soilType ? `Soil Type: ${form.soilType}` : "",
        form.farmhouse === "Yes" ? `Farmhouses: ${form.farmhouseCount || 1}` : "",
        form.monthlyMaintenance ? `Maintenance: ${form.monthlyMaintenance} ${form.maintenanceType || ""}` : "",
        form.rera ? `RERA Approved: ${form.rera}` : "",
        form.hntda ? `HNTDA Approved: ${form.hntda}` : "",
        isWarehouse && warehouseDetails.warehouseType ? `Warehouse Type: ${warehouseDetails.warehouseType}` : "",
        isWarehouse && warehouseDetails.builtupWarehouseArea ? `Built-up Warehouse Area: ${warehouseDetails.builtupWarehouseArea} sq.ft` : "",
        isWarehouse && warehouseDetails.openYardArea ? `Open Yard: ${warehouseDetails.openYardArea} sq.ft` : "",
        isWarehouse && warehouseDetails.vehicleAccess?.length ? `Vehicle Access: ${warehouseDetails.vehicleAccess.join(", ")}` : "",
        isWarehouse && warehousePricePerSqft ? `Price per Sq.Ft: ${warehousePricePerSqft}` : "",
        amenities.length ? `Facilities: ${amenities.join(", ")}` : "",
        form.description,
      ].filter(Boolean);

      const payload = {
        title,
        description: detailLines.join("\n"),
        price: amount,
        monthlyRent: monthlyRent || (isRentListing ? amount : undefined),
        rentalPrice: form.rentalPrice ? toNumber(form.rentalPrice) || form.rentalPrice : undefined,
        advance: form.advance || "",
        totalAmount: (isWarehouse || isExpectedPriceOnly || isCommercialLand) ? (warehouseSellingPrice || priceFieldValue || totalAmount || undefined) : (totalAmount || undefined),
        propertyType: apiPropertyType,
        propertyClass: showPropertyClass ? (form.propertyClass || "General") : undefined,
        commercialSubType: form.commercialSubType || undefined,
        measurementType: isCommercialLand ? (form.commercialLandAreaUnit || "Cents") : (form.measurementType || (form.propertyType === "Agri Land" || form.propertyType === "Farmland" ? "Cent" : "Square Feet")),
        ratePerUnit: form.ratePerUnit ? toNumber(form.ratePerUnit) : undefined,
        landArea: isWarehouse ? (warehouseDetails.totalLandArea || form.landArea || "") : isCommercialLand ? (form.commercialLandArea || "") : (form.landArea || ""),
        flatArea: form.flatArea || "",
        plotType: form.plotType || "",
        villaType: form.villaType || "",
        pgType: form.pgType || "",
        sharingType: form.sharingType || "",
        monthlyMaintenance: form.monthlyMaintenance ? toNumber(form.monthlyMaintenance) : undefined,
        maintenanceType: form.maintenanceType || undefined,
        waterSourceType: form.propertyType === "Warehouse" ? (warehouseDetails.waterSource || form.waterSourceType || "") : (form.waterSourceType || ""),
        waterSource: form.waterSource || "",
        frontage: form.frontage || "",
        roadWidth: form.roadWidth || "",
        roadType: form.roadType || "",
        corner: form.corner || "",
        soilType: form.soilType || "",
        cropSuitable: form.cropSuitable || "",
        farmhouseCount: form.farmhouse === "Yes" ? Number(form.farmhouseCount || 1) : undefined,
        borewell: form.borewell || "No",
        well: form.well || "No",
        layoutPlot: form.plotType === "Residential Plot" ? "Yes" : "No",
        individualPlot: form.plotType === "Individual Plot" ? "Yes" : "No",
        length: form.length || "",
        width: form.width || "",
        bhk: Number(form.bhk || 0),
        bathrooms: Number(form.bathrooms || 0),
        listingType: getListingType(form.propertyType),
        furnishingStatus: form.furnishingStatus,
        listingSource: form.postedBy,
        builtupArea: isWarehouse
          ? toNumber(warehouseDetails.builtupWarehouseArea || form.builtupArea || warehouseDetails.totalLandArea)
          : toNumber(form.builtupArea || form.landArea || form.flatArea),
        carpetArea: isWarehouse ? toNumber(warehouseDetails.carpetArea) : undefined,
        areaUnit: form.areaUnit,
        possessionStatus: form.possessionStatus,
        facing: form.facing || undefined,
        floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
        totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
        isSold: form.isSold === true || form.isSold === "true",
        amenities,
        nearbyFacilities: [],
        virtualTourUrl: isWarehouse ? warehouseDetails.virtual360View : "",
        warehouseDetails: isWarehouse
          ? {
              ...warehouseDetails,
              pricePerSqft: warehousePricePerSqft ? String(warehousePricePerSqft) : "",
            }
          : undefined,
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
          country: form.country.trim() || "India",
          state: form.state.trim(),
          district: form.district.trim(),
          taluk: form.taluk.trim(),
          village: form.village.trim(),
          city: (form.city || form.taluk || form.district || "Hosur").trim(),
          area: (form.area || "General").trim(),
          address: [form.houseAddress, form.village, form.taluk, form.district, form.state, form.country]
            .filter(Boolean)
            .join(", "),
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

  const getFieldLabel = (field, type = form.propertyType) => {
    if (type === "Flat") {
      if (field === "flatArea") return "Registered Land Area";
      if (field === "furnishingStatus") return "Flat Type";
    }
    if (type === "Agri Land" && field === "cropSuitable") return "Crops / Trees in Land";
    return fieldLabels[field] || field;
  };

  const isRequiredDetailField = (field) => (
    (form.propertyType === "Commercial Land / Building" && form.commercialSubType === "Commercial Building" && field === "corner") ||
    (form.propertyType === "Rental Income Building" && field === "corner")
  );

  const renderInput = (field) => {
    if (field === "bhk" && form.propertyType === "Villa") {
      return <Select field={field} value={form[field]} options={["", "1", "2", "3", "4", "5"]} onChange={update} />;
    }
    if (field === "bathrooms") {
      return <Select field={field} value={form[field]} options={["", "1", "2", "3", "4"]} onChange={update} />;
    }
    if (field === "measurementType") {
      const options = ["Square Feet", "Cent", "Acre"];
      return <Select field={field} value={form[field]} options={options} onChange={update} />;
    }
    if (field === "ratePerUnit") {
      const unit = form.measurementType === "Cent" ? "per cent" : form.measurementType === "Acre" ? "per acre" : "/ sq.ft";
      return (
        <div className="space-y-2">
          <div className="relative">
            <input
              className="site-input h-11"
              value={form.ratePerUnit}
              onChange={(e) => update("ratePerUnit", e.target.value)}
              placeholder="e.g. 2500"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹ {unit}</span>
          </div>
        </div>
      );
    }
    if (field === "totalAmount") {
      const total = computeTotalAmount(form);
      return (
        <div className="site-input h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-navy flex items-center justify-between">
          <span>{total > 0 ? `₹${total.toLocaleString("en-IN")}` : "Calculated total amount"}</span>
        </div>
      );
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
    if (field === "corner") {
      return <Select field={field} value={form[field]} options={["", ...cornerOptions]} onChange={update} />;
    }
    if (field === "roadType") {
      return <Select field={field} value={form[field]} options={["", ...roadTypeOptions]} onChange={update} />;
    }
    if (field === "cropSuitable" && form.propertyType === "Agri Land") {
      return (
        <textarea
          className="site-input min-h-[88px] resize-none"
          rows="3"
          value={form.cropSuitable}
          onChange={(e) => update("cropSuitable", e.target.value)}
          placeholder="Enter crops / trees in land, e.g. mango trees, coconut trees, paddy, ragi"
        />
      );
    }
    if (field === "plotType") {
      const options = ["", "Individual Plot", "Residential Plot"];
      return <Select field={field} value={form[field]} options={options} onChange={update} />;
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
      if (form.measurementType === "Cent" || form.measurementType === "Acre") {
        return (
          <input
            className="site-input"
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder={form.measurementType === "Acre" ? "Enter area in Acres" : "Enter area in Cents"}
          />
        );
      }
      return <DropdownInput field={field} value={form[field]} options={landAreaOptions} onChange={update} placeholder="e.g. 1000 sq.ft" />;
    }
    if (field === "flatArea") {
      if (form.propertyType === "Flat") {
        return (
          <input
            className="site-input h-11"
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder="Enter registered land area / flat area (e.g. 1200 sq.ft)"
          />
        );
      }
      if (form.propertyType === "Agri Land" || form.propertyType === "Farmland") {
        return <input className="site-input" value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder="Enter area in Cents or Acres" />;
      }
      return <DropdownInput field={field} value={form[field]} options={landAreaOptions} onChange={update} placeholder="e.g. 1000 sq.ft" />;
    }
    if (field === "price") {
      if (form.propertyType === "Flat") {
        return (
          <input
            className="site-input h-11"
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder="Enter price manually (e.g. ₹45 Lakhs)"
          />
        );
      }
      if (form.propertyType === "Plot") {
        return <DropdownInput field={field} value={form[field]} options={plotPriceOptions} onChange={update} placeholder="Select price range" />;
      }
      if (form.propertyType === "Villa" || form.propertyType === "Independent House") {
        return <DropdownInput field={field} value={form[field]} options={villaPriceOptions} onChange={update} placeholder="Select price" />;
      }
      if (form.propertyType === "Apartment") {
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
      return (
        <input
          className="site-input h-11"
          value={form[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder="Enter rent price"
        />
      );
    }
    if (field === "advance") {
      return (
        <input
          className="site-input h-11"
          value={form[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder="Enter advance amount"
        />
      );
    }
    if (field === "facing") {
      const options = form.propertyType === "Villa"
        ? ["", "East", "West", "North", "South"]
        : ["", ...facingOptions];
      return <Select field={field} value={form[field]} options={options} onChange={update} />;
    }
    if (field === "furnishingStatus") {
      const options = ["Semi Furnished", "Unfurnished", "Furnished"];
      return <Select field={field} value={form[field]} options={options} onChange={update} />;
    }
    if (field === "ebPhase") {
      return <Select field={field} value={form[field]} options={["", "Single Phase", "Three Phase"]} onChange={update} />;
    }
    if (field === "buildAge") {
      return (
        <input
          className="site-input h-11"
          value={form[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder="Enter build age of warehouse / industry (e.g. 3 years, New)"
        />
      );
    }
    if (field === "sharingType") {
      return <Select field={field} value={form[field]} options={["", "Single Sharing", "Two Sharing", "Three Sharing", "Four Sharing"]} onChange={update} />;
    }
    if (field === "pgType") {
      return <Select field={field} value={form[field]} options={["", ...pgTypeOptions]} onChange={update} />;
    }
    return <input className="site-input" value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder={getFieldLabel(field, form.propertyType)} />;
  };

  const renderWarehouseTextField = (field, label, placeholder = "") => (
    <Field label={label}>
      <input
        className="site-input h-11"
        value={form.warehouseDetails?.[field] || ""}
        onChange={(e) => updateWarehouse(field, e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );

  const renderWarehouseSelectField = (field, label, options) => (
    <Field label={label}>
      <Select
        field={field}
        value={form.warehouseDetails?.[field] || ""}
        options={["", ...options]}
        onChange={updateWarehouse}
      />
    </Field>
  );

  const renderWarehouseYesNo = (field, label) => (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{label}</p>
      <YesNoGroup field={field} value={form.warehouseDetails?.[field] || "No"} onChange={updateWarehouse} />
    </div>
  );

  const renderWarehouseMultiSelect = (field, label, options) => {
    const selected = Array.isArray(form.warehouseDetails?.[field]) ? form.warehouseDetails[field] : [];
    return (
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{label}</p>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleWarehouseListValue(field, option)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                selected.includes(option)
                  ? "border-navy bg-navy text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderWarehouseSections = () => {
    if (form.propertyType !== "Warehouse" && form.propertyType !== "Warehouse / Industry") return null;

    return (
      <>
        <FormSection title="Warehouse Basic Details">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseTextField("pincode", "Pincode", "e.g. 635109")}
            {renderWarehouseTextField("googleMapsLocation", "Google Maps Location", "Paste map link")}
            {renderWarehouseTextField("propertyAge", "Build Age of Warehouse / Industry", "e.g. 5 years / Under Construction")}
            {renderWarehouseTextField("constructionYear", "Construction Year", "e.g. 2021")}
            {renderWarehouseSelectField("propertyCondition", "Property Condition", propertyConditionOptions)}
          </div>
        </FormSection>

        <FormSection title="Warehouse Area Details">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseTextField("totalLandArea", "Total Land Area", "e.g. 20000")}
            {renderWarehouseSelectField("landAreaUnit", "Land Area Unit", ["Sq.ft", "Cent", "Acre"])}
            {renderWarehouseTextField("builtupWarehouseArea", "Built-up Area - Sq.ft", "e.g. 15000")}
            {renderWarehouseTextField("carpetArea", "Carpet / Usable Area - Sq.ft", "e.g. 14000")}
            {renderWarehouseTextField("groundFloorArea", "Ground Floor Area", "Sq.ft")}
            {renderWarehouseTextField("firstFloorArea", "First Floor Area", "Sq.ft")}
            {renderWarehouseTextField("otherFloorArea", "Other Floor Area", "Sq.ft")}
            {renderWarehouseTextField("openYardArea", "Open Yard Area", "Sq.ft")}
            {renderWarehouseTextField("parkingArea", "Parking Area", "Sq.ft")}
          </div>
        </FormSection>

        <FormSection title="Warehouse Structure">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseSelectField("warehouseType", "Warehouse Type", warehouseTypeOptions)}
            {renderWarehouseTextField("ceilingHeight", "Ceiling Height", "e.g. 28 ft")}
            {renderWarehouseTextField("clearHeight", "Clear Height", "e.g. 24 ft")}
            {renderWarehouseTextField("floorLoadCapacity", "Floor Load Capacity", "e.g. 5 MT")}
            {renderWarehouseSelectField("flooringType", "Flooring Type", flooringTypeOptions)}
            {renderWarehouseTextField("numberOfShutters", "Number of Shutters", "e.g. 4")}
            {renderWarehouseTextField("shutterHeight", "Shutter Height", "e.g. 14 ft")}
            {renderWarehouseTextField("shutterWidth", "Shutter Width", "e.g. 12 ft")}
            {renderWarehouseTextField("numberOfLoadingBays", "Number of Loading Bays", "e.g. 2")}
          </div>
          <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {renderWarehouseYesNo("dockLeveler", "Dock Leveler")}
            {renderWarehouseYesNo("loadingUnloadingArea", "Loading / Unloading Area")}
          </div>
        </FormSection>

        <FormSection title="Vehicle & Transportation Access">
          <div className="space-y-5">
            {renderWarehouseMultiSelect("vehicleAccess", "Vehicle Access", vehicleAccessOptions)}
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
              {renderWarehouseTextField("internalRoadWidth", "Internal Road Width", "e.g. 30 ft")}
              {renderWarehouseYesNo("truckTurningSpace", "Truck Turning Space")}
              {renderWarehouseYesNo("containerAccess", "Container Access")}
            </div>
          </div>
        </FormSection>

        <FormSection title="Electricity">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseYesNo("electricityAvailable", "Electricity Available")}
            {renderWarehouseSelectField("connectionType", "Connection Type", ["Single Phase", "Three Phase"])}
            {renderWarehouseTextField("sanctionedLoad", "Sanctioned Load - kW / HP", "e.g. 100 kW")}
            {renderWarehouseYesNo("transformer", "Transformer")}
            {renderWarehouseTextField("transformerCapacity", "Transformer Capacity", "e.g. 250 kVA")}
            {renderWarehouseYesNo("generator", "Generator")}
            {renderWarehouseTextField("generatorCapacity", "Generator Capacity", "e.g. 125 kVA")}
            {renderWarehouseYesNo("powerBackup", "Power Backup")}
            {renderWarehouseYesNo("solarPower", "Solar Power")}
          </div>
        </FormSection>

        <FormSection title="Water & Drainage">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseSelectField("waterSource", "Water Source", warehouseWaterOptions)}
            {renderWarehouseYesNo("borewell", "Borewell")}
            {renderWarehouseTextField("waterStorageCapacity", "Water Storage Capacity", "Litres")}
            {renderWarehouseTextField("overheadTank", "Overhead Tank", "Litres")}
            {renderWarehouseTextField("undergroundTank", "Underground Tank", "Litres")}
            {renderWarehouseYesNo("drainageAvailable", "Drainage Available")}
          </div>
        </FormSection>

        <FormSection title="Security">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseYesNo("securityGuard", "Security Guard")}
            {renderWarehouseYesNo("cctv", "CCTV")}
            {renderWarehouseTextField("cctvCount", "Number of CCTV Cameras", "e.g. 12")}
            {renderWarehouseYesNo("securityRoom", "Security Room")}
            {renderWarehouseYesNo("compoundWall", "Compound Wall")}
            {renderWarehouseYesNo("mainGate", "Main Gate")}
            {renderWarehouseSelectField("gateType", "Gate Type", gateTypeOptions)}
          </div>
        </FormSection>

        <FormSection title="Fire & Safety">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {renderWarehouseYesNo("fireSafetySystem", "Fire Safety System")}
            {renderWarehouseYesNo("fireNoc", "Fire NOC")}
            {renderWarehouseYesNo("fireExtinguishers", "Fire Extinguishers")}
            {renderWarehouseYesNo("fireHydrant", "Fire Hydrant")}
            {renderWarehouseYesNo("sprinklerSystem", "Sprinkler System")}
            {renderWarehouseYesNo("fireAlarm", "Fire Alarm")}
            {renderWarehouseYesNo("emergencyExit", "Emergency Exit")}
          </div>
        </FormSection>

        <FormSection title="Office & Loading Facilities">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseYesNo("officeSpace", "Office Space")}
            {renderWarehouseTextField("officeArea", "Office Area - Sq.ft", "e.g. 800")}
            {renderWarehouseYesNo("reception", "Reception")}
            {renderWarehouseYesNo("managerRoom", "Manager Room")}
            {renderWarehouseYesNo("staffRoom", "Staff Room")}
            {renderWarehouseYesNo("meetingRoom", "Meeting Room")}
            {renderWarehouseYesNo("pantry", "Pantry")}
            {renderWarehouseYesNo("washroom", "Washroom")}
            {renderWarehouseYesNo("loadingDock", "Loading Dock")}
            {renderWarehouseTextField("dockHeight", "Dock Height", "e.g. 4 ft")}
            {renderWarehouseYesNo("ramp", "Ramp")}
            {renderWarehouseYesNo("goodsLift", "Goods Lift")}
            {renderWarehouseYesNo("forkliftAccess", "Forklift Access")}
            {renderWarehouseYesNo("forkliftAvailable", "Forklift Available")}
          </div>
        </FormSection>

        <FormSection title="Warehouse Amenities">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {warehouseAmenityFields.map((field) => renderWarehouseYesNo(field, fieldLabels[field] || field))}
          </div>
        </FormSection>

        <FormSection title="Approvals & Documents">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {warehouseApprovalFields.map((field) => renderWarehouseYesNo(field, field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())))}
          </div>
        </FormSection>

        <FormSection title="Warehouse Price & Maintenance">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseTextField("sellingPrice", "Total Selling Price", "e.g. 5 Cr")}
            {renderWarehouseTextField("pricePerSqft", "Price per Sq.ft", "Auto or enter manually")}
            {renderWarehouseSelectField("priceBasis", "Price Basis", priceBasisOptions)}
            {renderWarehouseSelectField("maintenance", "Maintenance", ["With Maintenance", "Without Maintenance"])}
            {form.warehouseDetails?.maintenance === "With Maintenance" ? renderWarehouseTextField("maintenanceAmount", "Maintenance Amount", "e.g. 25000") : null}
            {form.warehouseDetails?.maintenance === "With Maintenance" ? renderWarehouseSelectField("maintenanceFrequency", "Maintenance Frequency", maintenanceBillingOptions) : null}
          </div>
        </FormSection>

        <FormSection title="Business / Usage Information">
          {renderWarehouseMultiSelect("suitableFor", "Suitable For", warehouseUsageOptions)}
        </FormSection>

        <FormSection title="Warehouse Media Links">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
            {renderWarehouseTextField("propertyVideo", "Property Video", "Paste video URL")}
            {renderWarehouseTextField("virtual360View", "360 View", "Paste 360 view URL")}
          </div>
        </FormSection>

        <FormSection title="Warehouse Contact Preference">
          <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
            {renderWarehouseTextField("contactPerson", "Contact Person", accountContact.name || "")}
            {renderWarehouseTextField("whatsappNumber", "WhatsApp Number", accountContact.phone || "")}
            {renderWarehouseSelectField("preferredContactMethod", "Preferred Contact Method", contactMethodOptions)}
          </div>
        </FormSection>
      </>
    );
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
            <Field label="Country" required>
              <LocationDropdownOrInput
                field="country"
                value={form.country}
                options={countryOptions}
                onChange={(field, value) => {
                  update("country", value);
                  update("state", "");
                  update("district", "");
                  update("taluk", "");
                  update("village", "");
                  update("area", "");
                }}
                placeholder="Select Country"
              />
            </Field>
            <Field label="State" required>
              <GeoLocationDropdown
                field="state"
                value={form.state}
                options={stateOptions}
                searchType="state"
                onChange={(field, value) => {
                  update("state", value);
                  update("district", "");
                  update("taluk", "");
                  update("village", "");
                  update("area", "");
                }}
                placeholder="Select State"
              />
            </Field>
            <Field label="District" required>
              <GeoLocationDropdown
                field="district"
                value={form.district}
                options={districtOptions}
                searchType="district"
                context={form}
                onChange={(field, value) => {
                  update("district", value);
                  update("taluk", "");
                  update("village", "");
                  update("area", "");
                }}
                placeholder="Select District"
              />
            </Field>
            <Field label="City / Taluk" required>
              <GeoLocationDropdown
                field="taluk"
                value={form.taluk}
                options={talukOptions}
                searchType="city"
                context={form}
                onChange={(field, value) => {
                  update("taluk", value);
                  update("village", "");
                  update("area", "");
                }}
                placeholder="Select Taluk"
              />
            </Field>
            <Field label="Area / Locality" required>
              <GeoLocationDropdown
                field="area"
                value={form.area}
                options={areaOptions}
                searchType="area"
                context={form}
                onChange={update}
                placeholder="Select Area / Locality"
              />
            </Field>
            <Field label="Village / Landmark" required>
              <GeoLocationDropdown
                field="village"
                value={form.village}
                options={villageOptions}
                searchType="village"
                context={form}
                onChange={(field, value) => {
                  update("village", value);
                  if (value && !form.area) {
                    const defaultArea = getAreasByVillage(form.country || "India", form.state, form.district, form.taluk, value)[0] || "";
                    if (defaultArea) update("area", defaultArea);
                  }
                }}
                placeholder="Select Village"
              />
            </Field>
            <Field label="Full Address / Survey Details" className="md:col-span-3">
              <textarea className="site-input min-h-[96px] resize-none" rows="3" value={form.houseAddress} onChange={(e) => update("houseAddress", e.target.value)} placeholder="Door No., Street, Survey No., Landmarks" />
            </Field>
          </div>
        </FormSection>

        {/* ── Commercial Land / Building — Sub-type selector ── */}
        {form.propertyType === "Commercial Land / Building" && (
          <FormSection title="Commercial Sub-Type">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-6">
                Select whether you are posting a <strong>Commercial Land</strong> (bare land for sale in cents / acres) or a <strong>Commercial Building</strong> (constructed property with built-up area).
              </p>
              <div className="flex flex-wrap gap-3">
                {["Commercial Land", "Commercial Building"].map((subType) => (
                  <button
                    key={subType}
                    type="button"
                    onClick={() => update("commercialSubType", subType)}
                    className={`rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all duration-200 ${
                      form.commercialSubType === subType
                        ? "border-orange bg-orange text-white shadow-md scale-[1.02]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-orange/50 hover:bg-orange/5"
                    }`}
                  >
                    {subType}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>
        )}

        {/* ── Price Details ── */}
        {form.propertyType === "Commercial Land / Building" && form.commercialSubType === "Commercial Land" ? (
          <FormSection title="Price Details — Commercial Land">
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
              <Field label="Land Area Unit" required>
                <Select
                  field="commercialLandAreaUnit"
                  value={form.commercialLandAreaUnit}
                  options={commercialLandAreaUnitOptions}
                  onChange={update}
                />
              </Field>
              <Field label={`Land Area (${form.commercialLandAreaUnit || "Cents"})`} required>
                <input
                  className="site-input h-11"
                  value={form.commercialLandArea}
                  onChange={(e) => update("commercialLandArea", e.target.value)}
                  placeholder={form.commercialLandAreaUnit === "Acres" ? "e.g. 1.5 Acres" : "e.g. 25 Cents"}
                />
              </Field>
              <Field label="Expected Price" required>
                <DropdownInput
                  field="price"
                  value={form.price}
                  options={commercialPriceOptions}
                  onChange={update}
                  placeholder="Select or enter price"
                />
              </Field>
            </div>
          </FormSection>
        ) : form.propertyType === "Rental Income Building" ? (
          <FormSection title="Price Details — Rental Income Building">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Pricing Information</p>
              <p className="text-sm text-slate-600 leading-6">Enter the <strong>expected sale price</strong> of the building and/or the <strong>current monthly rental income</strong> it generates.</p>
            </div>
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <Field label="Expected Sale Price">
                <DropdownInput
                  field="price"
                  value={form.price}
                  options={commercialPriceOptions}
                  onChange={update}
                  placeholder="Select or enter sale price"
                />
              </Field>
              <Field label="Monthly Rental Income" required>
                <DropdownInput
                  field="rentalPrice"
                  value={form.rentalPrice}
                  options={rentalIncomePriceOptions}
                  onChange={update}
                  placeholder="Select or enter monthly rental"
                />
              </Field>
            </div>
          </FormSection>
        ) : !["Warehouse", "Warehouse / Industry", "Rent", "PG", "Villa", "Independent House", "Flat", "Apartment"].includes(form.propertyType) ? (
          <FormSection title="Price Details">
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              <Field label="Measurement" required>
                {renderInput("measurementType")}
              </Field>
              <Field label="Land Area" required>
                {renderInput("landArea")}
              </Field>
              <Field label="Rate" required>
                {renderInput("ratePerUnit")}
              </Field>
              <Field label="Total Amount">
                {renderInput("totalAmount")}
              </Field>
            </div>
          </FormSection>
        ) : null}

        {/* Skip detail fields for Commercial Land (land-only doesn't need building details) */}
        {!(form.propertyType === "Commercial Land / Building" && form.commercialSubType === "Commercial Land") && (
          <FormSection title={config.detailTitle}>
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-3">
              {config.detailFields.map((field) => (
                <Field key={field} label={getFieldLabel(field, form.propertyType)} required={isRequiredDetailField(field)}>
                  {renderInput(field)}
                </Field>
              ))}
            </div>
          </FormSection>
        )}

        {renderWarehouseSections()}

        {(form.propertyType !== "Warehouse" && form.propertyType !== "Warehouse / Industry") ? (
          <FormSection title="Facilities / Features">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {config.featureFields.map((field) => (
                <div key={field}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{getFieldLabel(field, form.propertyType)}</p>
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
        ) : null}

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
          <p className="text-sm text-slate-600">You have used your 6 free listings quota or your 6-month free posting period has ended. Please purchase a plan to post additional properties.</p>
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
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline transition"
                >
                  Want to change user type (e.g. registered as Agent by mistake)? Request Admin
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="site-button-primary w-full mt-4 flex justify-center items-center py-2.5 rounded-lg text-sm font-bold text-white animate-pulse hover:animate-none"
            >
              {profileSaving ? "Saving..." : "Save and Proceed"}
            </button>
          </form>

          <RoleChangeModal
            open={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            onSuccess={() => refreshProfile?.()}
          />
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

const GeoLocationDropdown = ({ field, value, options = [], onChange, placeholder, searchType, context = {} }) => {
  const [remoteOptions, setRemoteOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const typedValue = String(value || "").trim().toLowerCase();
  const localOptions = useMemo(
    () => options.filter((option) => option !== "Other (Enter Manually)"),
    [options]
  );
  const mergedOptions = useMemo(() => {
    const allOptions = [...new Set([...localOptions, ...remoteOptions].filter(Boolean))];
    if (!typedValue) return allOptions;

    return allOptions
      .filter((option) => option.toLowerCase().includes(typedValue))
      .sort((a, b) => {
        const aText = a.toLowerCase();
        const bText = b.toLowerCase();
        const aStarts = aText.startsWith(typedValue);
        const bStarts = bText.startsWith(typedValue);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        if (aText === typedValue) return -1;
        if (bText === typedValue) return 1;
        return a.localeCompare(b);
      });
  }, [localOptions, remoteOptions, typedValue]);

  useEffect(() => {
    const searchValue = String(value || "").trim();
    const canLoadDefaultOptions = open && ["district", "city", "village", "area"].includes(searchType);
    if (!searchType || (searchValue.length < 2 && !canLoadDefaultOptions)) {
      setRemoteOptions([]);
      setLoading(false);
      return undefined;
    }

    let ignore = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      searchIndiaLocationNames({
        type: searchType,
        search: searchValue,
        state: context.state,
        district: context.district,
        city: context.taluk || context.city,
        village: context.village,
      })
        .then((items) => {
          if (!ignore) setRemoteOptions(items);
        })
        .catch(() => {
          if (!ignore) setRemoteOptions([]);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [context.city, context.district, context.state, context.taluk, context.village, open, searchType, value]);

  return (
    <div className="relative">
      <input
        className="site-input h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-20 text-sm font-medium text-navy shadow-xs focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
        value={value || ""}
        onChange={(e) => {
          onChange(field, e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder={placeholder || `Select ${field}`}
        autoComplete="new-password"
        name={`geo-${searchType || field}-lookup`}
        role="combobox"
        aria-expanded={open}
      />
      {loading ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
          Searching
        </span>
      ) : null}
      {open && mergedOptions.length ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {mergedOptions.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(field, option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-semibold transition ${
                value === option
                  ? "bg-orange/10 text-orange"
                  : "bg-white text-navy hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PropertyPostingForm;
