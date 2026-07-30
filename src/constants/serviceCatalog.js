import {
  BrokerIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  ElectricalIcon,
  EngineeringIcon,
  GardenIcon,
  HandshakeIcon,
  HomeModernIcon,
  InteriorIcon,
  LandIcon,
  LoanIcon,
  ManagementIcon,
  MapIcon,
  PaintBrushIcon,
  PestControlIcon,
  PlumbingIcon,
  PropertySearchIcon,
  RegistrationIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TransportIcon,
  WrenchScrewdriverIcon,
} from "../components/AppIcons";

/** Hero + request-service links — Home and Office Service */
export const HOME_OFFICE_SERVICE_SHORTCUTS = [
  {
    label: "Home & Office Cleaning Service - Deep Cleaning",
    category: "home_office_services",
    type: "Home & Office Cleaning Service - Deep Cleaning",
  },
  {
    label: "Home & Office Shifting Service - Packers & Movers",
    category: "home_office_services",
    type: "Home & Office Shifting Service - Packers & Movers",
  },
  {
    label: "Home Appliance Service - TV, Fridge, Washing Machine Service",
    category: "home_office_services",
    type: "Home Appliance Service - TV, Fridge, Washing Machine Service",
  },
  {
    label: "Electrical & Plumbing Service",
    category: "home_office_services",
    type: "Electrical & Plumbing Service",
  },
  {
    label: "Interior & Carpentry Work",
    category: "home_office_services",
    type: "Interior & Carpentry Work",
  },
  {
    label: "Pest Control Service",
    category: "home_office_services",
    type: "Pest Control Service",
  },
  {
    label: "Tank, Sump & Bathroom Cleaning Service",
    category: "home_office_services",
    type: "Tank, Sump & Bathroom Cleaning Service",
  },
  {
    label: "Painting Work",
    category: "home_office_services",
    type: "Painting Work",
  },
  {
    label: "Sofa & Carpet Cleaning",
    category: "home_office_services",
    type: "Sofa & Carpet Cleaning",
  },
];

/** Hero + request-service links — Property Management Service */
export const PROPERTY_MANAGEMENT_SHORTCUTS = [
  {
    label: "Home & Apartment Facility AMC Service",
    category: "property_management",
    type: "Home & Apartment Facility AMC Service",
  },
  {
    label: "Industry & Warehouse Facility AMC Service",
    category: "property_management",
    type: "Industry & Warehouse Facility AMC Service",
  },
  {
    label: "Land Scaping & Garden Maintenance Property Management Service",
    category: "property_management",
    type: "Land Scaping & Garden Maintenance Property Management Service",
  },
  {
    label: "NRI Property Management Service",
    category: "property_management",
    type: "NRI Property Management Service",
  },
];

export const buildServiceRequestPath = ({ category, type }) => {
  const params = new URLSearchParams({ category });
  if (type) params.set("type", type);
  return `/request-service?${params.toString()}`;
};

