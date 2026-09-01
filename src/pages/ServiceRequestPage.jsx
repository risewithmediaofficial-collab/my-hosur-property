import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  CheckIcon,
  CurrencyRupeeIcon,
  HandshakeIcon,
  HomeIcon,
  HomeModernIcon,
  InformationCircleIcon,
  InteriorIcon,
  LandIcon,
  LoanIcon,
  ManagementIcon,
  MapPinIcon,
  RentIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from "../components/AppIcons";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import { createCustomerRequest } from "../services/api/customerRequestApi";
import {
  APPROVAL_OPTIONS,
  BANK_OPTIONS,
  BATHROOM_OPTIONS,
  BHK_OPTIONS,
  CAR_PARKING_OPTIONS,
  COMMERCIAL_SPACE_TYPES,
  CONSTRUCTION_CONTRACT_OPTIONS,
  CONSTRUCTION_FLOOR_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  INTERIOR_SCOPE_OPTIONS,
  INTERIOR_STYLE_OPTIONS,
  MANAGEMENT_FREQUENCY_OPTIONS,
  MONTHLY_INCOME_OPTIONS,
  PG_FOOD_OPTIONS,
  PG_SHARING_OPTIONS,
  PG_TYPE_OPTIONS,
  PLOT_UNIT_OPTIONS,
  POPULAR_HOSUR_AREAS,
  POSSESSION_OPTIONS,
  ROAD_TYPE_OPTIONS,
  ROAD_WIDTH_OPTIONS,
  SERVICE_REQUEST_CATEGORY_LIST,
  SERVICE_REQUEST_OPTIONS,
  TENANT_PREFERENCE_OPTIONS,
  TIMELINE_OPTIONS,
  VEHICLE_ACCESS_OPTIONS,
  WATER_SOURCE_OPTIONS,
} from "../constants/serviceRequests";
import oneClickLogo from "../assets/one click logo.png";

// Import service images from assets
import buyGuidanceImg from "../assets/property buy guideance.jpg";
import sellGuidanceImg from "../assets/property sell guidance.jpg";
import houseImg from "../assets/house.png";
import commercialImg from "../assets/commerical.jpg";
import plotSearchImg from "../assets/plot search.jpg";
import homeLoanImg from "../assets/Home loan.jpg";
import plotLoanImg from "../assets/Plot loa.jpg";
import agricultureLoanImg from "../assets/Agriculture loan.jpg";
import registrationImg from "../assets/Sale deed registration.jpg";
import pattaImg from "../assets/patta.jpg";
import landSurveyImg from "../assets/Land survey.jpg";
import interiorsImg from "../assets/interiros.jpg";
import applianceServiceImg from "../assets/service-ai/home-appliance-service.png";
import cleaningServiceImg from "../assets/service-ai/home-office-deep-cleaning.png";
import carpentryServiceImg from "../assets/shreya-interior-work-govindpura-bhopal-carpenters-5e67m81n6x.avif";
import houseShiftingImg from "../assets/service-ai/home-office-shifting.png";
import paintingServiceImg from "../assets/painting_service.png";
import pestControlImg from "../assets/pest_control.png";
import contractsWorksImg from "../assets/contarcts works.jpg";
import nriPropertyMgmtImg from "../assets/nri property managment.png";
import officeInteriorImg from "../assets/office_interior.png";
import electricalPlumbingServiceImg from "../assets/service-ai/electrical-plumbing-service.jpg";
import tankSumpBathroomCleaningImg from "../assets/service-ai/tank-sump-bathroom-cleaning.jpg";
import sofaCarpetCleaningImg from "../assets/service-ai/sofa-carpet-cleaning.jpg";
import mortgagePrivateFinanceImg from "../assets/service-ai/mortgage-private-finance.jpg";
import approvalPlansBlueprintsImg from "../assets/service-ai/approval-plans-blueprints.jpg";
import homeApartmentAmcImg from "../assets/service-ai/home-apartment-amc.jpg";
import landscapingGardenMaintenanceImg from "../assets/service-ai/landscaping-garden-maintenance.jpg";
import officeRentalServiceImg from "../assets/service-ai/office-rental-service.jpg";
import warehouseRentalServiceImg from "../assets/service-ai/warehouse-rental-service.jpg";
import landRentalServiceImg from "../assets/service-ai/land-rental-service.jpg";

// Construction images from src/assets/construction images
import constHouseImg from "../assets/construction images/WhatsApp Image 2026-08-01 at 10.48.03 AM (1).jpeg";
import constCommercialImg from "../assets/construction images/WhatsApp Image 2026-08-01 at 10.48.03 AM (2).jpeg";
import constOfficeImg from "../assets/construction images/WhatsApp Image 2026-08-01 at 10.48.03 AM.jpeg";
import constApartmentImg from "../assets/construction images/WhatsApp Image 2026-08-01 at 10.48.04 AM (1).jpeg";
import constWarehouseImg from "../assets/construction images/WhatsApp Image 2026-08-01 at 10.48.04 AM (2).jpeg";

const CITY_OPTIONS = [
  "Hosur",
  "Krishnagiri",
  "Denkanikottai",
  "Shoolagiri",
  "Rayakottai",
  "Kelamangalam",
  "Bengaluru",
  "Other",
];

const CATEGORY_ICONS = {
  property_buy: HomeModernIcon,
  property_sell: HandshakeIcon,
  property_rent: RentIcon,
  loan: LoanIcon,
  interior: InteriorIcon,
  construction: WrenchScrewdriverIcon,
  property_management: ManagementIcon,
  home_office_services: SparklesIcon,
};

