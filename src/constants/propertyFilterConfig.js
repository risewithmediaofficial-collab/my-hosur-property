/** Main property search categories — add new entries here to extend the system */
export const PROPERTY_FILTER_CATEGORIES = [
  { id: "buy", label: "Buy" },
  { id: "rentLease", label: "Rent / Lease" },
  { id: "commercial", label: "Commercial Land / Building" },
  { id: "agricultural", label: "Agricultural Land" },
  { id: "individualHouse", label: "Individual House" },
  { id: "apartment", label: "Apartment" },
];

export const SORT_OPTIONS = [
  { id: "latest", label: "Latest Properties", apiSort: "-createdAt" },
  { id: "priceLowHigh", label: "Price Low to High", apiSort: "price" },
  { id: "priceHighLow", label: "Price High to Low", apiSort: "-price" },
  { id: "mostViewed", label: "Most Viewed", apiSort: "-viewCount" },
  { id: "nearbyFirst", label: "Nearby First", apiSort: "rank" },
];

export const LOCATION_SUGGESTIONS = [
  "Hosur",
  "Bagalur Road",
  "Mathigiri",
  "Denkanikottai Road",
  "Sipcot",
  "Krishnagiri",
  "Kelamangalam",
  "Rayakottai",
];

export const COMMERCIAL_LOCATIONS = [
  "Hosur",
  "Bagalur Road",
  "Denkanikottai Road",
  "Sipcot",
  "Mathigiri",
  "Krishnagiri",
];

export const BUDGET_PRESETS = [
  { label: "₹25 Lakh - ₹50 Lakh", min: 2500000, max: 5000000 },
  { label: "₹50 Lakh - ₹75 Lakh", min: 5000000, max: 7500000 },
  { label: "₹75 Lakh - ₹1 Crore", min: 7500000, max: 10000000 },
  { label: "₹1 Crore - ₹1.5 Crore", min: 10000000, max: 15000000 },
  { label: "₹1.5 Crore - ₹2 Crore", min: 15000000, max: 20000000 },
  { label: "₹2 Crore - ₹3 Crore", min: 20000000, max: 30000000 },
  { label: "₹3 Crore - ₹5 Crore", min: 30000000, max: 50000000 },
  { label: "₹5 Crore - ₹7 Crore", min: 50000000, max: 70000000 },
  { label: "₹7 Crore - ₹10 Crore", min: 70000000, max: 100000000 },
  { label: "₹10 Crore+", min: 100000000, max: "" },
];

export const RENT_BUDGET_PRESETS = [
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000+", min: 20000, max: "" },
];

export const LEASE_PRESETS = [
  { label: "₹5 Lakh - ₹7 Lakh", min: 500000, max: 700000 },
  { label: "₹7 Lakh - ₹10 Lakh", min: 700000, max: 1000000 },
  { label: "₹10 Lakh - ₹15 Lakh", min: 1000000, max: 1500000 },
  { label: "₹15 Lakh - ₹20 Lakh", min: 1500000, max: 2000000 },
  { label: "₹20 Lakh+", min: 2000000, max: "" },
];

const facingOptions = ["East", "North", "South", "West"];
const distanceOptions = ["1 - 3 km", "3 - 5 km", "5 - 10 km", "10 km+"];

/**
 * Dynamic filter definitions per category.
 * type: checkbox | radio | search | select | range | rangePresets
 */
