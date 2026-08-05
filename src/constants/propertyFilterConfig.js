export const PROPERTY_FILTER_CATEGORIES = [
  { id: "plot", label: "Plot" },
  { id: "agricultural", label: "Agricultural Land" },
  { id: "plotRent", label: "Plot for Rent" },
  { id: "farmland", label: "Farm Land" },
  { id: "villa", label: "Villa" },
  { id: "individualHouse", label: "Independent House" },
  { id: "houseRent", label: "House for Rent" },
  { id: "apartment", label: "Apartment" },
  { id: "commercial", label: "Commercial Land / Building" },
];

export const SORT_OPTIONS = [
  { id: "latest", label: "Latest Properties", apiSort: "-createdAt" },
  { id: "priceLowHigh", label: "Price Low to High", apiSort: "price" },
  { id: "priceHighLow", label: "Price High to Low", apiSort: "-price" },
  { id: "mostViewed", label: "Most Viewed", apiSort: "-viewCount" },
  { id: "nearbyFirst", label: "Nearby First", apiSort: "rank" },
];

export const PLOT_PRICE_PRESETS = [
  { label: "₹1 Lakh – ₹10 Lakhs", min: 100000, max: 1000000 },
  { label: "₹10 Lakhs – ₹20 Lakhs", min: 1000000, max: 2000000 },
  { label: "₹20 Lakhs – ₹30 Lakhs", min: 2000000, max: 3000000 },
  { label: "₹40 Lakhs – ₹50 Lakhs", min: 4000000, max: 5000000 },
  { label: "₹50 Lakhs – ₹60 Lakhs", min: 5000000, max: 6000000 },
  { label: "₹70 Lakhs – ₹80 Lakhs", min: 7000000, max: 8000000 },
  { label: "₹90 Lakhs – ₹1 Crore", min: 9000000, max: 10000000 },
  { label: "₹1 Crore & Above", min: 10000000, max: "" },
];

export const FARMLAND_PRICE_PRESETS = [
  { label: "₹1 Lakh – ₹2 Lakhs", min: 100000, max: 200000 },
  { label: "₹2 Lakhs – ₹3 Lakhs", min: 200000, max: 300000 },
  { label: "₹3 Lakhs – ₹4 Lakhs", min: 300000, max: 400000 },
  { label: "₹4 Lakhs – ₹5 Lakhs", min: 400000, max: 500000 },
  { label: "₹5 Lakhs – ₹6 Lakhs", min: 500000, max: 600000 },
  { label: "₹6 Lakhs – ₹7 Lakhs", min: 600000, max: 700000 },
  { label: "₹7 Lakhs – ₹8 Lakhs", min: 700000, max: 800000 },
  { label: "₹8 Lakhs – ₹9 Lakhs", min: 800000, max: 900000 },
  { label: "₹9 Lakhs – ₹10 Lakhs", min: 900000, max: 1000000 },
];

export const VILLA_HOUSE_PRICE_PRESETS = [
  { label: "₹30 Lakhs", min: 3000000, max: 3500000 },
  { label: "₹35 Lakhs", min: 3500000, max: 4000000 },
  { label: "₹40 Lakhs", min: 4000000, max: 4500000 },
  { label: "₹45 Lakhs", min: 4500000, max: 5000000 },
  { label: "₹50 Lakhs", min: 5000000, max: 5500000 },
  { label: "₹55 Lakhs", min: 5500000, max: 6000000 },
  { label: "₹60 Lakhs", min: 6000000, max: 7000000 },
  { label: "₹70 Lakhs", min: 7000000, max: 8000000 },
  { label: "₹80 Lakhs", min: 8000000, max: 9000000 },
  { label: "₹90 Lakhs", min: 9000000, max: 10000000 },
  { label: "₹1 Crore", min: 10000000, max: 12000000 },
  { label: "₹1.20 Crores", min: 12000000, max: 13000000 },
  { label: "₹1.30 Crores", min: 13000000, max: 14000000 },
  { label: "₹1.40 Crores", min: 14000000, max: 15000000 },
  { label: "₹1.50 Crores", min: 15000000, max: 17500000 },
  { label: "₹1.75 Crores", min: 17500000, max: 20000000 },
  { label: "₹2 Crores", min: 20000000, max: 25000000 },
  { label: "₹2 Crores & Above", min: 20000000, max: "" },
];