const getServiceImageDetails = (category, serviceType = "", propertyType = "") => {
  const sType = (serviceType || "").toLowerCase();
  const pType = (propertyType || "").toLowerCase();

  switch (category) {
    case "construction":
      if (
        sType.includes("house") ||
        sType.includes("residential") ||
        pType.includes("house") ||
        pType.includes("villa")
      ) {
        return {
          image: constHouseImg,
          badge: "House Construction",
          caption: "Quality House Construction Services in Hosur",
        };
      }
      if (sType.includes("commercial building") || pType.includes("commercial")) {
        return {
          image: constCommercialImg,
          badge: "Commercial Construction",
          caption: "Commercial Building Construction & Contracting",
        };
      }
      if (sType.includes("office")) {
        return {
          image: constOfficeImg,
          badge: "Office Construction",
          caption: "Modern Office Construction & Setup",
        };
      }
      if (
        sType.includes("apartment") ||
        sType.includes("flat") ||
        pType.includes("apartment")
      ) {
        return {
          image: constApartmentImg,
          badge: "Apartment Construction",
          caption: "Multi-Storey Apartment Construction Solutions",
        };
      }
      if (sType.includes("industry") || sType.includes("warehouse")) {
        return {
          image: constWarehouseImg,
          badge: "Industrial & Warehouse Construction",
          caption: "Industrial Shed & Warehouse Construction",
        };
      }
      if (
        sType.includes("plan") ||
        sType.includes("2d") ||
        sType.includes("3d") ||
        sType.includes("hntda") ||
        sType.includes("rera") ||
        sType.includes("approval")
      ) {
        return {
          image: approvalPlansBlueprintsImg,
          badge: "Approval Plans & Blueprints",
          caption: "HNTDA & RERA Approval Plans & 2D/3D Drawings",
        };
      }
      return {
        image: contractsWorksImg,
        badge: "Construction Services",
        caption: "Quality House & Commercial Building Construction",
      };

    case "home_office_services":
      if (sType.includes("deep cleaning")) {
        return {
          image: cleaningServiceImg,
          badge: "Deep Cleaning Service",
          caption: "Professional Home & Office Deep Cleaning",
        };
      }
      if (sType.includes("shifting") || sType.includes("packers") || sType.includes("movers")) {
        return {
          image: houseShiftingImg,
          badge: "Packers & Movers",
          caption: "Hassle-Free Home & Office Shifting",
        };
      }
      if (
        sType.includes("appliance") ||
        sType.includes("tv") ||
        sType.includes("fridge") ||
        sType.includes("washing")
      ) {
        return {
          image: applianceServiceImg,
          badge: "Appliance Service",
          caption: "Expert TV, Fridge & Washing Machine Repair",
        };
      }
      if (sType.includes("electrical") || sType.includes("plumbing")) {
        return {
          image: electricalPlumbingServiceImg,
          badge: "Electrical & Plumbing",
          caption: "Certified Electrical & Plumbing Maintenance",
        };
      }
      if (sType.includes("interior") || sType.includes("carpentry")) {
        return {
          image: carpentryServiceImg,
          badge: "Carpentry & Woodwork",
          caption: "Custom Carpentry & Furniture Repair",
        };
      }
      if (sType.includes("pest")) {
        return {
          image: pestControlImg,
          badge: "Pest Control",
          caption: "Safe & Effective Pest Control Solutions",
        };
      }
      if (sType.includes("tank") || sType.includes("sump") || sType.includes("bathroom")) {
        return {
          image: tankSumpBathroomCleaningImg,
          badge: "Tank, Sump & Bathroom Cleaning",
          caption: "Hygienic Sump & Overhead Tank Cleaning",
        };
      }
      if (sType.includes("painting")) {
        return {
          image: paintingServiceImg,
          badge: "Painting Work",
          caption: "Interior & Exterior House Painting",
        };
      }
      if (sType.includes("sofa") || sType.includes("carpet")) {
        return {
          image: sofaCarpetCleaningImg,
          badge: "Sofa & Carpet Cleaning",
          caption: "Sanitized Sofa & Upholstery Cleaning",
        };
      }
      return {
        image: cleaningServiceImg,
        badge: "Home & Office Care",
        caption: "Reliable Support for Home & Office Spaces",
      };

    case "loan":
      if (sType.includes("home loan balance transfer")) {
        return {
          image: homeLoanImg,
          badge: "Balance Transfer",
          caption: "Home Loan Balance Transfer with Lower Rates",
        };
      }
      if (sType.includes("plot")) {
        return {
          image: plotLoanImg,
          badge: "Plot Loan",
          caption: "Instant Approval Plot Purchase Financing",
        };
      }
      if (sType.includes("mortgage") || sType.includes("finance")) {
        return {
          image: mortgagePrivateFinanceImg,
          badge: "Mortgage Loan",
          caption: "Loan Against Property & Flexible Financing",
        };
      }
      if (sType.includes("commercial")) {
        return {
          image: commercialImg,
          badge: "Commercial Loan",
          caption: "High Value Commercial Property Financing",
        };
      }
      if (sType.includes("agriculture")) {
        return {
          image: agricultureLoanImg,
          badge: "Agriculture Loan",
          caption: "Low Interest Agri & Farm Land Financing",
        };
      }
      return {
        image: homeLoanImg,
        badge: "Home Loan Assistance",
        caption: "Quick & Easy Home Loan Approvals in Hosur",
      };

    case "interior":
      if (sType.includes("office")) {
        return {
          image: officeInteriorImg,
          badge: "Office Interiors",
          caption: "Modern Ergonomic Office Interior Setup",
        };
      }
      return {
        image: interiorsImg,
        badge: "Home Interiors",
        caption: "Luxury Residential Interior Design & Furnishing",
      };

    case "property_buy":
      if (pType.includes("plot") || pType.includes("land")) {
        return {
          image: plotSearchImg,
          badge: "Verified Plots",
          caption: "Find Approved Plots for Sale in Hosur",
        };
      }
      if (
        pType.includes("commercial") ||
        pType.includes("office") ||
        pType.includes("warehouse")
      ) {
        return {
          image: commercialImg,
          badge: "Commercial Spaces",
          caption: "Buy High-Yield Commercial Property in Hosur",
        };
      }
      if (
        sType.includes("deed") ||
        sType.includes("legal") ||
        sType.includes("agreement")
      ) {
        return {
          image: registrationImg,
          badge: "Legal & Documentation",
          caption: "Legal Verification & Sale Agreement Support",
        };
      }
      if (sType.includes("patta")) {
        return {
          image: pattaImg,
          badge: "Patta Transfer",
          caption: "Fast & Hassle-Free Patta Name Transfer",
        };
      }
      if (sType.includes("survey")) {
        return {
          image: landSurveyImg,
          badge: "Land Survey",
          caption: "Government Approved Land Measurement Survey",
        };
      }
      return {
        image: buyGuidanceImg,
        badge: "Property Buy Guidance",
        caption: "Expert Consultation for Property Buyers",
      };

    case "property_sell":
      if (pType.includes("plot") || pType.includes("land")) {
        return {
          image: plotSearchImg,
          badge: "Plot Sale",
          caption: "Sell Your Plot to Direct Verified Buyers",
        };
      }
      if (pType.includes("commercial")) {
        return {
          image: commercialImg,
          badge: "Commercial Sale",
          caption: "Sell Commercial Land & Buildings",
        };
      }
      return {
        image: sellGuidanceImg,
        badge: "Property Sell Assistance",
        caption: "Get Best Valuation & Fast Property Sale",
      };

    case "property_rent":
      if (pType.includes("warehouse") || pType.includes("industrial")) {
        return {
          image: warehouseRentalServiceImg,
          badge: "Warehouse Rental",
          caption: "Rent Warehouses & Industrial Sheds",
        };
      }
      if (pType.includes("land")) {
        return {
          image: landRentalServiceImg,
          badge: "Land Rental",
          caption: "Rent Empty Land with Road Access",
        };
      }
      if (pType.includes("commercial") || pType.includes("office")) {
        return {
          image: officeRentalServiceImg,
          badge: "Commercial Rental",
          caption: "Rent Offices & Commercial Spaces",
        };
      }
      return {
        image: houseImg,
        badge: "Residential Rental",
        caption: "Find Houses & Apartments for Rent in Hosur",
      };

    case "property_management":
      if (sType.includes("garden") || sType.includes("land")) {
        return {
          image: landscapingGardenMaintenanceImg,
          badge: "Landscaping & Garden",
          caption: "Professional Lawn & Garden Care",
        };
      }
      if (sType.includes("warehouse") || sType.includes("industry")) {
        return {
          image: warehouseRentalServiceImg,
          badge: "Facility AMC",
          caption: "Industrial & Warehouse Maintenance AMC",
        };
      }
      if (sType.includes("nri")) {
        return {
          image: nriPropertyMgmtImg,
          badge: "NRI Property Care",
          caption: "Dedicated Property Asset Care for NRIs",
        };
      }
      return {
        image: homeApartmentAmcImg,
        badge: "Property Management",
        caption: "Facility AMC & Complete Maintenance Services",
      };

    default:
      return {
        image: buyGuidanceImg,
        badge: "Property Service",
        caption: "Trusted Real Estate Services in Hosur",
      };
  }
};