export const propertyFilterConfig = {
  buy: [
    {
      key: "propertyType",
      label: "Property Type",
      type: "checkbox",
      options: [
        "Individual House",
        "Apartment",
        "Villa",
        "Plot",
        "Commercial Building",
        "Commercial Land",
        "Agricultural Land",
      ],
    },
    { key: "location", label: "Location", type: "search", suggestions: LOCATION_SUGGESTIONS },
    { key: "budget", label: "Budget", type: "rangePresets", presets: BUDGET_PRESETS, minKey: "minPrice", maxKey: "maxPrice" },
    { key: "facing", label: "Facing", type: "checkbox", options: facingOptions },
    { key: "distance", label: "Distance", type: "checkbox", options: distanceOptions },
  ],

  commercial: [
    {
      key: "purpose",
      label: "Purpose",
      type: "checkbox",
      options: [
        "Buying",
        "Hospital",
        "Commercial Building",
        "Shop",
        "Office",
        "Showroom",
        "Warehouse",
        "Industrial Use",
      ],
    },
    { key: "location", label: "Location", type: "search", suggestions: COMMERCIAL_LOCATIONS },
    { key: "distance", label: "Distance", type: "checkbox", options: distanceOptions },
    { key: "budget", label: "Budget", type: "rangePresets", presets: BUDGET_PRESETS, minKey: "minPrice", maxKey: "maxPrice" },
    {
      key: "roadSize",
      label: "Road Size",
      type: "checkbox",
      options: ["25 - 30 feet", "30 - 40 feet", "40 - 60 feet", "60 feet+"],
    },
    { key: "facing", label: "Facing", type: "checkbox", options: facingOptions },
    {
      key: "monthlyIncome",
      label: "Monthly Income / ROI",
      type: "checkbox",
      options: ["0.5% - 0.7%", "0.7% - 1%", "1%+"],
    },
    {
      key: "buildingAge",
      label: "Building Age",
      type: "checkbox",
      options: ["0 - 2 years", "2 - 5 years", "5 - 7 years", "7 - 10 years", "10 years+"],
    },
  ],

  apartment: [
    {
      key: "landArea",
      label: "Land Area / Built-up Area",
      type: "checkbox",
      options: ["600 sq.ft", "800 sq.ft", "1000 sq.ft", "1200 sq.ft", "1500 sq.ft", "1800 sq.ft", "2000 sq.ft+"],
    },
    { key: "facing", label: "Facing", type: "checkbox", options: facingOptions },
    {
      key: "floors",
      label: "Number of Floors",
      type: "checkbox",
      options: ["2 Floors", "4 Floors", "5 Floors", "6 Floors", "7 Floors", "8 Floors", "9 Floors", "10 Floors", "15 Floors", "20 Floors+"],
    },
    {
      key: "units",
      label: "Number of Houses / Units",
      type: "checkbox",
      options: ["4 Units", "5 Units", "6 Units", "7 Units", "8 Units", "9 Units", "10 Units", "15 Units", "20 Units+"],
    },
    { key: "lift", label: "Lift", type: "radio", options: ["Yes", "No"] },
    { key: "security", label: "Security", type: "radio", options: ["Yes", "No"] },
    {
      key: "nearbyPlaces",
      label: "Nearby Places",
      type: "checkbox",
      options: ["School", "Hospital", "Bus Stop", "Market", "Railway Station"],
    },
    { key: "clubHouse", label: "Club House", type: "radio", options: ["Yes", "No"] },
    { key: "compoundWall", label: "Compound Wall", type: "radio", options: ["Yes", "No"] },
    {
      key: "ebConnection",
      label: "EB Connection",
      type: "checkbox",
      options: ["Single Phase", "3 Phase"],
    },
  ],

  agricultural: [
    {
      key: "landType",
      label: "Type of Land",
      type: "checkbox",
      options: ["Dry Land", "Wet Land"],
    },
    {
      key: "waterSource",
      label: "Water Source",
      type: "checkbox",
      options: ["Well", "Borewell", "River"],
    },
    { key: "location", label: "Location", type: "search", suggestions: LOCATION_SUGGESTIONS },
    {
      key: "roadSize",
      label: "Road Size",
      type: "checkbox",
      options: ["20 feet", "30 feet", "40 feet+"],
    },
    {
      key: "roadType",
      label: "Road Type",
      type: "checkbox",
      options: ["Tar Road", "Sand Road", "Mud Road"],
    },
    {
      key: "cityDistance",
      label: "City to Land Distance",
      type: "checkbox",
      options: ["Below 5 km", "5 - 10 km", "10 - 15 km", "15 - 20 km", "20 km+", "Anywhere"],
    },
    {
      key: "soilType",
      label: "Land Soil Type",
      type: "checkbox",
      options: ["Red Soil", "Normal Soil", "Clay Soil"],
    },
    {
      key: "landCondition",
      label: "Land Condition",
      type: "checkbox",
      options: [
        "Empty Land",
        "Mango Trees",
        "Coconut Trees",
        "Other Trees",
        "Registered Cultivation",
        "Flower Cultivation",
      ],
    },
    {
      key: "acres",
      label: "Acres",
      type: "checkbox",
      options: ["1 Acre", "2 - 3 Acres", "3 - 5 Acres", "5 - 10 Acres", "10 Acres+"],
    },
    {
      key: "pricePerAcre",
      label: "Price Per Acre",
      type: "checkbox",
      options: [
        "₹50 Lakh",
        "₹1 Crore",
        "₹2 Crore",
        "₹3 Crore",
        "₹5 Crore+",
        "₹1 Crore Per Acre",
        "₹2 Crore Per Acre",
        "₹3 Crore Per Acre+",
      ],
    },
  ],

  individualHouse: [
    {
      key: "houseType",
      label: "House Type",
      type: "checkbox",
      options: ["Simplex", "Duplex"],
    },
    { key: "bhk", label: "BHK", type: "checkbox", options: ["1 BHK", "2 BHK", "3 BHK"] },
    {
      key: "landArea",
      label: "Land Area",
      type: "checkbox",
      options: ["600 sq.ft", "800 sq.ft", "1000 sq.ft", "1200 sq.ft", "1500 sq.ft", "1800 sq.ft"],
    },
    {
      key: "builtUpArea",
      label: "Built-up Area",
      type: "checkbox",
      options: ["600 sq.ft", "700 sq.ft", "800 sq.ft", "900 sq.ft", "1000 sq.ft", "1100 sq.ft", "1500 sq.ft+"],
    },
    { key: "facing", label: "Facing", type: "checkbox", options: facingOptions },
    {
      key: "furnishing",
      label: "Furnishing",
      type: "checkbox",
      options: ["Furnished", "Semi Furnished", "Unfurnished"],
    },
    {
      key: "layoutType",
      label: "Layout Type",
      type: "checkbox",
      options: ["Normal Layout", "Gated Community Layout", "DTCP Approved Layout", "HNTDA Approved Layout"],
    },
    {
      key: "nearbyPlaces",
      label: "Nearby Places",
      type: "checkbox",
      options: ["Bus Stop", "School", "Hospital", "Market"],
    },
    { key: "carParking", label: "Car Parking", type: "radio", options: ["Yes", "No"] },
    { key: "distance", label: "Distance", type: "checkbox", options: ["3 km", "5 km", "7 km", "10 km+"] },
  ],

  rentLease: [
    {
      key: "propertyType",
      label: "Property Type",
      type: "checkbox",
      options: ["House", "Apartment", "PG", "Commercial Space"],
    },
    { key: "distance", label: "Distance", type: "checkbox", options: ["Within 3 km", "5 - 7 km", "7 - 10 km", "10 km+"] },
    { key: "bhk", label: "BHK", type: "checkbox", options: ["1 BHK", "2 BHK", "3 BHK"] },
    { key: "toilet", label: "Toilet", type: "checkbox", options: ["1", "2", "3"] },
    { key: "facing", label: "Facing", type: "checkbox", options: facingOptions },
    { key: "rentBudget", label: "Rent Budget", type: "rangePresets", presets: RENT_BUDGET_PRESETS, minKey: "minRent", maxKey: "maxRent" },
    { key: "leaseAmount", label: "Lease Amount", type: "rangePresets", presets: LEASE_PRESETS, minKey: "minLease", maxKey: "maxLease" },
    {
      key: "rentAdvance",
      label: "Rent Advance",
      type: "checkbox",
      options: ["1 Month", "2 Months", "3 Months", "5 Months", "10 Months+"],
    },
    {
      key: "furnishing",
      label: "Furnishing",
      type: "checkbox",
      options: ["Furnished", "Semi Furnished", "Unfurnished"],
    },
    {
      key: "layoutType",
      label: "Layout Type",
      type: "checkbox",
      options: ["Normal Layout", "Gated Community Layout"],
    },
    {
      key: "floors",
      label: "Number of Floors",
      type: "checkbox",
      options: ["1 Floor", "2 Floors", "3 Floors"],
    },
  ],
};

/** All filter field keys (excluding meta) for a category */
export const getCategoryFieldKeys = (categoryId) => {
  const fields = propertyFilterConfig[categoryId] || [];
  const keys = new Set();
  fields.forEach((field) => {
    keys.add(field.key);
    if (field.minKey) keys.add(field.minKey);
    if (field.maxKey) keys.add(field.maxKey);
  });
  return keys;
};

export const getAllFilterFieldKeys = () => {
  const keys = new Set();
  Object.keys(propertyFilterConfig).forEach((cat) => {
    getCategoryFieldKeys(cat).forEach((k) => keys.add(k));
  });
  return keys;
};