export const serviceCategories = [
  {
    key: "buy-sell-rent",
    title: "Buy / Sell / Rent",
    description: "We help customers buy, sell, and rent properties with complete assistance.",
    icon: BrokerIcon,
    services: [
      {
        label: "Find your property",
        icon: HomeModernIcon,
        requestPath: "/request-service?category=property_buy&type=Find your property",
      },
      {
        label: "Sell your property",
        icon: BrokerIcon,
        requestPath: "/request-service?category=property_sell&type=Sell your property",
      },
      {
        label: "Rent your property",
        icon: HandshakeIcon,
        requestPath: "/request-service?category=property_rent&type=Rent your property",
      },
      {
        label: "Property guidance for buy sell and rent",
        icon: ScaleIcon,
        requestPath: "/request-service?category=property_buy&type=Property guidance for buy sell and rent",
      },
    ],
  },
  {
    key: "loan-services",
    title: "Loan Services",
    description: "Fast and reliable loan assistance for various property requirements.",
    icon: LoanIcon,
    services: [
      {
        label: "Home loan",
        icon: HomeModernIcon,
        requestPath: "/request-service?category=loan&type=Home Loan",
      },
      {
        label: "Plot loan",
        icon: LandIcon,
        requestPath: "/request-service?category=loan&type=Plot Loan",
      },
      {
        label: "Mortgage loan",
        icon: CreditCardIcon,
        requestPath: "/request-service?category=loan&type=Mortgage Loan",
      },
      {
        label: "Commercial loan",
        icon: BuildingOffice2Icon,
        requestPath: "/request-service?category=loan&type=Commercial Loan",
      },
      {
        label: "Agriculture loan",
        icon: GardenIcon,
        requestPath: "/request-service?category=loan&type=Agriculture Loan",
      },
      {
        label: "Home loan balance transfer",
        icon: CreditCardIcon,
        requestPath: "/request-service?category=loan&type=Home Loan Balance Transfer",
      },
    ],
  },
  {
    key: "registration-services",
    title: "Registration Services",
    description: "End-to-end documentation and registration assistance.",
    icon: RegistrationIcon,
    services: [
      {
        label: "Sale agreement support",
        icon: HandshakeIcon,
        requestPath: "/request-service?category=property_buy&type=Sale agreement support",
      },
      {
        label: "Legal verification support",
        icon: ScaleIcon,
        requestPath: "/request-service?category=property_buy&type=Legal verification support",
      },
      {
        label: "Patta transfer",
        icon: RegistrationIcon,
        requestPath: "/request-service?category=property_buy&type=Patta transfer",
      },
      {
        label: "Land survey",
        icon: MapIcon,
        requestPath: "/request-service?category=property_buy&type=Land survey",
      },
      {
        label: "Sale deed registration",
        icon: DocumentTextIcon,
        requestPath: "/request-service?category=property_buy&type=Sale deed registration",
      },
    ],
  },
  {
    key: "property-search",
    title: "Property Search",
    description: "Find suitable properties based on your requirements.",
    icon: PropertySearchIcon,
    services: [
      {
        label: "Plot",
        icon: LandIcon,
        requestPath: "/listings?intent=buy&propertyType=Plot",
      },
      {
        label: "Villa / Flat",
        icon: HomeModernIcon,
        requestPath: "/listings?intent=buy&propertyType=Villa,Flat",
      },
      {
        label: "Independent House",
        icon: HomeModernIcon,
        requestPath: "/listings?intent=buy&propertyType=Independent House",
      },
      {
        label: "Commercial Land / Building",
        icon: BuildingOffice2Icon,
        requestPath: "/listings?intent=buy&propertyType=Commercial Land,Commercial Building",
      },
      {
        label: "Farm Land",
        icon: GardenIcon,
        requestPath: "/listings?intent=buy&propertyType=Farm Land",
      },
      {
        label: "Agricultural Land",
        icon: GardenIcon,
        requestPath: "/listings?intent=buy&propertyType=Agricultural Land",
      },
    ],
  },
  {
    key: "interior-construction",
    title: "Interior & Construction",
    description: "Premium interior and construction solutions.",
    icon: InteriorIcon,
    services: [
      {
        label: "Home interiors",
        icon: InteriorIcon,
        requestPath: "/request-service?category=interior&type=Home Interior",
      },
      {
        label: "Office interiors",
        icon: PaintBrushIcon,
        requestPath: "/request-service?category=interior&type=Office Interior",
      },
      {
        label: "House construction",
        icon: EngineeringIcon,
        requestPath: "/request-service?category=construction&type=House Construction",
      },
      {
        label: "Office construction",
        icon: BuildingOffice2Icon,
        requestPath: "/request-service?category=construction&type=Office Construction",
      },
      {
        label: "Commercial building construction",
        icon: BuildingOffice2Icon,
        requestPath: "/request-service?category=construction&type=Commercial Building",
      },
      {
        label: "Apartment construction",
        icon: EngineeringIcon,
        requestPath: "/request-service?category=construction&type=Apartment",
      },
      {
        label: "Industry & warehouse construction",
        icon: EngineeringIcon,
        requestPath: "/request-service?category=construction&type=Industry %26 Warehouse",
      },
      {
        label: "Approval plans & blueprints",
        icon: DocumentMagnifyingGlassIcon,
        requestPath: "/request-service?category=construction&type=Approval plans",
        subItems: [
          {
            label: "2D Plan",
            icon: DocumentMagnifyingGlassIcon,
            requestPath: "/request-service?category=construction&type=2D Plan",
          },
          {
            label: "3D Plan",
            icon: HomeModernIcon,
            requestPath: "/request-service?category=construction&type=3D Plan",
          },
          {
            label: "HNTDA Approval",
            icon: ShieldCheckIcon,
            requestPath: "/request-service?category=construction&type=HNTDA Approval",
          },
          {
            label: "RERA Approval",
            icon: ShieldCheckIcon,
            requestPath: "/request-service?category=construction&type=RERA Approval",
          },
          {
            label: "Building Plan & Approval",
            icon: DocumentTextIcon,
            requestPath: "/request-service?category=construction&type=Building Plan %26 Approval",
          },
        ],
      },
    ],
  },
  {
    key: "property-management",
    title: "Property Management Service",
    description: "Comprehensive maintenance and management for all types of properties.",
    icon: ManagementIcon,
    services: PROPERTY_MANAGEMENT_SHORTCUTS.map((item) => ({
      label: item.label,
      icon: item.label.includes("NRI")
        ? ShieldCheckIcon
        : item.label.includes("Garden") || item.label.includes("Land")
          ? GardenIcon
          : item.label.includes("Warehouse")
            ? BuildingOffice2Icon
            : HomeModernIcon,
      requestPath: buildServiceRequestPath(item),
    })),
  },
  {
    key: "home-office-services",
    title: "Home & Office Services",
    description: "Cleaning, shifting, appliance care, repairs, and complete support for home and office spaces.",
    icon: WrenchScrewdriverIcon,
    services: HOME_OFFICE_SERVICE_SHORTCUTS.map((item) => ({
      label: item.label,
      icon: item.label.includes("Cleaning")
        ? SparklesIcon
        : item.label.includes("Shifting")
          ? TransportIcon
          : item.label.includes("Appliance")
            ? WrenchScrewdriverIcon
            : item.label.includes("Electrical")
              ? ElectricalIcon
              : item.label.includes("Plumbing")
                ? PlumbingIcon
                : item.label.includes("Interior") || item.label.includes("Carpentry")
                  ? PaintBrushIcon
                  : item.label.includes("Pest")
                    ? PestControlIcon
                    : PaintBrushIcon,
      requestPath: buildServiceRequestPath(item),
    })),
  },
];

export const serviceQuickLinks = serviceCategories.map(({ key, title, icon }) => ({
  key,
  title,
  icon,
}));