const initialForm = {
  city: "Hosur",
  area: "",
  selectedBank: BANK_OPTIONS[0],
  budget: "",
  budgetMin: "",
  additionalRequirements: "",
};

const initialSpecs = {
  // Residential
  bhk: "2 BHK",
  bathrooms: "2",
  builtupArea: "",
  furnishing: "Unfurnished",
  facing: "East",
  parking: "1 Car",
  waterSource: "Borewell",
  possession: "Ready to Move",
  floor: "Any",
  gatedCommunity: "Any",
  tenantPreference: "Family",
  advanceDeposit: "",

  // PG
  pgType: "Gents",
  pgSharing: "2 Sharing",
  pgFood: "With Food Included",

  // Plot / Land / Farmland / Agri Land
  plotArea: "",
  plotUnit: "sq.ft",
  plotType: "Layout / Gated Plot",
  roadWidth: "30 Feet",
  roadType: "Tar Road",
  approvals: "DTCP Approved",
  fencing: "Compound Wall",

  // Commercial / Warehouse / Rental Income
  commercialType: "Office Space",
  ceilingHeight: "",
  powerLoad: "3-Phase",
  vehicleAccess: "Truck",

  // Loan
  employmentType: "Salaried (Private / MNC)",
  monthlyIncome: "₹30,000 to ₹60,000",
  propertyValue: "",

  // Construction
  constructionType: "House Construction",
  floors: "G + 1 Floor",
  contractType: "Turnkey (Material + Labour)",
  timeline: "Immediate (Within 15-30 days)",

  // Interior
  interiorScope: "Full Home Interior",
  propertyConfig: "2 BHK",
  interiorStyle: "Modern & Minimalist",

  // Property Management / Home Services
  managementFrequency: "Monthly AMC",
  urgency: "Within This Week",
};

const ServiceRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, user } = useAuth();

  const categoryFromQuery = searchParams.get("category") || "property_buy";
  const typeFromQuery = searchParams.get("type") || "";

  const defaultOption =
    SERVICE_REQUEST_OPTIONS[categoryFromQuery] || SERVICE_REQUEST_OPTIONS.property_buy;
  const defaultPropertyType = defaultOption.propertyTypes?.[0] || "";
  const defaultServiceType = defaultOption.serviceTypes?.includes(typeFromQuery)
    ? typeFromQuery
    : defaultOption.serviceTypes?.[0] || "";

  const [form, setForm] = useState(initialForm);
  const [specs, setSpecs] = useState(initialSpecs);
  const [requestCategory, setRequestCategory] = useState(defaultOption.requestCategory);
  const [propertyType, setPropertyType] = useState(defaultPropertyType);
  const [serviceType, setServiceType] = useState(defaultServiceType);
  const [submitting, setSubmitting] = useState(false);

  const bankFromQuery = searchParams.get("bank") || "";

  useEffect(() => {
    const nextOption =
      SERVICE_REQUEST_OPTIONS[categoryFromQuery] || SERVICE_REQUEST_OPTIONS.property_buy;
    setRequestCategory(nextOption.requestCategory);
    setPropertyType(nextOption.propertyTypes?.[0] || "");
    setServiceType(
      nextOption.serviceTypes?.includes(typeFromQuery)
        ? typeFromQuery
        : nextOption.serviceTypes?.[0] || ""
    );
    if (bankFromQuery && BANK_OPTIONS.includes(bankFromQuery)) {
      setForm((prev) => ({ ...prev, selectedBank: bankFromQuery }));
    }
  }, [categoryFromQuery, typeFromQuery, bankFromQuery]);

  const currentOption = useMemo(
    () => SERVICE_REQUEST_OPTIONS[requestCategory] || SERVICE_REQUEST_OPTIONS.property_buy,
    [requestCategory]
  );

  const categoryTitle = currentOption.label;
  const showPropertyType = Boolean(currentOption.propertyTypes?.length);
  const showServiceType = Boolean(currentOption.serviceTypes?.length);

  const isPropertyReq = ["property_buy", "property_sell", "property_rent"].includes(
    requestCategory
  );

  // Property sub-grouping matching List My Property categories
  const pTypeLower = (propertyType || "").toLowerCase();

  const isPG = isPropertyReq && (pTypeLower === "pg" || pTypeLower.includes("pg"));

  const isPlotOrLand =
    isPropertyReq &&
    !isPG &&
    (pTypeLower.includes("plot") ||
      pTypeLower.includes("land") ||
      pTypeLower.includes("agri") ||
      pTypeLower.includes("farm"));

  const isCommercialOrWarehouse =
    isPropertyReq &&
    !isPG &&
    !isPlotOrLand &&
    (pTypeLower.includes("commercial") ||
      pTypeLower.includes("office") ||
      pTypeLower.includes("warehouse") ||
      pTypeLower.includes("industry") ||
      pTypeLower.includes("rental income"));

  const isResidential =
    isPropertyReq &&
    !isPG &&
    !isPlotOrLand &&
    !isCommercialOrWarehouse;

  const imageDetails = useMemo(
    () => getServiceImageDetails(requestCategory, serviceType, propertyType),
    [requestCategory, serviceType, propertyType]
  );

  const handleSpecChange = (field, value) => {
    setSpecs((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.city.trim() || !form.area.trim()) {
      toast.error("City and area / locality are required");
      return;
    }

    if (showPropertyType && !propertyType) {
      toast.error("Please choose the property type");
      return;
    }

    if (showServiceType && !serviceType) {
      toast.error("Please choose the service type");
      return;
    }

    try {
      setSubmitting(true);

      // Build structured, clean specification notes
      const detailsSummary = [];

      if (isPG) {
        if (specs.pgType && specs.pgType !== "Any") detailsSummary.push(`• PG Type: ${specs.pgType}`);
        if (specs.pgSharing && specs.pgSharing !== "Any") detailsSummary.push(`• Room Sharing: ${specs.pgSharing}`);
        if (specs.pgFood && specs.pgFood !== "Any") detailsSummary.push(`• Food Facility: ${specs.pgFood}`);
      } else if (isResidential) {
        if (specs.bhk) detailsSummary.push(`• Configuration: ${specs.bhk}`);
        if (specs.bathrooms) detailsSummary.push(`• Bathrooms: ${specs.bathrooms}`);
        if (specs.builtupArea) detailsSummary.push(`• Built-up / Carpet Area: ${specs.builtupArea} sq.ft`);
        if (specs.furnishing) detailsSummary.push(`• Furnishing: ${specs.furnishing}`);
        if (specs.facing && specs.facing !== "Any Facing") detailsSummary.push(`• Facing Direction: ${specs.facing}`);
        if (specs.parking && specs.parking !== "Any") detailsSummary.push(`• Car Parking: ${specs.parking}`);
        if (specs.waterSource && specs.waterSource !== "Any") detailsSummary.push(`• Water Supply: ${specs.waterSource}`);
        if (specs.possession && specs.possession !== "Any") detailsSummary.push(`• Possession Status: ${specs.possession}`);
        if (specs.floor && specs.floor !== "Any") detailsSummary.push(`• Floor Preference: ${specs.floor}`);
        if (specs.gatedCommunity && specs.gatedCommunity !== "Any") detailsSummary.push(`• Gated Community: ${specs.gatedCommunity}`);
        if (requestCategory === "property_rent") {
          if (specs.tenantPreference && specs.tenantPreference !== "Any") detailsSummary.push(`• Preferred Tenant: ${specs.tenantPreference}`);
          if (specs.advanceDeposit) detailsSummary.push(`• Advance / Security Deposit: ₹${Number(specs.advanceDeposit).toLocaleString("en-IN")}`);
        }
      } else if (isPlotOrLand) {
        if (specs.plotArea) detailsSummary.push(`• Land / Plot Area: ${specs.plotArea} ${specs.plotUnit || "sq.ft"}`);
        if (specs.plotType && specs.plotType !== "Any") detailsSummary.push(`• Plot Type: ${specs.plotType}`);
        if (specs.facing && specs.facing !== "Any Facing") detailsSummary.push(`• Facing Direction: ${specs.facing}`);
        if (specs.roadWidth && specs.roadWidth !== "Any") detailsSummary.push(`• Road Width: ${specs.roadWidth}`);
        if (specs.roadType && specs.roadType !== "Any") detailsSummary.push(`• Road Type: ${specs.roadType}`);
        if (specs.approvals && specs.approvals !== "Any Approved") detailsSummary.push(`• Approval Preference: ${specs.approvals}`);
        if (specs.fencing && specs.fencing !== "Any") detailsSummary.push(`• Boundary / Fencing: ${specs.fencing}`);
      } else if (isCommercialOrWarehouse) {
        if (specs.commercialType) detailsSummary.push(`• Space Type: ${specs.commercialType}`);
        if (specs.builtupArea) detailsSummary.push(`• Area / Floor Space: ${specs.builtupArea} sq.ft`);
        if (specs.ceilingHeight) detailsSummary.push(`• Clear Height: ${specs.ceilingHeight} ft`);
        if (specs.powerLoad) detailsSummary.push(`• Power Load / Electricity: ${specs.powerLoad}`);
        if (specs.vehicleAccess && specs.vehicleAccess !== "Any") detailsSummary.push(`• Vehicle Access: ${specs.vehicleAccess}`);
        if (specs.parking && specs.parking !== "Any") detailsSummary.push(`• Dedicated Parking: ${specs.parking}`);
      } else if (requestCategory === "loan") {
        if (form.selectedBank) detailsSummary.push(`• Preferred Bank: ${form.selectedBank}`);
        if (specs.employmentType) detailsSummary.push(`• Employment Profile: ${specs.employmentType}`);
        if (specs.monthlyIncome) detailsSummary.push(`• Monthly Income: ${specs.monthlyIncome}`);
        if (specs.propertyValue) detailsSummary.push(`• Estimated Property Value: ₹${Number(specs.propertyValue).toLocaleString("en-IN")}`);
      } else if (requestCategory === "construction") {
        if (specs.plotArea) detailsSummary.push(`• Land / Plot Size: ${specs.plotArea} ${specs.plotUnit || "sq.ft"}`);
        if (specs.builtupArea) detailsSummary.push(`• Planned Built-up Area: ${specs.builtupArea} sq.ft`);
        if (specs.floors) detailsSummary.push(`• Planned Floors: ${specs.floors}`);
        if (specs.contractType) detailsSummary.push(`• Contract Preference: ${specs.contractType}`);
        if (specs.timeline) detailsSummary.push(`• Construction Timeline: ${specs.timeline}`);
      } else if (requestCategory === "interior") {
        if (specs.interiorScope) detailsSummary.push(`• Interior Scope: ${specs.interiorScope}`);
        if (specs.propertyConfig) detailsSummary.push(`• Property Size / BHK: ${specs.propertyConfig}`);
        if (specs.interiorStyle) detailsSummary.push(`• Style Preference: ${specs.interiorStyle}`);
        if (specs.timeline) detailsSummary.push(`• Execution Timeline: ${specs.timeline}`);
      } else if (requestCategory === "property_management") {
        if (specs.managementFrequency) detailsSummary.push(`• Service Frequency: ${specs.managementFrequency}`);
        if (specs.propertyConfig) detailsSummary.push(`• Property Type / Size: ${specs.propertyConfig}`);
      } else if (requestCategory === "home_office_services") {
        if (specs.propertyConfig) detailsSummary.push(`• Property Size / Scope: ${specs.propertyConfig}`);
        if (specs.urgency) detailsSummary.push(`• Urgency / Preferred Date: ${specs.urgency}`);
      }

      const reqNotes = [
        detailsSummary.length ? `[Requirement Specifications]\n${detailsSummary.join("\n")}` : "",
        form.additionalRequirements.trim()
          ? `[Additional Notes]\n${form.additionalRequirements.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const budgetValMax = Number(form.budget || 0);
      const budgetValMin = Number(form.budgetMin || 0) || budgetValMax;

      await createCustomerRequest(token, {
        requestCategory,
        propertyType: showPropertyType ? propertyType : undefined,
        serviceType: showServiceType ? serviceType : undefined,
        location: {
          city: form.city.trim(),
          area: form.area.trim(),
        },
        budgetMin: budgetValMin,
        budgetMax: budgetValMax,
        additionalRequirements: reqNotes,
        propertyDetails: {
          ...specs,
          city: form.city.trim(),
          area: form.area.trim(),
          selectedBank: currentOption.showBankDropdown ? form.selectedBank : undefined,
        },
      });

      toast.success("Request sent successfully! Our team will contact you.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell w-full px-4 py-4 sm:px-5 md:py-6 lg:px-6">
      <SeoHead
        title={`${categoryTitle} Request | MyHosurProperty`}
        description={`Submit your ${categoryTitle.toLowerCase()} request on MyHosurProperty and let our verified team and property partners contact you with exact matches in Hosur.`}
      />

      <section className="grid gap-6 lg:grid-cols-[0.80fr_1.20fr] items-stretch lg:h-[calc(100dvh-115px)] lg:max-h-[calc(100dvh-115px)]">
        {/* Left Column: Visual Guide & Partner Info */}
        <div className="marketing-card p-5 sm:p-6 flex flex-col justify-between overflow-y-auto service-request-scroll gap-4">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-3 py-1 text-xs font-bold text-orange uppercase tracking-wider">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span>Verified Requirement Desk</span>
              </div>
              <h1 className="mt-2.5 text-2xl font-black font-sans tracking-tight text-navy sm:text-3xl leading-tight">
                {categoryTitle} Request
              </h1>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Tell us your exact requirement in Hosur. We will match your specifications with verified listings and directly follow up with you.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="relative h-56 sm:h-64 lg:h-72 w-full overflow-hidden bg-slate-100">
                <img
                  key={imageDetails.image}
                  src={imageDetails.image}
                  alt={`${categoryTitle} Service`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-all duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent flex flex-col justify-end p-4 sm:p-5 text-white">
                  <span className="inline-block rounded-md bg-orange px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm mb-1.5 w-fit">
                    {imageDetails.badge}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold font-sans leading-snug text-white drop-shadow-sm">
                    {imageDetails.caption}
                  </h3>
                </div>
              </div>
            </div>

            {/* Quick Assurance Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-center">
                <p className="text-xs font-bold text-navy">100% Direct Response</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Admin &amp; Verified Owners</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-center">
                <p className="text-xs font-bold text-navy">Hosur &amp; Surroundings</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Hyper-local Coverage</p>
              </div>
            </div>
          </div>

          {requestCategory === "home_office_services" && (
            <div className="rounded-2xl border-2 border-orange/30 bg-gradient-to-br from-orange/5 via-white to-amber-50/60 p-4 shadow-xs mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xs flex items-center justify-center">
                    <img
                      src={oneClickLogo}
                      alt="OneClick 2 Serve"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange">
                      Official Service Partner
                    </span>
                    <h4 className="text-sm font-extrabold text-navy leading-tight">
                      OneClick 2 Serve
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Office &amp; Home Services in Hosur
                    </p>
                  </div>
                </div>

                <a
                  href="https://oneclick2serve.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-orange/90 w-full sm:w-auto shrink-0"
                >
                  <span>Visit Partner</span>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600 border-t border-orange/10 pt-2">
                Need on-demand services? Visit our dedicated OneClick 2 Serve portal for instant booking in Hosur.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Professional Dynamic Request Form with Inline Scroll */}
        <div className="marketing-card p-5 sm:p-6 md:p-7 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Category Navigation Pills - Fixed at Top */}
          <div className="shrink-0 pb-3.5 border-b border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Requirement Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SERVICE_REQUEST_CATEGORY_LIST.map((item) => {
                const IconComponent = CATEGORY_ICONS[item.requestCategory] || HomeIcon;
                const isSelected = requestCategory === item.requestCategory;
                return (
                  <button
                    key={item.requestCategory}
                    type="button"
                    onClick={() => {
                      setRequestCategory(item.requestCategory);
                      setPropertyType(item.propertyTypes?.[0] || "");
                      setServiceType(item.serviceTypes?.[0] || "");
                    }}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-all text-left border ${
                      isSelected
                        ? "border-orange bg-orange text-white shadow-xs shadow-orange/20 scale-[1.01]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-orange"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content - Inline Scrollable Body */}
          <form
            onSubmit={onSubmit}
            className="flex-1 min-h-0 overflow-y-auto service-request-scroll space-y-5 pt-4 pr-1.5 sm:pr-2.5"
          >
            {/* Section 1: Location & Sub-Type */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <MapPinIcon className="h-4 w-4 text-orange" />
                <h2 className="text-sm sm:text-base font-bold font-sans tracking-tight text-navy">
                  1. Location &amp; Category Type
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    City <span className="text-red-500">*</span>
                  </span>
                  <select
                    className="site-input font-medium text-slate-900"
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  >
                    {CITY_OPTIONS.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Area / Locality <span className="text-red-500">*</span>
                  </span>
                  <input
                    className="site-input"
                    value={form.area}
                    onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g. Bagalur Road, Mathigiri"
                  />
                </label>

                {/* Popular Area Suggestion Chips */}
                <div className="sm:col-span-2 -mt-1">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Popular Hosur Localities:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                    {POPULAR_HOSUR_AREAS.slice(0, 10).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, area: loc }))}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                          form.area.toLowerCase() === loc.toLowerCase()
                            ? "bg-navy text-white font-bold"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {showPropertyType && (
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Property Type <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="site-input font-bold text-navy"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      {currentOption.propertyTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {showServiceType && (
                  <label className={`block ${showPropertyType ? "" : "sm:col-span-2"}`}>
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Service Requirement <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="site-input font-bold text-navy"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      {currentOption.serviceTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {currentOption.showBankDropdown && (
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Preferred Bank <span className="text-red-500">*</span>
                    </span>
                    <select
                      className="site-input font-bold text-navy"
                      value={form.selectedBank}
                      onChange={(e) => setForm((prev) => ({ ...prev, selectedBank: e.target.value }))}
                    >
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>

            {/* Section 2: Dynamic Category & Property Specific Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <BuildingOffice2Icon className="h-4 w-4 text-orange" />
                  <h2 className="text-sm sm:text-base font-bold font-sans tracking-tight text-navy">
                    2. {propertyType || categoryTitle} Specifications
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                  Detailed requirements for best match
                </span>
              </div>

              {/* A. PG (Paying Guest) Specific Details */}
              {isPG && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        PG Type
                      </span>
                      <select
                        className="site-input"
                        value={specs.pgType}
                        onChange={(e) => handleSpecChange("pgType", e.target.value)}
                      >
                        {PG_TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Room Sharing
                      </span>
                      <select
                        className="site-input"
                        value={specs.pgSharing}
                        onChange={(e) => handleSpecChange("pgSharing", e.target.value)}
                      >
                        {PG_SHARING_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block sm:col-span-2 lg:col-span-1">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Food Facility
                      </span>
                      <select
                        className="site-input"
                        value={specs.pgFood}
                        onChange={(e) => handleSpecChange("pgFood", e.target.value)}
                      >
                        {PG_FOOD_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* B. Residential Property Details (House / Villa / Apartment / Flat / Independent House) */}
              {isResidential && (
                <div className="space-y-4">
                  <div>
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Configuration (BHK)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {BHK_OPTIONS.map((bhk) => (
                        <button
                          key={bhk}
                          type="button"
                          onClick={() => handleSpecChange("bhk", bhk)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            specs.bhk === bhk
                              ? "bg-navy text-white shadow-xs"
                              : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {bhk}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Bathrooms
                      </span>
                      <select
                        className="site-input"
                        value={specs.bathrooms}
                        onChange={(e) => handleSpecChange("bathrooms", e.target.value)}
                      >
                        {BATHROOM_OPTIONS.map((b) => (
                          <option key={b} value={b}>
                            {b} Bathroom{b !== "1" ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Furnishing Status
                      </span>
                      <select
                        className="site-input"
                        value={specs.furnishing}
                        onChange={(e) => handleSpecChange("furnishing", e.target.value)}
                      >
                        {FURNISHING_OPTIONS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Facing Direction
                      </span>
                      <select
                        className="site-input"
                        value={specs.facing}
                        onChange={(e) => handleSpecChange("facing", e.target.value)}
                      >
                        {FACING_OPTIONS.map((fc) => (
                          <option key={fc} value={fc}>
                            {fc}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Built-up Area (Sq.Ft)
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="site-input font-semibold text-navy"
                        value={specs.builtupArea}
                        onChange={(e) => handleSpecChange("builtupArea", e.target.value)}
                        placeholder="1200"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Car Parking
                      </span>
                      <select
                        className="site-input"
                        value={specs.parking}
                        onChange={(e) => handleSpecChange("parking", e.target.value)}
                      >
                        {CAR_PARKING_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Water Supply
                      </span>
                      <select
                        className="site-input"
                        value={specs.waterSource}
                        onChange={(e) => handleSpecChange("waterSource", e.target.value)}
                      >
                        {WATER_SOURCE_OPTIONS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Possession Status
                      </span>
                      <select
                        className="site-input"
                        value={specs.possession}
                        onChange={(e) => handleSpecChange("possession", e.target.value)}
                      >
                        {POSSESSION_OPTIONS.map((ps) => (
                          <option key={ps} value={ps}>
                            {ps}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Gated Community
                      </span>
                      <select
                        className="site-input"
                        value={specs.gatedCommunity}
                        onChange={(e) => handleSpecChange("gatedCommunity", e.target.value)}
                      >
                        <option value="Any">Any / No Preference</option>
                        <option value="Yes (Gated Community Required)">Yes (Gated Community)</option>
                        <option value="Individual / Standalone">Individual Property</option>
                      </select>
                    </label>

                    {requestCategory === "property_rent" && (
                      <label className="block">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Preferred Tenant
                        </span>
                        <select
                          className="site-input"
                          value={specs.tenantPreference}
                          onChange={(e) => handleSpecChange("tenantPreference", e.target.value)}
                        >
                          {TENANT_PREFERENCE_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}

                    {requestCategory === "property_rent" && (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Advance Budget
                        </span>
                        <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                          <div className="flex h-full items-center justify-center bg-slate-50 border-r border-slate-200 px-3 text-xs font-bold text-slate-600 shrink-0">
                            ₹
                          </div>
                          <input
                            type="number"
                            min="0"
                            className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                            value={specs.advanceDeposit}
                            onChange={(e) => handleSpecChange("advanceDeposit", e.target.value)}
                            placeholder="50,000"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* C. Plot / Land / Farmland / Agri Land Details */}
              {isPlotOrLand && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Plot / Land Area with Integrated Unit Dropdown */}
                    <div>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Plot / Land Area <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                        <input
                          type="number"
                          min="0"
                          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                          value={specs.plotArea}
                          onChange={(e) => handleSpecChange("plotArea", e.target.value)}
                          placeholder="1200"
                        />
                        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />
                        <select
                          className="w-24 shrink-0 bg-slate-50/80 hover:bg-slate-100 px-2 py-2 text-xs font-bold text-navy focus:outline-none cursor-pointer pr-6 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%2364748b\'%3e%3cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3e%3c/svg%3e')] bg-[length:1rem_1rem] bg-[right_0.35rem_center] bg-no-repeat transition"
                          value={specs.plotUnit}
                          onChange={(e) => handleSpecChange("plotUnit", e.target.value)}
                        >
                          {PLOT_UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Facing Direction */}
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Facing Direction
                      </span>
                      <select
                        className="site-input"
                        value={specs.facing}
                        onChange={(e) => handleSpecChange("facing", e.target.value)}
                      >
                        {FACING_OPTIONS.map((fc) => (
                          <option key={fc} value={fc}>
                            {fc}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Approval Preference */}
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Approval Preference
                      </span>
                      <select
                        className="site-input"
                        value={specs.approvals}
                        onChange={(e) => handleSpecChange("approvals", e.target.value)}
                      >
                        {APPROVAL_OPTIONS.map((appr) => (
                          <option key={appr} value={appr}>
                            {appr}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Road Width */}
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Road Width
                      </span>
                      <select
                        className="site-input"
                        value={specs.roadWidth}
                        onChange={(e) => handleSpecChange("roadWidth", e.target.value)}
                      >
                        {ROAD_WIDTH_OPTIONS.map((rw) => (
                          <option key={rw} value={rw}>
                            {rw}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Road Type */}
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Road Type
                      </span>
                      <select
                        className="site-input"
                        value={specs.roadType}
                        onChange={(e) => handleSpecChange("roadType", e.target.value)}
                      >
                        {ROAD_TYPE_OPTIONS.map((rt) => (
                          <option key={rt} value={rt}>
                            {rt}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Boundary / Fencing */}
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Boundary / Fencing
                      </span>
                      <select
                        className="site-input"
                        value={specs.fencing}
                        onChange={(e) => handleSpecChange("fencing", e.target.value)}
                      >
                        <option value="Compound Wall">Compound Wall</option>
                        <option value="Wire Fencing">Wire Fencing</option>
                        <option value="Open / Any">Open / Any</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* D. Commercial / Office / Warehouse / Rental Income Building */}
              {isCommercialOrWarehouse && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Space Type
                      </span>
                      <select
                        className="site-input"
                        value={specs.commercialType}
                        onChange={(e) => handleSpecChange("commercialType", e.target.value)}
                      >
                        {COMMERCIAL_SPACE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Floor Space (Sq.Ft)
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="site-input font-semibold text-navy"
                        value={specs.builtupArea}
                        onChange={(e) => handleSpecChange("builtupArea", e.target.value)}
                        placeholder="5000"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Clear Height (Feet)
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="site-input font-semibold text-navy"
                        value={specs.ceilingHeight}
                        onChange={(e) => handleSpecChange("ceilingHeight", e.target.value)}
                        placeholder="18"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Power Sanction
                      </span>
                      <select
                        className="site-input"
                        value={specs.powerLoad}
                        onChange={(e) => handleSpecChange("powerLoad", e.target.value)}
                      >
                        <option value="3-Phase Commercial">3-Phase Commercial</option>
                        <option value="HT Power Line">HT Power Line</option>
                        <option value="LT Power Line">LT Power Line</option>
                        <option value="10 HP to 25 HP">10 HP to 25 HP</option>
                        <option value="50 HP & Above">50 HP &amp; Above</option>
                        <option value="Standard Electricity">Standard Electricity</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Vehicle Access
                      </span>
                      <select
                        className="site-input"
                        value={specs.vehicleAccess}
                        onChange={(e) => handleSpecChange("vehicleAccess", e.target.value)}
                      >
                        {VEHICLE_ACCESS_OPTIONS.map((va) => (
                          <option key={va} value={va}>
                            {va}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Dedicated Parking
                      </span>
                      <select
                        className="site-input"
                        value={specs.parking}
                        onChange={(e) => handleSpecChange("parking", e.target.value)}
                      >
                        <option value="Dedicated 4-Wheeler & 2-Wheeler Parking">
                          4-Wheeler &amp; 2-Wheeler Parking
                        </option>
                        <option value="2-Wheeler Only">2-Wheeler Only</option>
                        <option value="Ample Open Parking">Ample Open Parking</option>
                        <option value="Any">Any / No Specific Preference</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* E. Loan Details */}
              {requestCategory === "loan" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Employment Profile
                      </span>
                      <select
                        className="site-input"
                        value={specs.employmentType}
                        onChange={(e) => handleSpecChange("employmentType", e.target.value)}
                      >
                        {EMPLOYMENT_TYPE_OPTIONS.map((emp) => (
                          <option key={emp} value={emp}>
                            {emp}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Monthly Income Range
                      </span>
                      <select
                        className="site-input"
                        value={specs.monthlyIncome}
                        onChange={(e) => handleSpecChange("monthlyIncome", e.target.value)}
                      >
                        {MONTHLY_INCOME_OPTIONS.map((inc) => (
                          <option key={inc} value={inc}>
                            {inc}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="sm:col-span-2">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Estimated Property Value
                      </span>
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                        <div className="flex h-full items-center justify-center bg-slate-50 border-r border-slate-200 px-3 text-xs font-bold text-slate-600 shrink-0">
                          ₹
                        </div>
                        <input
                          type="number"
                          min="0"
                          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                          value={specs.propertyValue}
                          onChange={(e) => handleSpecChange("propertyValue", e.target.value)}
                          placeholder="50,00,000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* F. Construction Details */}
              {requestCategory === "construction" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Plot Area with Integrated Unit Dropdown */}
                    <div>
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Land / Plot Size <span className="text-red-500">*</span>
                      </span>
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                        <input
                          type="number"
                          min="0"
                          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                          value={specs.plotArea}
                          onChange={(e) => handleSpecChange("plotArea", e.target.value)}
                          placeholder="1200"
                        />
                        <div className="h-5 w-[1px] bg-slate-200 shrink-0" />
                        <select
                          className="w-24 shrink-0 bg-slate-50/80 hover:bg-slate-100 px-2 py-2 text-xs font-bold text-navy focus:outline-none cursor-pointer pr-6 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%2364748b\'%3e%3cpath fill-rule=\'evenodd\' d=\'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z\' clip-rule=\'evenodd\'/%3e%3c/svg%3e')] bg-[length:1rem_1rem] bg-[right_0.35rem_center] bg-no-repeat transition"
                          value={specs.plotUnit}
                          onChange={(e) => handleSpecChange("plotUnit", e.target.value)}
                        >
                          {PLOT_UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Planned Built-up Area (Sq.Ft)
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="site-input font-semibold text-navy"
                        value={specs.builtupArea}
                        onChange={(e) => handleSpecChange("builtupArea", e.target.value)}
                        placeholder="2000"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Planned Floors
                      </span>
                      <select
                        className="site-input"
                        value={specs.floors}
                        onChange={(e) => handleSpecChange("floors", e.target.value)}
                      >
                        {CONSTRUCTION_FLOOR_OPTIONS.map((fl) => (
                          <option key={fl} value={fl}>
                            {fl}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Contract Preference
                      </span>
                      <select
                        className="site-input"
                        value={specs.contractType}
                        onChange={(e) => handleSpecChange("contractType", e.target.value)}
                      >
                        {CONSTRUCTION_CONTRACT_OPTIONS.map((cc) => (
                          <option key={cc} value={cc}>
                            {cc}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block sm:col-span-2 lg:col-span-1">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Start Timeline
                      </span>
                      <select
                        className="site-input"
                        value={specs.timeline}
                        onChange={(e) => handleSpecChange("timeline", e.target.value)}
                      >
                        {TIMELINE_OPTIONS.map((tl) => (
                          <option key={tl} value={tl}>
                            {tl}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* G. Interior Details */}
              {requestCategory === "interior" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Interior Scope
                      </span>
                      <select
                        className="site-input"
                        value={specs.interiorScope}
                        onChange={(e) => handleSpecChange("interiorScope", e.target.value)}
                      >
                        {INTERIOR_SCOPE_OPTIONS.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Property Size / BHK
                      </span>
                      <select
                        className="site-input"
                        value={specs.propertyConfig}
                        onChange={(e) => handleSpecChange("propertyConfig", e.target.value)}
                      >
                        <option value="1 BHK Flat/House">1 BHK Flat / House</option>
                        <option value="2 BHK Flat/House">2 BHK Flat / House</option>
                        <option value="3 BHK Flat/House">3 BHK Flat / House</option>
                        <option value="4 BHK / Duplex Villa">4 BHK / Duplex Villa</option>
                        <option value="Commercial Office Space">Commercial Office Space</option>
                        <option value="Independent Room / Kitchen Only">Modular Kitchen Only</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Design Style
                      </span>
                      <select
                        className="site-input"
                        value={specs.interiorStyle}
                        onChange={(e) => handleSpecChange("interiorStyle", e.target.value)}
                      >
                        {INTERIOR_STYLE_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Execution Timeline
                      </span>
                      <select
                        className="site-input"
                        value={specs.timeline}
                        onChange={(e) => handleSpecChange("timeline", e.target.value)}
                      >
                        {TIMELINE_OPTIONS.map((tl) => (
                          <option key={tl} value={tl}>
                            {tl}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* H. Property Management */}
              {requestCategory === "property_management" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Service Frequency
                      </span>
                      <select
                        className="site-input"
                        value={specs.managementFrequency}
                        onChange={(e) => handleSpecChange("managementFrequency", e.target.value)}
                      >
                        {MANAGEMENT_FREQUENCY_OPTIONS.map((mf) => (
                          <option key={mf} value={mf}>
                            {mf}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Property Type &amp; Size
                      </span>
                      <input
                        className="site-input font-semibold text-navy"
                        value={specs.propertyConfig}
                        onChange={(e) => handleSpecChange("propertyConfig", e.target.value)}
                        placeholder="e.g. 3BHK Villa or 2400 sq.ft Vacant Plot"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* I. Home & Office Services */}
              {requestCategory === "home_office_services" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Property / Space Size
                      </span>
                      <input
                        className="site-input font-semibold text-navy"
                        value={specs.propertyConfig}
                        onChange={(e) => handleSpecChange("propertyConfig", e.target.value)}
                        placeholder="e.g. 2 BHK House, 1500 sq.ft Office, 1 Sump"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Urgency / Preferred Date
                      </span>
                      <select
                        className="site-input"
                        value={specs.urgency}
                        onChange={(e) => handleSpecChange("urgency", e.target.value)}
                      >
                        <option value="Urgent (Today / Tomorrow)">Urgent (Today / Tomorrow)</option>
                        <option value="Within This Week">Within This Week</option>
                        <option value="Flexible / Upcoming Weekend">Flexible / Upcoming Weekend</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Budget & Pricing */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2.5">
                <CurrencyRupeeIcon className="h-4 w-4 text-orange" />
                <h2 className="text-sm sm:text-base font-bold font-sans tracking-tight text-navy">
                  3. Budget &amp; Price Range
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {currentOption.budgetMinLabel && (
                  <div>
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {currentOption.budgetMinLabel}
                    </span>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                      <div className="flex h-full items-center justify-center bg-slate-50 border-r border-slate-200 px-3 text-xs font-bold text-slate-600 shrink-0">
                        ₹
                      </div>
                      <input
                        type="number"
                        min="0"
                        className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                        value={form.budgetMin}
                        onChange={(e) => setForm((prev) => ({ ...prev, budgetMin: e.target.value }))}
                        placeholder="25,00,000 (Min)"
                      />
                    </div>
                  </div>
                )}

                <div className={currentOption.budgetMinLabel ? "" : "sm:col-span-2"}>
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {currentOption.budgetLabel || "Budget"}
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 transition-all h-[42px]">
                    <div className="flex h-full items-center justify-center bg-slate-50 border-r border-slate-200 px-3 text-xs font-bold text-slate-600 shrink-0">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-bold text-navy placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                      value={form.budget}
                      onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                      placeholder="45,00,000 (Max)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Additional Requirements */}
            <div className="space-y-1.5">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Additional Notes / Specific Preferences
                </span>
                <textarea
                  className="site-input min-h-[90px] text-sm"
                  value={form.additionalRequirements}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, additionalRequirements: e.target.value }))
                  }
                  placeholder={`Provide any other specific requirements regarding your ${categoryTitle.toLowerCase()} requirement in Hosur (e.g. landmark, timing, loan eligibility, specific amenities)...`}
                />
              </label>
            </div>

            {/* User Reassurance Card */}
            <div className="rounded-xl border border-slate-200 bg-surface p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
              <InformationCircleIcon className="h-4 w-4 text-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-navy">
                  Requesting as <span className="text-orange">{user?.name || "Verified User"}</span>
                </p>
                <p className="mt-0.5 text-slate-500">
                  Admin and verified property owners will use your registered contact info (
                  {user?.phone || user?.email || "Account Contact"}) to follow up directly.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="site-button-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-orange/20 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting Your Requirement...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Submit {categoryTitle} Requirement</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ServiceRequestPage;
