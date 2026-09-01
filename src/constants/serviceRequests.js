export const PROPERTY_REQUEST_TYPES = [
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

export const RENT_REQUEST_TYPES = [
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

export const BANK_OPTIONS = [
  "SBI (State Bank of India)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Canara Bank",
  "Bank of Baroda",
  "LIC Housing Finance",
  "Indian Bank",
  "Union Bank of India",
  "IDFC FIRST Bank",
  "Other / Partner Bank",
];

export const PG_TYPE_OPTIONS = ["Gents", "Ladies", "Co-living", "Any"];
export const PG_SHARING_OPTIONS = ["Single Room", "2 Sharing", "3 Sharing", "4 Sharing", "Any"];
export const PG_FOOD_OPTIONS = ["With Food Included", "Without Food", "Optional / Self Cooking", "Any"];

export const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
export const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
export const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
export const FACING_OPTIONS = [
  "East",
  "North",
  "West",
  "South",
  "North East",
  "North West",
  "South East",
  "South West",
  "Any Facing",
];
export const POSSESSION_OPTIONS = [
  "Ready to Move",
  "Under Construction",
  "Within 3 Months",
  "Within 6 Months",
  "Any",
];
export const CAR_PARKING_OPTIONS = [
  "1 Car",
  "2 Cars",
  "3+ Cars",
  "Bike Only",
  "No Parking",
  "Any",
];
export const WATER_SOURCE_OPTIONS = [
  "Borewell",
  "Corporation Water",
  "Layout Water",
  "Both Borewell & Corporation",
  "Any",
];
export const PLOT_UNIT_OPTIONS = ["sq.ft", "Cents", "Acres", "Gunthas"];
export const ROAD_WIDTH_OPTIONS = [
  "20 Feet",
  "25 Feet",
  "30 Feet",
  "40 Feet",
  "60 Feet Main Road",
  "Highway Facing",
  "Any",
];
export const ROAD_TYPE_OPTIONS = [
  "Thar Road",
  "Concrete Road",
  "Mud / Gravel Road",
  "Main Road",
  "Any",
];
export const APPROVAL_OPTIONS = [
  "DTCP Approved",
  "HNTDA Approved",
  "RERA Approved",
  "Panchayat Approved",
  "Patta Land",
  "Any Approved",
];
export const CORNER_OPTIONS = ["Not Corner", "One Side Corner", "Two Side Corner", "Any"];
export const COMMERCIAL_SPACE_TYPES = [
  "Office Space",
  "Retail Shop",
  "Commercial Building",
  "Showroom",
  "Warehouse / Godown",
  "Industrial Shed",
  "Commercial Land",
];
export const WAREHOUSE_TYPES = [
  "Industrial",
  "Commercial",
  "Logistics",
  "Godown",
  "Cold Storage",
  "Manufacturing",
  "Distribution",
];
export const VEHICLE_ACCESS_OPTIONS = [
  "Container Truck",
  "32-ft Truck",
  "Truck",
  "LCV / Van",
  "Car / Bike",
  "Any",
];
export const TENANT_PREFERENCE_OPTIONS = [
  "Family",
  "Bachelors",
  "Company Lease",
  "Any",
];
export const EMPLOYMENT_TYPE_OPTIONS = [
  "Salaried (Private / MNC)",
  "Salaried (Govt / PSU)",
  "Self-Employed Professional",
  "Business Owner / Self-Employed",
  "Farmer / Agriculture",
];
export const MONTHLY_INCOME_OPTIONS = [
  "Under ₹30,000",
  "₹30,000 to ₹60,000",
  "₹60,000 to ₹1 Lakh",
  "₹1 Lakh to ₹2 Lakhs",
  "₹2 Lakhs & Above",
];
export const CONSTRUCTION_CONTRACT_OPTIONS = [
  "Turnkey (Material + Labour)",
  "Labour Contract Only",
  "Architectural & 2D/3D Design Only",
  "Approval & Plan Support Only",
];
export const CONSTRUCTION_FLOOR_OPTIONS = [
  "Ground Floor (G)",
  "G + 1 Floor",
  "G + 2 Floors",
  "G + 3 Floors",
  "Multi-Storey",
];
export const INTERIOR_SCOPE_OPTIONS = [
  "Full Home Interior",
  "Modular Kitchen",
  "Living Room & TV Unit",
  "Bedroom & Wardrobes",
  "False Ceiling & Lighting",
  "Office / Commercial Interior",
];
export const INTERIOR_STYLE_OPTIONS = [
  "Modern & Minimalist",
  "Contemporary",
  "Luxury Premium",
  "Traditional / Classic",
  "Budget Friendly",
];
export const TIMELINE_OPTIONS = [
  "Immediate (Within 15-30 days)",
  "1 - 3 Months",
  "Planning Phase (3+ Months)",
];
export const MANAGEMENT_FREQUENCY_OPTIONS = [
  "Monthly AMC",
  "Quarterly",
  "Annual Contract",
  "One-Time Service",
];
export const POPULAR_HOSUR_AREAS = [
  "Bagalur Road",
  "Avalapalli Road",
  "Mathigiri",
  "Nallur Road",
  "SIPCOT Phase 1",
  "SIPCOT Phase 2",
  "Attibele Road",
  "Rayakottai Road",
  "Kelamangalam Road",
  "Denkanikottai Road",
  "Chennathur",
  "Alasanatham Road",
  "Bathalapalli",
  "Zuzuvadi",
  "Perandapalli",
  "Belagondapalli",
  "Thally Road",
  "Kamaraj Nagar",
  "Anthivadi",
  "Shoolagiri",
];

export const SERVICE_REQUEST_OPTIONS = {
  property_buy: {
    label: "Buy Property",
    requestCategory: "property_buy",
    propertyTypes: PROPERTY_REQUEST_TYPES,
    serviceTypes: [
      "Find your property",
      "Property guidance for buy sell and rent",
      "Sale agreement support",
      "Legal verification support",
      "Patta transfer",
      "Land survey",
      "Sale deed registration",
    ],
    budgetLabel: "Budget (Max)",
    budgetMinLabel: "Budget (Min)",
    showBudget: true,
  },
  property_sell: {
    label: "Sell Property",
    requestCategory: "property_sell",
    propertyTypes: PROPERTY_REQUEST_TYPES,
    serviceTypes: [
      "Sell your property",
      "Property guidance for buy sell and rent",
    ],
    budgetLabel: "Expected Selling Price",
    budgetMinLabel: "Minimum Expected Price",
    showBudget: true,
  },
  property_rent: {
    label: "Rent Property",
    requestCategory: "property_rent",
    propertyTypes: RENT_REQUEST_TYPES,
    serviceTypes: [
      "Rent your property",
      "Property guidance for buy sell and rent",
    ],
    budgetLabel: "Monthly Rent Budget (Max)",
    budgetMinLabel: "Monthly Rent (Min)",
    showBudget: true,
  },
  loan: {
    label: "Loan",
    requestCategory: "loan",
    serviceTypes: [
      "Home Loan",
      "Plot Loan",
      "Mortgage Loan",
      "Commercial Loan",
      "Agriculture Loan",
      "Home Loan Balance Transfer",
      "Private Finance",
    ],
    budgetLabel: "Required Loan Amount",
    showBankDropdown: true,
    showBudget: true,
  },
  interior: {
    label: "Interior",
    requestCategory: "interior",
    serviceTypes: ["Home Interior", "Office Interior"],
    budgetLabel: "Estimated Interior Budget",
    showBudget: true,
  },
  construction: {
    label: "Construction",
    requestCategory: "construction",
    serviceTypes: [
      "House Construction",
      "Office Construction",
      "Commercial Building",
      "Apartment",
      "Industry & Warehouse",
      "Approval plans",
      "2D Plan",
      "3D Plan",
      "HNTDA Approval",
      "RERA Approval",
      "Building Plan & Approval",
    ],
    budgetLabel: "Estimated Construction Budget",
    showBudget: true,
  },
  property_management: {
    label: "Property Management",
    requestCategory: "property_management",
    serviceTypes: [
      "Home & Apartment Facility AMC Service",
      "Industry & Warehouse Facility AMC Service",
      "Land Scaping & Garden Maintenance Property Management Service",
      "NRI Property Management Service",
      "Property Management Service",
    ],
    budgetLabel: "Expected Budget / Annual AMC",
    showBudget: true,
  },
  home_office_services: {
    label: "Home & Office Services",
    requestCategory: "home_office_services",
    serviceTypes: [
      "Home & Office Cleaning Service - Deep Cleaning",
      "Home & Office Shifting Service - Packers & Movers",
      "Home Appliance Service - TV, Fridge, Washing Machine Service",
      "Electrical & Plumbing Service",
      "Interior & Carpentry Work",
      "Pest Control Service",
      "Tank, Sump & Bathroom Cleaning Service",
      "Painting Work",
      "Sofa & Carpet Cleaning",
    ],
    budgetLabel: "Expected Budget",
    showBudget: true,
  },
};

export const SERVICE_REQUEST_CATEGORY_LIST = Object.values(SERVICE_REQUEST_OPTIONS);

