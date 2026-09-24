import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  FlagIcon,
  HandshakeIcon,
  HomeIcon,
  LandIcon,
  HomeModernIcon,
  PaintBrushIcon,
  RentIcon,
  ScaleIcon,
  UserGroupIcon,
  VillaIcon,
  WrenchScrewdriverIcon,
} from "../components/AppIcons";
import CountUpNumber from "../components/CountUpNumber";
import {
  buildServiceRequestPath,
  HOME_OFFICE_SERVICE_SHORTCUTS,
  PROPERTY_MANAGEMENT_SHORTCUTS,
} from "../constants/serviceCatalog";
import PropertyCard from "../components/PropertyCard";
import DotField from "../components/DotField";
import LocalityDropdown from "../components/LocalityDropdown";
import SeoHead from "../components/SeoHead";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
import { useAppLanguage } from "../context/LanguageContext";
import { localizeCatalogText } from "../utils/i18nCatalog";
import servicesHeroImage from "../assets/house.png";
import alluringRealityImg from "../assets/alluring reality.jpeg";
import chatGptBannerImage from "../assets/ChatGPT Image Aug 4, 2026, 10_37_17 AM.png";
import gyesLogo from "../assets/gyes property and constrcution logo.jpeg";
import oneClickLogo from "../assets/one click logo.png";
import { fetchHomeProperties } from "../services/api/propertyApi";
import { buildRealEstateAgentSchema, buildWebsiteSchema } from "../utils/seo";

import {
  PlotMulticolorIcon,
  VillaMulticolorIcon,
  VillaFlatMulticolorIcon,
  HouseMulticolorIcon,
  FlatMulticolorIcon,
  CommercialMulticolorIcon,
  FarmLandMulticolorIcon,
  AgricultureLandMulticolorIcon,
  BuyCategoryMulticolorIcon,
  SellCategoryMulticolorIcon,
  RentCategoryMulticolorIcon,
  LoanCategoryMulticolorIcon,
  ConstructionCategoryMulticolorIcon,
  InteriorCategoryMulticolorIcon,
  HomeOfficeServicesMulticolorIcon,
  PropertyManagementMulticolorIcon,
} from "../components/MulticolorIcons";

gsap.config({ nullTargetWarn: false });
gsap.registerPlugin(ScrollTrigger);


const propertyTypeOptions = [
  { label: "All types", labelKey: "search.allTypes", value: "" },
  { label: "Plot", labelKey: "shortcuts.items.plot", value: "Plot" },
  { label: "Villa / Flat", labelKey: "shortcuts.items.villaFlat", value: "Villa,Flat" },
  { label: "Independent House", labelKey: "shortcuts.items.independentHouse", value: "Independent House" },
  { label: "Commercial Land / Building", labelKey: "shortcuts.items.commercial", value: "Commercial Land,Commercial Building" },
  { label: "Farm Land", labelKey: "shortcuts.items.farmLand", value: "Farm Land" },
  { label: "Agricultural Land", labelKey: "shortcuts.items.agriculturalLand", value: "Agricultural Land" },
];

const propertyTypeIcons = {
  Plot: PlotMulticolorIcon,
  "Villa / Flat": VillaFlatMulticolorIcon,
  Villa: VillaMulticolorIcon,
  Flat: FlatMulticolorIcon,
  "Independent House": HouseMulticolorIcon,
  "Commercial Land / Building": CommercialMulticolorIcon,
  "Farm Land": FarmLandMulticolorIcon,
  "Agricultural Land": AgricultureLandMulticolorIcon,
};

const propertyTypeDescriptions = {
  Plot: ["Residential & commercial", "plots across Hosur"],
  "Villa / Flat": ["Gated villas & modern", "apartment residences"],
  Villa: ["Premium gated", "villa communities"],
  "Independent House": ["Spacious standalone", "homes with privacy"],
  Flat: ["Apartments in prime", "Hosur localities"],
  "Commercial Land / Building": ["Office, retail & commercial", "spaces & land"],
  "Farm Land": ["Farm land & agro", "plots with water sources"],
  "Agricultural Land": ["Farm & agricultural", "land listings"],
};

