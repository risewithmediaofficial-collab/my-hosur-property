export const PROPERTY_REQUEST_TYPES = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
  "House",
  "Office",
  "Warehouse",
  "Land",
  "Industrial Shed",
];

export const RENT_REQUEST_TYPES = ["House", "Office", "Commercial", "Warehouse", "Land", "Industrial Shed"];

export const SERVICE_REQUEST_OPTIONS = {
  property_buy: {
    label: "Buy Property",
    requestCategory: "property_buy",
    propertyTypes: PROPERTY_REQUEST_TYPES,
    budgetLabel: "Budget",
  },
  property_sell: {
    label: "Sell Property",
    requestCategory: "property_sell",
    propertyTypes: PROPERTY_REQUEST_TYPES,
    budgetLabel: "Expected Price",
  },
  property_rent: {
    label: "Rent Property",
    requestCategory: "property_rent",
    propertyTypes: RENT_REQUEST_TYPES,
    budgetLabel: "Monthly Rent Budget",
  },
  loan: {
    label: "Loan",
    requestCategory: "loan",
    serviceTypes: ["Plot Loan", "Private Finance", "House Loan"],
    budgetLabel: "Loan Amount",
  },
  interior: {
    label: "Interior",
    requestCategory: "interior",
    serviceTypes: ["House", "Office"],
    budgetLabel: "Project Budget",
  },
  construction: {
    label: "Construction",
    requestCategory: "construction",
    serviceTypes: ["House", "Commercial"],
    budgetLabel: "Project Budget",
  },
};

export const SERVICE_REQUEST_CATEGORY_LIST = Object.values(SERVICE_REQUEST_OPTIONS);