export const PLOT_RENT_PRESETS = [
  { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
  { label: "₹5,000 – ₹6,000", min: 5000, max: 6000 },
  { label: "₹6,000 – ₹7,000", min: 6000, max: 7000 },
  { label: "₹7,000 – ₹9,000", min: 7000, max: 9000 },
  { label: "₹9,000 – ₹10,000", min: 9000, max: 10000 },
  { label: "₹10,000 – ₹12,000", min: 10000, max: 12000 },
  { label: "₹12,000 – ₹15,000", min: 12000, max: 15000 },
  { label: "₹15,000 & Above", min: 15000, max: "" },
];

export const HOUSE_RENT_PRESETS = [
  { label: "₹4,000 – ₹6,000", min: 4000, max: 6000 },
  { label: "₹6,000 – ₹8,000", min: 6000, max: 8000 },
  { label: "₹8,000 – ₹10,000", min: 8000, max: 10000 },
  { label: "₹10,000 – ₹12,000", min: 10000, max: 12000 },
  { label: "₹12,000 – ₹15,000", min: 12000, max: 15000 },
  { label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { label: "₹20,000 – ₹25,000", min: 20000, max: 25000 },
  { label: "₹25,000 – ₹30,000", min: 25000, max: 30000 },
  { label: "₹30,000 – ₹50,000", min: 30000, max: 50000 },
  { label: "₹50,000 & Above", min: 50000, max: "" },
];

/** Facing options used by posting and listing search */
export const FACING_OPTIONS = [
  "East",
  "West",
  "North",
  "South",
  "East North",
  "South West",
];

export const DEFAULT_PLOT_LAND_AREA_OPTIONS = ["600 sq.ft", "800 sq.ft"];

/**
 * Property filter configurations per category.
 * Approvals are shown strictly per category requirements:
 * - Plot & Villa: HNTDA Approved, DTCP Approved, RERA Approved
 * - Flat & Apartment: RERA Approved ONLY (Hides HNTDA, DTCP)
 * - Commercial Land: HNTDA, DTCP, RERA Approved
 * - Commercial Building: RERA Approved ONLY
 * - Independent House, House for Rent, Agricultural Land, Plot for Rent, Farm Land: NO Approval Filters Shown.
 */
export const propertyFilterConfig = {
  // 1. Plot -> Show HNTDA, DTCP, RERA Approved
  plot: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: PLOT_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "approval",
      label: "Approval Filters",
      type: "checkbox",
      options: ["HNTDA Approved", "DTCP Approved", "RERA Approved"],
    },
    {
      key: "landArea",
      label: "Land Area",
      type: "checkbox",
      options: DEFAULT_PLOT_LAND_AREA_OPTIONS,
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
    {
      key: "dimensions",
      label: "Dimensions",
      type: "dimensions",
      lengthKey: "length",
      widthKey: "width",
    },
    {
      key: "plotType",
      label: "Plot Type",
      type: "checkbox",
      options: ["Layout Plot", "Statistical Plot"],
    },
  ],

  // 2. Villa -> Show HNTDA, DTCP, RERA Approved
  villa: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: VILLA_HOUSE_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "approval",
      label: "Approval Filters",
      type: "checkbox",
      options: ["HNTDA Approved", "DTCP Approved", "RERA Approved"],
    },
    {
      key: "carParking",
      label: "Car Parking",
      type: "checkbox",
      options: ["1 Car", "2 Cars", "3 Cars", "4+ Cars"],
    },
    {
      key: "waterSource",
      label: "Water Source",
      type: "checkbox",
      options: ["Borewell", "Layout Water"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
    {
      key: "bhk",
      label: "BHK",
      type: "checkbox",
      options: ["2 BHK", "3 BHK", "4 BHK", "5 BHK+"],
    },
  ],

  // 3. Flat / Apartment -> Show RERA Approved ONLY (Hide HNTDA, DTCP)
  apartment: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: VILLA_HOUSE_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "approval",
      label: "Approval Filters",
      type: "checkbox",
      options: ["RERA Approved"],
    },
    {
      key: "bhk",
      label: "BHK",
      type: "checkbox",
      options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
    {
      key: "carParking",
      label: "Car Parking",
      type: "radio",
      options: ["Yes", "No"],
    },
  ],

  flat: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: VILLA_HOUSE_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "approval",
      label: "Approval Filters",
      type: "checkbox",
      options: ["RERA Approved"],
    },
    {
      key: "bhk",
      label: "BHK",
      type: "checkbox",
      options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
  ],

  // 4. Commercial Land / Building -> Land: HNTDA, DTCP, RERA | Building: RERA ONLY
  commercial: [
    {
      key: "budget",
      label: "Budget",
      type: "rangePresets",
      presets: VILLA_HOUSE_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "purpose",
      label: "Purpose",
      type: "checkbox",
      options: ["Commercial Land", "Commercial Building", "Shop", "Office", "Showroom", "Warehouse"],
    },
    {
      key: "approval",
      label: "Approval Filters",
      type: "checkbox",
      options: ["HNTDA Approved", "DTCP Approved", "RERA Approved"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
  ],

  // 5. Agricultural Land -> DO NOT SHOW Approval Filters
  agricultural: [
    {
      key: "landArea",
      label: "Land Area (Cents / Acres)",
      type: "checkbox",
      options: [
        "20 Cents",
        "25 Cents",
        "50 Cents",
        "75 Cents",
        "1 Acre",
        "2 Acres",
        "3 Acres",
        "4 Acres",
        "5 Acres & Above",
      ],
    },
    {
      key: "landType",
      label: "Type of Land",
      type: "checkbox",
      options: ["Dry Land", "Wet Land"],
    },
    {
      key: "soilType",
      label: "Soil Type",
      type: "checkbox",
      options: ["Red Soil", "Black Soil", "Clay Soil", "Alluvial Soil", "Sandy Soil"],
    },
  ],

  // 6. Plot for Rent -> DO NOT SHOW Approval Filters
  plotRent: [
    {
      key: "rentBudget",
      label: "Monthly Rent",
      type: "rangePresets",
      presets: PLOT_RENT_PRESETS,
      minKey: "minRent",
      maxKey: "maxRent",
    },
    {
      key: "landArea",
      label: "Land Area",
      type: "checkbox",
      options: ["600 sq.ft", "800 sq.ft", "1200 sq.ft", "2400 sq.ft"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
  ],

  // 7. Farm Land -> DO NOT SHOW Approval Filters
  farmland: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: FARMLAND_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "landArea",
      label: "Land Area",
      type: "checkbox",
      options: [
        "10 Cents",
        "11 Cents",
        "15 Cents",
        "22 Cents",
        "25 Cents",
        "25 Cents & Above",
      ],
    },
  ],

  // 8. Independent House -> DO NOT SHOW Approval Filters
  individualHouse: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: VILLA_HOUSE_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "carParking",
      label: "Car Parking",
      type: "checkbox",
      options: ["1 Car", "2 Cars", "3 Cars", "4+ Cars"],
    },
    {
      key: "waterSource",
      label: "Water Source",
      type: "checkbox",
      options: ["Borewell", "Corporation Water"],
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
    {
      key: "bhk",
      label: "BHK",
      type: "checkbox",
      options: ["1 BHK", "2 BHK", "3 BHK", "4 BHK"],
    },
  ],

  // 9. House for Rent -> DO NOT SHOW Approval Filters
  houseRent: [
    {
      key: "rentBudget",
      label: "Monthly Rent",
      type: "rangePresets",
      presets: HOUSE_RENT_PRESETS,
      minKey: "minRent",
      maxKey: "maxRent",
    },
    {
      key: "carParking",
      label: "Car Parking",
      type: "radio",
      options: ["Yes", "No"],
    },
    {
      key: "monthlyMaintenance",
      label: "Monthly Maintenance",
      type: "maintenance",
      amountKey: "maintenanceAmount",
      statusKey: "maintenanceStatus",
      options: ["Included", "Not Included"],
    },
    {
      key: "waterSource",
      label: "Water Source",
      type: "checkbox",
      options: ["Borewell", "Corporation Water"],
    },
    {
      key: "bhk",
      label: "BHK",
      type: "checkbox",
      options: ["1 BHK", "2 BHK", "3 BHK"],
    },
  ],

  // Legacy Aliases
  buy: [
    {
      key: "budget",
      label: "Expected Price",
      type: "rangePresets",
      presets: PLOT_PRICE_PRESETS,
      minKey: "minPrice",
      maxKey: "maxPrice",
    },
    {
      key: "facing",
      label: "Facing",
      type: "checkbox",
      options: FACING_OPTIONS,
    },
  ],
  rentLease: [
    {
      key: "rentBudget",
      label: "Monthly Rent",
      type: "rangePresets",
      presets: HOUSE_RENT_PRESETS,
      minKey: "minRent",
      maxKey: "maxRent",
    },
  ],
};

export const getCategoryFieldKeys = (categoryId) => {
  const fields = propertyFilterConfig[categoryId] || [];
  const keys = new Set();
  fields.forEach((field) => {
    keys.add(field.key);
    if (field.minKey) keys.add(field.minKey);
    if (field.maxKey) keys.add(field.maxKey);
    if (field.lengthKey) keys.add(field.lengthKey);
    if (field.widthKey) keys.add(field.widthKey);
    if (field.amountKey) keys.add(field.amountKey);
    if (field.statusKey) keys.add(field.statusKey);
  });
  // Add common location & approval keys
  ["country", "state", "district", "taluk", "village", "locality", "location", "approval"].forEach((k) => keys.add(k));
  return keys;
};

export const getAllFilterFieldKeys = () => {
  const keys = new Set();
  Object.keys(propertyFilterConfig).forEach((cat) => {
    getCategoryFieldKeys(cat).forEach((k) => keys.add(k));
  });
  return keys;
};