const shortcutGroups = [
  {
    key: "shortcuts.buy",
    label: "Buy",
    icon: BuyCategoryMulticolorIcon,
    items: [
      { label: "Plot", labelKey: "shortcuts.items.plot", to: "/listings?intent=buy&propertyType=Plot" },
      { label: "Villa / Flat", labelKey: "shortcuts.items.villaFlat", to: "/listings?intent=buy&propertyType=Villa,Flat" },
      { label: "Independent House", labelKey: "shortcuts.items.independentHouse", to: "/listings?intent=buy&propertyType=Independent House" },
      { label: "Commercial Land / Building", labelKey: "shortcuts.items.commercial", to: "/listings?intent=buy&propertyType=Commercial Land,Commercial Building" },
      { label: "Farm Land", labelKey: "shortcuts.items.farmLand", to: "/listings?intent=buy&propertyType=Farm Land" },
      { label: "Agricultural Land", labelKey: "shortcuts.items.agriculturalLand", to: "/listings?intent=buy&propertyType=Agricultural Land" },
    ],
  },
  {
    key: "shortcuts.sell",
    label: "Sell",
    icon: SellCategoryMulticolorIcon,
    items: [
      { label: "Posted Properties", labelKey: "shortcuts.items.postedProperties", to: "/listings?intent=buy" },
      { label: "List Property", labelKey: "shortcuts.items.listProperty", to: "/post-property" },
      { label: "Selling Support", labelKey: "shortcuts.items.sellingSupport", to: "/request-service?category=property_sell" },
    ],
  },
  {
    key: "shortcuts.rent",
    label: "Rent",
    icon: RentCategoryMulticolorIcon,
    items: [
      { label: "Home", labelKey: "shortcuts.items.home", to: "/listings?intent=rent&propertyType=Home" },
      { label: "Office", labelKey: "shortcuts.items.office", to: "/listings?intent=rent&propertyType=Office" },
      { label: "Apartment", labelKey: "shortcuts.items.apartment", to: "/listings?intent=rent&propertyType=Apartment" },
      { label: "Warehouse", labelKey: "shortcuts.items.warehouse", to: "/listings?intent=rent&propertyType=Warehouse" },
      { label: "Commercial Land & Building", labelKey: "shortcuts.items.commercialLandBuilding", to: "/listings?intent=rent&propertyType=Commercial Land & Building" },
      { label: "Empty Land", labelKey: "shortcuts.items.emptyLand", to: "/listings?intent=rent&propertyType=Empty Land" },
    ],
  },
  {
    key: "shortcuts.loan",
    label: "Loan",
    icon: LoanCategoryMulticolorIcon,
    items: [
      { label: "Home Loan", labelKey: "shortcuts.items.homeLoan", to: "/request-service?category=loan&type=Home%20Loan" },
      { label: "Plot Loan", labelKey: "shortcuts.items.plotLoan", to: "/request-service?category=loan&type=Plot%20Loan" },
      { label: "Mortgage Loan", labelKey: "shortcuts.items.mortgageLoan", to: "/request-service?category=loan&type=Mortgage%20Loan" },
      { label: "Private Finance", labelKey: "shortcuts.items.privateFinance", to: "/request-service?category=loan&type=Private%20Finance" },
    ],
  },
  {
    key: "shortcuts.construction",
    label: "Construction",
    icon: ConstructionCategoryMulticolorIcon,
    items: [
      { label: "House Construction", labelKey: "shortcuts.items.houseConstruction", to: "/request-service?category=construction&type=House Construction" },
      { label: "Office Construction", labelKey: "shortcuts.items.officeConstruction", to: "/request-service?category=construction&type=Office Construction" },
      { label: "Commercial Building", labelKey: "shortcuts.items.commercialBuilding", to: "/request-service?category=construction&type=Commercial Building" },
      { label: "Apartment", labelKey: "shortcuts.items.apartment", to: "/request-service?category=construction&type=Apartment" },
      { label: "Industry & Warehouse", labelKey: "shortcuts.items.industryWarehouse", to: "/request-service?category=construction&type=Industry & Warehouse" },
    ],
  },
  {
    key: "shortcuts.interior",
    label: "Interior",
    icon: InteriorCategoryMulticolorIcon,
    items: [
      { label: "Home Interior", labelKey: "shortcuts.items.homeInterior", to: "/request-service?category=interior&type=Home Interior" },
      { label: "Office Interior", labelKey: "shortcuts.items.officeInterior", to: "/request-service?category=interior&type=Office Interior" },
    ],
  },
  {
    key: "shortcuts.homeOffice",
    label: "Home & Office Services",
    icon: HomeOfficeServicesMulticolorIcon,
    items: HOME_OFFICE_SERVICE_SHORTCUTS.map((item) => ({
      label: item.label,
      to: buildServiceRequestPath(item),
    })),
  },
  {
    key: "shortcuts.propertyManagement",
    label: "Property Management Service",
    icon: PropertyManagementMulticolorIcon,
    items: PROPERTY_MANAGEMENT_SHORTCUTS.map((item) => ({
      label: item.label,
      to: buildServiceRequestPath(item),
    })),
  },
];

const propertyTypeConfigs = [
  { value: "Plot", iconKey: "Plot", titleKey: "home.propertyTypes.plot", desc1Key: "home.propertyTypes.plotDesc1", desc2Key: "home.propertyTypes.plotDesc2" },
  { value: "Villa,Flat", iconKey: "Villa / Flat", titleKey: "home.propertyTypes.villaFlat", desc1Key: "home.propertyTypes.villaFlatDesc1", desc2Key: "home.propertyTypes.villaFlatDesc2" },
  { value: "Villa", iconKey: "Villa", titleKey: "home.propertyTypes.villa", desc1Key: "home.propertyTypes.villaDesc1", desc2Key: "home.propertyTypes.villaDesc2" },
  { value: "Independent House", iconKey: "Independent House", titleKey: "home.propertyTypes.house", desc1Key: "home.propertyTypes.houseDesc1", desc2Key: "home.propertyTypes.houseDesc2" },
  { value: "Flat", iconKey: "Flat", titleKey: "home.propertyTypes.flat", desc1Key: "home.propertyTypes.flatDesc1", desc2Key: "home.propertyTypes.flatDesc2" },
  { value: "Commercial Land,Commercial Building", iconKey: "Commercial Land / Building", titleKey: "home.propertyTypes.commercial", desc1Key: "home.propertyTypes.commercialDesc1", desc2Key: "home.propertyTypes.commercialDesc2" },
  { value: "Farm Land", iconKey: "Farm Land", titleKey: "home.propertyTypes.farmLand", desc1Key: "home.propertyTypes.farmLandDesc1", desc2Key: "home.propertyTypes.farmLandDesc2" },
  { value: "Agricultural Land", iconKey: "Agricultural Land", titleKey: "home.propertyTypes.agriculture", desc1Key: "home.propertyTypes.agricultureDesc1", desc2Key: "home.propertyTypes.agricultureDesc2" },
];

/* Testimonial placeholder data */
const testimonialPlaceholders = [
  { id: 1, name: "Mr. Ramesh", role: "Property Buyer" },
  { id: 2, name: "Mrs. Priya", role: "Plot Owner" },
  { id: 3, name: "Mr. Karthik", role: "Home Buyer" },
];

const HomePage = () => {
  const { t, currentLanguage } = useAppLanguage();
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openShortcutMenu, setOpenShortcutMenu] = useState("");
  const [propertyTypeMenuOpen, setPropertyTypeMenuOpen] = useState(false);

  const homeStats = useMemo(() => [
    { value: 100, suffix: "+", label: t("home.stats.verifiedListings") || "Verified listings" },
    { value: 200, suffix: "+", label: t("home.stats.buyerEnquiries") || "Buyer enquiries" },
    { value: 50, suffix: "+", label: t("home.stats.localPartners") || "Local partners" },
  ], [t]);

  const servicePreview = useMemo(() => [
    {
      title: t("home.services.card1Title") || "Property Transactions Support",
      description: t("home.services.card1Desc") || "Buying, selling, rental guidance, and documentation support tailored for Hosur buyers and owners.",
      icon: BuyCategoryMulticolorIcon,
    },
    {
      title: t("home.services.card2Title") || "Legal & Registration Support",
      description: t("home.services.card2Desc") || "Agreement support, sale deed registration, patta transfer, and property legal coordination in one place.",
      icon: PropertyManagementMulticolorIcon,
    },
    {
      title: t("home.services.card3Title") || "Construction & Interior Support",
      description: t("home.services.card3Desc") || "Interior planning, construction services, electrical, plumbing, and trusted contractor support.",
      icon: ConstructionCategoryMulticolorIcon,
    },
  ], [t]);

  const showcaseItems = useMemo(() => [
    {
      title: t("home.showcase.sellTitle") || "Sell Property",
      description: t("home.showcase.sellDesc") || "Quick and verified sales",
      icon: SellCategoryMulticolorIcon,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
      to: "/post-property",
    },
    {
      title: t("home.showcase.rentTitle") || "Rent Property",
      description: t("home.showcase.rentDesc") || "Lease verified homes",
      icon: RentCategoryMulticolorIcon,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      to: "/listings?intent=rent",
    },
    {
      title: t("home.showcase.commercialTitle") || "Commercial",
      description: t("home.showcase.commercialDesc") || "Office & retail spaces",
      icon: CommercialMulticolorIcon,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      to: "/listings?intent=buy&propertyType=Commercial%20Land",
    },
    {
      title: t("home.showcase.landTitle") || "Land Sale",
      description: t("home.showcase.landDesc") || "Agricultural & residential land",
      icon: PlotMulticolorIcon,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      to: "/listings?intent=buy&propertyType=Plot",
    },
    {
      title: t("home.showcase.interiorTitle") || "Interior Design",
      description: t("home.showcase.interiorDesc") || "Customized interiors",
      icon: InteriorCategoryMulticolorIcon,
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
      to: "/request-service?category=interior",
    },
  ], [t]);

  const trustStats = useMemo(() => [
    { value: 500, suffix: "+", label: t("home.trustStats.happyClients") || "Happy Clients", icon: UserGroupIcon },
    { value: 150, suffix: "+", label: t("home.trustStats.propertiesListed") || "Properties Listed", icon: HomeIcon },
    { value: 50, suffix: "+", label: t("home.trustStats.trustedPartners") || "Trusted Partners", icon: CheckBadgeIcon },
    { value: 100, suffix: "%", label: t("home.trustStats.verifiedDeals") || "Verified Deals", icon: HandshakeIcon },
  ], [t]);
  const [localityDropdownOpen, setLocalityDropdownOpen] = useState(false);
  const homeRootRef = useRef(null);
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const shortcutBarRef = useRef(null);
  const propertyTypeMenuRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const showcaseTrackRef = useRef(null);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  // Tracks whether the user has actually interacted with the showcase carousel
  const showcaseInteractedRef = useRef(false);


  const [search, setSearch] = useState({
    intent: "buy",
    search: "",
    city: "",
    propertyType: "",
  });

  const [discoverTab, setDiscoverTab] = useState("Ongoing");

  const filteredDiscoverListings = useMemo(() => {
    let list = [];
    if (discoverTab === "Completed") {
      list = featured.filter((item) => item.isSold);
    } else if (discoverTab === "Upcoming") {
      list = featured.filter((item) => !item.isSold && (item.possessionStatus?.toLowerCase().includes("under") || item.possessionStatus?.toLowerCase().includes("upc") || item.possessionStatus?.toLowerCase().includes("soon") || item.possessionStatus?.toLowerCase().includes("construct")));
    } else {
      list = featured.filter((item) => !item.isSold);
    }
    if (list.length === 0) {
      list = featured.filter((item) => !item.isSold);
    }
    return list.slice(0, 4);
  }, [featured, discoverTab]);

  const debouncedSearch = useDebounce(search.search, 300);

  useEffect(() => {
    fetchHomeProperties()
      .then((res) => setFeatured(res.items || []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (shortcutBarRef.current && !shortcutBarRef.current.contains(event.target)) {
        setOpenShortcutMenu("");
      }
      if (propertyTypeMenuRef.current && !propertyTypeMenuRef.current.contains(event.target)) {
        setPropertyTypeMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenShortcutMenu("");
        setPropertyTypeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // GSAP animations — ultra-smooth, lightweight, and hardware-accelerated.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Smooth hero entrance
      gsap.fromTo(
        ".home-gsap-hero-item",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.05,
          delay: 0.05,
          force3D: true,
          overwrite: "auto",
        }
      );

      // 2. High-performance batch scroll trigger for sections
      ScrollTrigger.batch(".home-gsap-section", {
        start: "top 92%",
        once: true,
        interval: 0.05,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 16, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });

      // 3. High-performance batch scroll trigger for cards
      ScrollTrigger.batch(".home-gsap-card", {
        start: "top 92%",
        once: true,
        interval: 0.05,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 18, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.04,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });
    }, homeRootRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);


  // When featured properties load, recalculate ScrollTrigger positions
  // WITHOUT reverting/rebuilding the entire GSAP context (which would jump scroll)
  useEffect(() => {
    if (featured.length > 0) {
      // Small delay to let React render the new property cards first
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [featured.length]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.intent && search.intent !== "buy") params.set("intent", search.intent);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (search.city) params.set("city", search.city);
    if (search.propertyType) params.set("propertyType", search.propertyType);
    return params.toString();
  }, [debouncedSearch, search.city, search.intent, search.propertyType]);

  const selectedPropertyTypeLabel =
    (() => {
      const found = propertyTypeOptions.find((option) => option.value === search.propertyType);
      if (!found) return t("search.allTypes") || "All types";
      return found.labelKey ? (t(found.labelKey) || found.label) : found.label;
    })();
  const openShortcutGroup = shortcutGroups.find((group) => group.label === openShortcutMenu);

  const handlePostFreeProperty = () => {
    scrollToTop();
    if (isAuthenticated) {
      navigate("/post-property");
      return;
    }
    toast.success("Sign in to post your free property listing.");
    navigate("/auth", { state: { from: { pathname: "/post-property" } } });
  };

  const handleShortcutHover = (label) => {
    if (window.matchMedia("(min-width: 640px)").matches) {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }
      setOpenShortcutMenu(label);
    }
  };

  const handleShortcutLeave = () => {
    if (window.matchMedia("(min-width: 640px)").matches) {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
      leaveTimeoutRef.current = setTimeout(() => {
        setOpenShortcutMenu("");
      }, 300); // 300ms closing delay
    }
  };

  const maxShowcaseIndex = Math.max(0, showcaseItems.length - 1);

  const scrollShowcase = (direction) => {
    showcaseInteractedRef.current = true;
    setShowcaseIndex((current) => {
      const next = direction === "next"
        ? Math.min(current + 1, maxShowcaseIndex)
        : Math.max(current - 1, 0);
      return next;
    });
  };

  useEffect(() => {
    // Only run scrollIntoView after the user has interacted with the carousel,
    // never on initial mount — prevents scroll jump on page load/refresh.
    if (!showcaseInteractedRef.current) return;
    const track = showcaseTrackRef.current;
    if (!track) return;
    const card = track.children[showcaseIndex];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [showcaseIndex]);

  return (
    <main ref={homeRootRef} className="min-w-0 page-shell w-full overflow-hidden">
      <SeoHead
        title="Verified Property Listings in Hosur"
        description="Explore verified property listings, real-estate services, and professional local property support through My Hosur Property."
        keywords="Hosur property listings, verified property in Hosur, buy property Hosur, rent property Hosur, real estate services Hosur, Hosur Land, Land Hosur, Hosur Plots, Plot for Sale in Hosur, Hosur Plots for Sale, Land for Sale in Hosur, Property Listing Site in Hosur, Property Buying Platform in Hosur, Property Selling Platform in Hosur, Budget Friendly Lands in Hosur, Hosur Rental Property, Hosur Land Media, Hosur Duplex Villas, Hosur Commercial Property, Hosur Resale Plots, Hosur Resale House, Hosur Commercial Land"
        canonicalPath="/"
        schema={[buildWebsiteSchema(), buildRealEstateAgentSchema()]}
      />

      {/* ── HERO SECTION ── */}
      {/* NOTE: overflow is on the bg wrapper only, NOT on the section — so dropdowns can escape */}
      <section
        ref={heroRef}
        className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]"
        style={{ zIndex: 1 }}
      >
        {/* Background: white base with animated DotField pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-white border-b border-slate-200/60">
        <DotField
            dotRadius={2}
            dotSpacing={16}
            bulgeStrength={80}
            glowRadius={200}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="rgba(0, 66, 162, 0.22)"
            gradientTo="rgba(39, 79, 154, 0.12)"
            glowColor="rgba(0, 66, 162, 0.12)"
          />
        </div>

        <div ref={heroContentRef} className="relative mx-auto flex max-w-[1440px] flex-col items-center px-5 py-10 text-center will-change-transform sm:px-8 sm:py-14 lg:px-10 lg:py-16" style={{ zIndex: 20 }}>
          <p className="home-gsap-hero-item section-tag !text-navy">
            {t("nav.tagline") || "Verified real estate platform"}
          </p>
          <h1 className="home-gsap-hero-item hero-title mt-3 w-full max-w-4xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-navy break-words" style={{ lineHeight: 1.2 }}>
            {t("hero.homeTitlePrefix") || "Verified property listings in"}{" "}
            <span className="text-orange">{t("hero.homeTitleCity") || "Hosur"}</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {t("hero.subheading") ||
              "Find verified properties for sale and rent across Hosur. Search apartments, villas, plots, and houses with clearer tools and local support."}
          </p>

          {/* ── 1. SHORTCUT CATEGORY DROPDOWNS BAR (TOP LEVEL CATEGORY NAVIGATION) ── */}
          <div ref={shortcutBarRef} className="home-gsap-hero-item relative z-30 mt-6 flex flex-wrap justify-center gap-2.5 sm:gap-3 w-full max-w-5xl">
            {shortcutGroups.map((group) => {
              const CategoryIcon = group.icon;
              const groupLabel = t(group.key) || group.label;
              return (
                <div
                  key={group.label}
                  className="relative"
                  style={{ zIndex: openShortcutMenu === group.label ? 99999 : 10 }}
                  onMouseEnter={() => handleShortcutHover(group.label)}
                  onMouseLeave={handleShortcutLeave}
                >
                  <button
                    type="button"
                    onClick={() => setOpenShortcutMenu((current) => (current === group.label ? "" : group.label))}
                    className={`inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 shadow-sm ${
                      openShortcutMenu === group.label
                        ? "bg-navy text-white shadow-md scale-105"
                        : "bg-white border border-slate-200 text-navy hover:bg-slate-50 hover:border-slate-300 hover:shadow"
                    }`}
                  >
                    {CategoryIcon && <CategoryIcon className="h-6 w-6 flex-shrink-0" />}
                    <span>{groupLabel}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition duration-300 max-sm:!hidden sm:block ${openShortcutMenu === group.label ? "rotate-180" : ""}`} />
                  </button>

                  {/* Desktop dropdown */}
                  {openShortcutMenu === group.label && (
                    <motion.div
                      className="absolute left-0 top-full hidden pt-2 sm:block"
                      style={{ zIndex: 99999, minWidth: "320px" }}
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={() => handleShortcutHover(group.label)}
                      onMouseLeave={handleShortcutLeave}
                    >
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-2xl max-h-[60vh] overflow-y-auto">
                        {group.items.map((item) => {
                          const itemLabel = item.labelKey
                            ? t(item.labelKey) || item.label
                            : localizeCatalogText(item.label, currentLanguage);
                          const isLongShortcutLabel = itemLabel.length > 34;
                          return (
                            <Link
                              key={`${group.label}-${item.label}`}
                              to={item.to}
                              className="flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-2 text-left text-[15px] font-semibold leading-tight text-slate-800 transition duration-150 hover:bg-orange hover:text-white"
                              onClick={() => setOpenShortcutMenu("")}
                            >
                              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange" />
                              <span className={`min-w-0 flex-1 ${isLongShortcutLabel ? "whitespace-normal" : "whitespace-nowrap"}`}>{itemLabel}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Mobile expanded menu */}
            {openShortcutGroup && (
              <motion.div
                className="z-50 mt-2 w-full basis-full sm:hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mx-auto max-h-[260px] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 text-center shadow-lg">
                  {openShortcutGroup.items.map((item) => {
                    const itemLabel = item.labelKey
                      ? t(item.labelKey) || item.label
                      : localizeCatalogText(item.label, currentLanguage);
                    return (
                      <Link
                        key={`${openShortcutGroup.label}-${item.label}`}
                        to={item.to}
                        className="block rounded-lg px-4 py-3 text-sm font-semibold leading-5 text-slate-800 transition duration-150 hover:bg-orange hover:text-white"
                        onClick={() => setOpenShortcutMenu("")}
                      >
                        {itemLabel}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── 2. MAIN PROPERTY SEARCH CARD (CLEANLY POSITIONED BELOW CATEGORY BAR) ── */}
          <div className="home-gsap-hero-item relative z-20 mt-6 w-full max-w-5xl text-left">
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-300 sm:p-6 ${
                localityDropdownOpen ? "pb-[22rem] sm:pb-[26rem]" : ""
              }`}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-navy sm:text-sm">
                {t("search.searchPlaceholder") || "Search properties in Hosur"}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_auto] lg:items-stretch">
                <LocalityDropdown
                  value={search.search}
                  onChange={(value) => setSearch((prev) => ({ ...prev, search: value }))}
                  onOpenChange={setLocalityDropdownOpen}
                  onSelect={() => {
                    scrollToTop();
                    navigate(`/listings?${queryString || "intent=buy"}`);
                  }}
                />

                <select
                  value={search.intent}
                  onChange={(event) => setSearch((prev) => ({ ...prev, intent: event.target.value }))}
                  className="site-input min-h-[52px] w-full rounded-xl text-sm font-semibold border-slate-300 text-navy focus:border-navy"
                  aria-label="Listing intent"
                >
                  <option value="buy">{t("search.tabBuy") || "Buy"}</option>
                  <option value="rent">{t("search.tabRent") || "Rent"}</option>
                  <option value="new-project">{t("search.tabProjects") || "New Project"}</option>
                </select>

                {/* Property type custom dropdown */}
                <div ref={propertyTypeMenuRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setPropertyTypeMenuOpen((current) => !current)}
                    className="site-input flex min-h-[52px] w-full items-center justify-between rounded-xl border-slate-300 text-left text-sm font-semibold text-navy hover:border-navy"
                    aria-expanded={propertyTypeMenuOpen}
                    aria-haspopup="listbox"
                  >
                    <span className="truncate">{selectedPropertyTypeLabel}</span>
                    <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 transition ${propertyTypeMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {propertyTypeMenuOpen && (
                    <div
                      className="absolute left-0 right-0 top-full z-[99999] mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-2xl"
                      role="listbox"
                    >
                      {propertyTypeOptions.map((option) => {
                        const IconComponent = option.label && propertyTypeIcons[option.label];
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => {
                              setSearch((prev) => ({ ...prev, propertyType: option.value }));
                              setPropertyTypeMenuOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-navy hover:bg-orange/10 hover:text-orange transition"
                          >
                            <span className="flex items-center gap-2.5">
                              {IconComponent ? <IconComponent className="h-6 w-6 flex-shrink-0" /> : null}
                              <span>{option.labelKey ? (t(option.labelKey) || option.label) : option.label}</span>
                            </span>
                            {option.value === search.propertyType ? <CheckIcon className="h-4 w-4 text-orange" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    scrollToTop();
                    navigate(`/listings${queryString ? `?${queryString}` : ""}`);
                  }}
                  className="site-button-primary min-h-[52px] w-full rounded-xl px-8 text-sm font-bold shadow-md hover:shadow-lg transition lg:w-auto"
                >
                  {t("search.searchButton") || "Search"}
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. CTA BUTTONS ── */}
          <div className="home-gsap-hero-item mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center mx-auto">
            <motion.button
              type="button"
              onClick={handlePostFreeProperty}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative inline-flex min-h-[46px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange to-orange-600 px-7 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:shadow-2xl sm:w-auto overflow-hidden"
            >
              <div className="shine-effect" aria-hidden="true"></div>
              <FlagIcon className="wave-icon h-5 w-5 transition-transform duration-300 relative z-10" />
              <span className="relative z-10">{t("nav.postFreePropertyFull") || "Post your free property"}</span>
              <div className="boom-button absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-orange to-orange-600" />
            </motion.button>

            <button
              type="button"
              onClick={() => {
                scrollToTop();
                navigate(`/listings${queryString ? `?${queryString}` : ""}`);
              }}
              className="inline-flex items-center justify-center rounded-xl border-2 border-navy px-7 py-3 text-sm font-bold text-navy transition hover:bg-navy hover:text-white w-full sm:w-auto shadow-sm"
            >
              {t("hero.exploreProperties") || "Find Your Property"}
            </button>
            <Link
              to="/request-service?category=property_buy&type=Find%20your%20property"
              onClick={scrollToTop}
              className="inline-flex items-center justify-center rounded-xl border-2 border-orange bg-orange/10 px-7 py-3 text-sm font-bold text-orange hover:bg-orange hover:text-white transition duration-200 w-full sm:w-auto shadow-sm"
            >
              {t("services.requestService") || "Request for New Property"}
            </Link>
          </div>

          {/* ── 4. STATS COUNTERS ── */}
          <div className="home-gsap-hero-item mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 text-center sm:mt-10 sm:gap-6">
            {homeStats.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-bold text-navy sm:text-2xl lg:text-3xl">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-[11px] text-slate-500 sm:text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property Types ── */}
      <section
        className="home-property-types-section home-modern-section home-gsap-section px-5 py-14 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="home-property-types-intro">
            <p className="section-tag">{t("home.propertyTypes.tag") || "Property types"}</p>
            <h2 className="mt-3">{t("home.propertyTypes.title") || "Explore property categories in Hosur"}</h2>
            <p>{t("home.propertyTypes.subtitle") || "Browse verified listings across plots, villas, flats, and commercial properties."}</p>
          </div>

          <div className="home-property-types-grid">
            {propertyTypeConfigs.map((cfg) => {
              const Icon = propertyTypeIcons[cfg.iconKey] || BuildingOffice2Icon;
              const label = t(cfg.titleKey) || cfg.value;
              const desc1 = t(cfg.desc1Key) || "Residential & commercial";
              const desc2 = t(cfg.desc2Key) || "plots across Hosur";
              return (
                <Link
                  key={cfg.value}
                  to={`/listings?intent=buy&propertyType=${encodeURIComponent(cfg.value)}`}
                  className="home-gsap-card home-property-type-card group"
                >
                  <div className="home-type-icon">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="home-type-title">{label}</h3>
                  <p className="home-type-desc">
                    {desc1}
                    <br />
                    {desc2}
                  </p>
                  <span className="home-type-link">
                    {t("home.propertyTypes.browseListings") || "Browse listings"}
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Our Services ── */}
      <section
        className="home-modern-section home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] home-services-grid">
          <div className="text-left">
            <p className="section-tag">{t("home.services.tag") || "Our services"}</p>
            <h2 className="home-section-heading mt-3">{t("home.services.title") || "Complete property support for Hosur"}</h2>
            <p className="mt-4 max-w-sm text-slate-600">
              {t("home.services.description") ||
                "From buying and selling to legal registration and construction — we provide end-to-end property support tailored for Hosur."}
            </p>
            <Link
              to="/services"
              className="site-button-primary mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold"
            >
              {t("home.services.exploreAll") || "Explore all services"}
            </Link>
          </div>

          <div className="space-y-7">
            {servicePreview.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="home-gsap-card home-service-row"
                >
                  <div className="home-service-icon">
                    <Icon className="h-10 w-10 flex-shrink-0" />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <Link to="/services" className="home-service-link">
                      {t("services.learnMore") || "Learn more"}
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="home-services-image-wrap home-gsap-card">
            <img src={servicesHeroImage} alt="Modern villa property in Hosur" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ── Hosur Coverage & Localities Section ── */}
      <section
        className="home-gsap-section bg-white px-5 py-12 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">{t("home.coverage.tag") || "Hosur Coverage & Localities"}</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
            {t("home.coverage.title") || "Serving Every Prime Growth Corridor in"}{" "}
            <span className="text-orange">{t("home.coverage.titleCity") || "Hosur"}</span>
          </h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {t("home.coverage.description") ||
              "From Hosur Town & Attibele Road to Mathigiri, Begapalli, Kelamangalam, and Denkanikottai Road — we provide verified listings and complete service coverage across all major areas."}
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl home-gsap-card">
          <img
            src={chatGptBannerImage}
            alt="Hosur Locality Map & Service Coverage"
            className="w-full h-auto max-h-[420px] object-contain mx-auto block"
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ── Property Showcase carousel ── */}
      <section
        className="home-modern-section home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="home-showcase-header">
            <div>
              <p className="section-tag">{t("home.showcase.tag") || "Property Showcase"}</p>
              <h2 className="home-section-heading mt-3">{t("home.showcase.title") || "Services & Property Types"}</h2>
              <p className="home-gsap-copy mt-3 max-w-xl text-slate-600">
                {t("home.showcase.description") || "Explore the diverse range of properties and services we provide in Hosur"}
              </p>
            </div>
            <div className="home-showcase-nav">
              <button
                type="button"
                className="home-showcase-nav-btn"
                onClick={() => scrollShowcase("prev")}
                disabled={showcaseIndex === 0}
                aria-label="Previous showcase item"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="home-showcase-nav-btn"
                onClick={() => scrollShowcase("next")}
                disabled={showcaseIndex >= maxShowcaseIndex}
                aria-label="Next showcase item"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-10 overflow-hidden">
            <div ref={showcaseTrackRef} className="home-showcase-track">
              {showcaseItems.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.title}
                    to={service.to}
                    className="home-showcase-card home-gsap-card"
                    style={{ backgroundImage: `url(${service.image})` }}
                  >
                    <div className="home-showcase-card-content">
                      <div className="home-showcase-card-icon">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust stats bar ── */}
      <section
        className="home-modern-section home-gsap-section bg-white px-5 pb-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] home-trust-stats">
          {trustStats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="home-trust-stat home-gsap-card">
                <div className="home-trust-icon">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="home-trust-value">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="home-trust-label">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Featured Properties ── */}
      <section
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        {/* Adissia header layout */}
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 border-b border-slate-100 pb-4 mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-slate-300 pr-4">
              {t("home.featured.tag") || "FEATURED PROPERTIES"}
            </span>
            <span className="text-xs font-bold text-orange uppercase tracking-wider">
              {t("home.featured.subtag") || "HOSUR'S PREMIUM SELECTION"}
            </span>
          </div>
          <Link
            to="/listings"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-navy bg-white px-4 py-2 text-sm font-bold text-navy transition hover:border-orange hover:bg-orange hover:text-white"
          >
            <span>{t("home.featured.viewAll") || "View All Properties"}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 max-w-[1440px]">
          
          {/* Left Column: Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[400px]">
            {filteredDiscoverListings.map((item) => (
              <div key={item._id} className="home-gsap-card">
                <PropertyCard item={item} />
              </div>
            ))}
            {featuredLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-card">
                  <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
                  <div className="mt-4 h-5 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
                  <div className="mt-5 h-10 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            {!featuredLoading && filteredDiscoverListings.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center min-h-[360px]">
                <div className="rounded-full bg-white p-3.5 shadow-xs border border-slate-100 text-orange mb-3">
                  <BuildingOfficeIcon className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-navy">Verified Properties in Hosur</h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Explore verified plots, villas, and apartments directly on our listings catalog.
                </p>
                <Link
                  to="/listings"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange transition"
                >
                  Explore All Listings <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Discover Properties Sidebar */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-8 flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-sm">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-navy/5 via-transparent to-transparent rounded-tr-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-5xl sm:text-6xl font-black text-navy leading-tight tracking-tight">
                {t("home.featured.discoverTitle") || "Discover Properties"}
              </h2>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 mt-6 gap-6 text-sm font-semibold">
                {[
                  { key: "Ongoing", label: t("home.featured.tabOngoing") || "Ongoing" },
                  { key: "Upcoming", label: t("home.featured.tabUpcoming") || "Upcoming" },
                  { key: "Completed", label: t("home.featured.tabCompleted") || "Completed" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDiscoverTab(key)}
                    className={`pb-3 relative transition-colors duration-200 ${
                      discoverTab === key ? "text-navy" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {label}
                    {discoverTab === key && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Descriptions */}
              <p className="mt-6 text-sm leading-7 text-slate-600 font-medium">
                {discoverTab === "Ongoing" && (
                  t("home.featured.descOngoing") || "Explore active verified plots, villas, and apartments in Hosur's high-growth corridors."
                )}
                {discoverTab === "Upcoming" && (
                  t("home.featured.descUpcoming") || "Secure early-stage properties coming soon in Hosur's key expansion zones."
                )}
                {discoverTab === "Completed" && (
                  t("home.featured.descCompleted") || "Recently sold-out premium layouts and successful real estate listings."
                )}
              </p>
            </div>

            {/* CTA button */}
            <div className="mt-8 border-t border-slate-200/80 pt-6 relative z-10">
              <Link
                to="/listings"
                className="inline-flex items-center justify-between w-full bg-navy text-white hover:bg-orange px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md group"
              >
                <span>{t("home.featured.exploreAllListings") || "Explore All Listings"}</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">{t("home.partners.tag") || "Trusted partnerships"}</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{t("home.partners.title") || "Our Partners & Associated Businesses"}</h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {t("home.partners.subtitle") || "Working with industry leaders to provide comprehensive real estate, construction, and home service solutions across Hosur."}
          </p>
        </div>

        {/* Partner Brand Cards Display */}
        <div className="mx-auto mt-12 grid max-w-[1200px] grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card: Gyes Property & Construction */}
          <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition duration-200 hover:border-orange hover:shadow-md home-gsap-card">
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition duration-200 group-hover:bg-orange group-hover:text-white group-hover:shadow-xs">
              {t("home.partners.clickHere") || "Click Here ↗"}
            </span>
            <a
              href="https://gyesproperty.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2"
            >
              <img
                src={gyesLogo}
                alt="Gyes Property & Construction"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </a>
            <a
              href="https://gyesproperty.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 text-xs font-bold text-navy transition group-hover:text-orange"
            >
              {t("nav.companyName") || "Gyes Property & Construction"}
            </a>
          </div>

          {/* Card: Gyes Traders */}
          <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition duration-200 hover:border-orange hover:shadow-md home-gsap-card">
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition duration-200 group-hover:bg-orange group-hover:text-white group-hover:shadow-xs">
              {t("home.partners.clickHere") || "Click Here ↗"}
            </span>
            <a
              href="https://www.gyestraders.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2"
            >
              <img
                src={gyesLogo}
                alt="Gyes Traders"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </a>
            <a
              href="https://www.gyestraders.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 text-xs font-bold text-navy transition group-hover:text-orange"
            >
              Gyes Traders
            </a>
            <p className="mt-0.5 text-[11px] text-slate-500">{t("home.partners.tradingSupply") || "Trading & Supply"}</p>
          </div>

          {/* Card: OneClick */}
          <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition duration-200 hover:border-orange hover:shadow-md home-gsap-card">
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition duration-200 group-hover:bg-orange group-hover:text-white group-hover:shadow-xs">
              {t("home.partners.clickHere") || "Click Here ↗"}
            </span>
            <a
              href="https://oneclick2serve.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2"
            >
              <img
                src={oneClickLogo}
                alt="OneClick Office & Home Service"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </a>
            <a
              href="https://oneclick2serve.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 text-xs font-bold text-navy transition group-hover:text-orange"
            >
              OneClick
            </a>
            <p className="mt-0.5 text-[11px] text-slate-500">{t("home.partners.officeHomeServices") || "Office & Home Services"}</p>
          </div>

          {/* Card: Alluring Realty */}
          <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition duration-200 hover:border-orange hover:shadow-md home-gsap-card">
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 transition duration-200 group-hover:bg-orange group-hover:text-white group-hover:shadow-xs">
              {t("home.partners.clickHere") || "Click Here ↗"}
            </span>
            <a
              href="https://alluringrealty.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2"
            >
              <img
                src={alluringRealityImg}
                alt="Alluring Realty"
                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </a>
            <a
              href="https://alluringrealty.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 text-xs font-bold text-navy transition group-hover:text-orange"
            >
              Alluring Realty
            </a>
            <p className="mt-0.5 text-[11px] text-slate-500">{t("home.partners.realEstateConsulting") || "Real Estate Consulting"}</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        className="home-gsap-section bg-[#eef4fb] px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">{t("home.testimonials.tag") || "Testimonials"}</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
            {t("home.testimonials.title") || "Stories That Inspire"}{" "}
            <span className="text-orange">{t("home.testimonials.titleHighlight") || "Confidence"}</span> !!
          </h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            {t("home.testimonials.subtitle") || "Hear from our happy customers who found their perfect property through MyHosurProperty."}
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="mx-auto mt-12 max-w-[1440px]">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonialPlaceholders.map((item, idx) => (
              <div
                key={item.id}
                className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${idx === 1 ? "md:-translate-y-4 md:scale-105 ring-2 ring-navy/20" : ""}`}
              >
                {/* Play button area */}
                <div className="relative flex h-52 w-full items-center justify-center bg-gradient-to-br from-navy to-navy-light">
                  <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 400 200" className="h-full w-full" fill="white">
                      <rect x="50" y="60" width="60" height="140" />
                      <rect x="130" y="30" width="80" height="170" />
                      <rect x="230" y="50" width="70" height="150" />
                      <rect x="320" y="70" width="50" height="130" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    aria-label={`Play testimonial from ${item.name}`}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white text-white transition hover:bg-white hover:text-navy"
                  >
                    <svg className="h-7 w-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3 rounded-md bg-orange px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {item.name}
                  </div>
                </div>

                <div className="p-5 text-center w-full">
                  <p className="font-bold text-navy">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.role}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 italic">
                    "{t("home.testimonials.quote") || "An excellent experience. The team at MyHosurProperty guided us through the entire process."}"
                  </p>
                  <div className="mt-3 flex justify-center gap-1 text-orange">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="home-gsap-section bg-navy px-5 py-16 text-white sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-[1440px] gap-5 text-center lg:grid-cols-[1fr_auto] lg:items-center lg:text-left">
          <div>
            <p className="section-tag text-orange">{t("home.cta.tag") || "Need expert help"}</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{t("home.cta.title") || "Complete property support beyond listings."}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white sm:text-base">
              {t("home.cta.description") ||
                "From property search and loans to documentation, registration, construction, and local service coordination, our team helps you move with clarity."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/services" className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              {t("home.cta.exploreServices") || "Explore Services"}
            </Link>
            <Link to="/contact" className="site-button-primary rounded-lg px-6 py-3 text-sm font-bold">
              {t("home.cta.contactUs") || "Contact Us"}
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;
