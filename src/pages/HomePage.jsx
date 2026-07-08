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
import servicesHeroImage from "../assets/house.png";
import alluringRealityImg from "../assets/alluring reality.jpeg";
import { fetchHomeProperties } from "../services/api/propertyApi";
import { buildRealEstateAgentSchema, buildWebsiteSchema } from "../utils/seo";

gsap.config({ nullTargetWarn: false });
gsap.registerPlugin(ScrollTrigger);

const MotionSection = motion.section;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const propertyTypeOptions = [
  { label: "All types", value: "" },
  { label: "Plot", value: "Plot" },
  { label: "Villa", value: "Villa" },
  { label: "Independent House", value: "Independent House" },
  { label: "Flat", value: "Flat" },
  { label: "Commercial Land", value: "Commercial Land" },
  { label: "Agricultural Land", value: "Agricultural Land" },
];

const propertyTypeIcons = {
  Plot: LandIcon,
  Villa: VillaIcon,
  "Independent House": HomeModernIcon,
  Flat: BuildingOfficeIcon,
  "Commercial Land": BuildingOffice2Icon,
  "Agricultural Land": LandIcon,
};

const propertyTypeDescriptions = {
  Plot: ["Residential & commercial", "plots across Hosur"],
  Villa: ["Premium gated", "villa communities"],
  "Independent House": ["Spacious standalone", "homes with privacy"],
  Flat: ["Apartments in prime", "Hosur localities"],
  "Commercial Land": ["Office & retail", "commercial spaces"],
  "Agricultural Land": ["Farm & agricultural", "land listings"],
};

const shortcutGroups = [
  {
    label: "Buy",
    items: [
      { label: "Plot", to: "/listings?intent=buy&propertyType=Plot" },
      { label: "Villa", to: "/listings?intent=buy&propertyType=Villa" },
      { label: "Independent House", to: "/listings?intent=buy&propertyType=Independent House" },
      { label: "Flat", to: "/listings?intent=buy&propertyType=Flat" },
      { label: "Commercial Land", to: "/listings?intent=buy&propertyType=Commercial Land" },
      { label: "Agricultural Land", to: "/listings?intent=buy&propertyType=Agricultural Land" },
    ],
  },
  {
    label: "Sell",
    items: [
      { label: "Posted Properties", to: "/listings?intent=buy" },
      { label: "List Property", to: "/post-property" },
      { label: "Selling Support", to: "/request-service?category=property_sell" },
    ],
  },
  {
    label: "Rent",
    items: [
      { label: "Home", to: "/listings?intent=rent&propertyType=Home" },
      { label: "Office", to: "/listings?intent=rent&propertyType=Office" },
      { label: "Apartment", to: "/listings?intent=rent&propertyType=Apartment" },
      { label: "Warehouse", to: "/listings?intent=rent&propertyType=Warehouse" },
      { label: "Commercial Land & Building", to: "/listings?intent=rent&propertyType=Commercial Land & Building" },
      { label: "Empty Land", to: "/listings?intent=rent&propertyType=Empty Land" },
    ],
  },
  {
    label: "Loan",
    items: [
      { label: "Home Loan", to: "/request-service?category=loan&type=Home%20Loan" },
      { label: "Plot Loan", to: "/request-service?category=loan&type=Plot%20Loan" },
      { label: "Mortgage Loan", to: "/request-service?category=loan&type=Mortgage%20Loan" },
      { label: "Private Finance", to: "/request-service?category=loan&type=Private%20Finance" },
    ],
  },
  {
    label: "Construction",
    items: [
      { label: "House Construction", to: "/request-service?category=construction&type=House Construction" },
      { label: "Office Construction", to: "/request-service?category=construction&type=Office Construction" },
      { label: "Commercial Building", to: "/request-service?category=construction&type=Commercial Building" },
      { label: "Apartment", to: "/request-service?category=construction&type=Apartment" },
      { label: "Industry & Warehouse", to: "/request-service?category=construction&type=Industry & Warehouse" },
    ],
  },
  {
    label: "Interior",
    items: [
      { label: "Home Interior", to: "/request-service?category=interior&type=Home Interior" },
      { label: "Office Interior", to: "/request-service?category=interior&type=Office Interior" },
    ],
  },
  {
    label: "Home & Office Services",
    items: HOME_OFFICE_SERVICE_SHORTCUTS.map((item) => ({
      label: item.label,
      to: buildServiceRequestPath(item),
    })),
  },
  {
    label: "Property Management Service",
    items: PROPERTY_MANAGEMENT_SHORTCUTS.map((item) => ({
      label: item.label,
      to: buildServiceRequestPath(item),
    })),
  },
];

const homeStats = [
  { value: 2500, suffix: "+", label: "Verified listings" },
  { value: 1200, suffix: "+", label: "Buyer enquiries" },
  { value: 150, suffix: "+", label: "Local partners" },
];

const servicePreview = [
  {
    title: "Property Transactions Support",
    description: "Buying, selling, rental guidance, and documentation support tailored for Hosur buyers and owners.",
    icon: BuildingOffice2Icon,
  },
  {
    title: "Legal & Registration Support",
    description: "Agreement support, sale deed registration, patta transfer, and property legal coordination in one place.",
    icon: ScaleIcon,
  },
  {
    title: "Construction & Interior Support",
    description: "Interior planning, construction services, electrical, plumbing, and trusted contractor support.",
    icon: WrenchScrewdriverIcon,
  },
];

const showcaseItems = [
  {
    title: "Sell Property",
    description: "Quick and verified sales",
    icon: BanknotesIcon,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    to: "/post-property",
  },
  {
    title: "Rent Property",
    description: "Lease verified homes",
    icon: RentIcon,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    to: "/listings?intent=rent",
  },
  {
    title: "Commercial",
    description: "Office & retail spaces",
    icon: BuildingOffice2Icon,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    to: "/listings?intent=buy&propertyType=Commercial%20Land",
  },
  {
    title: "Land Sale",
    description: "Agricultural & residential land",
    icon: LandIcon,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    to: "/listings?intent=buy&propertyType=Plot",
  },
  {
    title: "Interior Design",
    description: "Customized interiors",
    icon: PaintBrushIcon,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    to: "/request-service?category=interior",
  },
];

const trustStats = [
  { value: 500, suffix: "+", label: "Happy Clients", icon: UserGroupIcon },
  { value: 150, suffix: "+", label: "Properties Sold", icon: HomeIcon },
  { value: 15, suffix: "+", label: "Years Experience", icon: CheckBadgeIcon },
  { value: 100, suffix: "%", label: "Satisfaction Rate", icon: HandshakeIcon },
];

/* Testimonial placeholder data */
const testimonialPlaceholders = [
  { id: 1, name: "Mr. Ramesh", role: "Property Buyer" },
  { id: 2, name: "Mrs. Priya", role: "Plot Owner" },
  { id: 3, name: "Mr. Karthik", role: "Home Buyer" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openShortcutMenu, setOpenShortcutMenu] = useState("");
  const [propertyTypeMenuOpen, setPropertyTypeMenuOpen] = useState(false);
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

  // GSAP animations — run ONCE on mount only.
  // Do NOT include featured.length here; that would revert + rebuild all
  // ScrollTriggers whenever the API response arrives, causing a scroll-position jump.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      gsap.from(".home-gsap-hero-item", {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.1,
      });

      if (heroBgRef.current && heroRef.current) {
        gsap.to(heroBgRef.current, {
          yPercent: 14,
          scale: 1.08,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (heroContentRef.current && heroRef.current) {
        gsap.to(heroContentRef.current, {
          yPercent: -7,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      gsap.utils.toArray(".home-gsap-section").forEach((section) => {
        gsap.from(section.querySelectorAll(".section-tag, h2, .home-gsap-copy"), {
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        });
      });

      gsap.utils.toArray(".home-gsap-card").forEach((card, index) => {
        gsap.from(card, {
          y: 34,
          scale: 0.97,
          duration: 0.65,
          delay: (index % 6) * 0.035,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true,
          },
        });
      });

      gsap.utils.toArray(".home-scroll-track").forEach((track) => {
        gsap.fromTo(
          track,
          { xPercent: 2 },
          {
            xPercent: -2,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      });

      gsap.utils.toArray(".home-parallax-soft").forEach((item) => {
        gsap.to(item, {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }, homeRootRef);

    return () => ctx.revert();
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
    if (search.intent) params.set("intent", search.intent);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (search.city) params.set("city", search.city);
    if (search.propertyType) params.set("propertyType", search.propertyType);
    return params.toString();
  }, [debouncedSearch, search.city, search.intent, search.propertyType]);

  const selectedPropertyTypeLabel =
    propertyTypeOptions.find((option) => option.value === search.propertyType)?.label || "All types";
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
    <main ref={homeRootRef} className="min-w-min page-shell w-full overflow-hidden">
      <SeoHead
        title="Verified Property Listings in Hosur"
        description="Explore verified property listings, real-estate services, and professional local property support through My Hosur Property."
        keywords="Hosur property listings, verified property in Hosur, buy property Hosur, rent property Hosur, real estate services Hosur"
        canonicalPath="/"
        schema={[buildWebsiteSchema(), buildRealEstateAgentSchema()]}
      />

      {/* ── HERO SECTION ── */}
      {/* NOTE: overflow is on the bg wrapper only, NOT on the section — so dropdowns can escape */}
      <MotionSection
        ref={heroRef}
        initial="hidden"
        animate="show"
        variants={reveal}
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

        {/* Shortcut dropdowns need z-index above the hero */}
        <div ref={heroContentRef} className="relative mx-auto flex max-w-[1440px] flex-col items-center px-5 py-12 text-center will-change-transform sm:px-8 sm:py-16 lg:px-10 lg:py-20" style={{ zIndex: 20 }}>
          <p className="home-gsap-hero-item section-tag !text-navy">Verified real estate platform</p>
          <h1 className="home-gsap-hero-item hero-title mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-navy">
            Verified property listings in <span className="text-orange">Hosur</span>
          </h1>

          <div className="home-gsap-hero-item mt-8 flex flex-col gap-6 w-full sm:mt-10">
            <p className="mx-auto text-sm leading-7 text-slate-600 sm:text-base">
              Find verified properties for sale and rent across Hosur. Search apartments, villas, plots, and houses with clearer tools and local support.
            </p>

            {/* ── Shortcut bar ── */}
            <div ref={shortcutBarRef} className="relative flex flex-wrap justify-center gap-2 sm:gap-2.5 lg:gap-3">
              {shortcutGroups.map((group) => (
                <div
                  key={group.label}
                  className="relative"
                  style={{ zIndex: openShortcutMenu === group.label ? 9999 : 10 }}
                  onMouseEnter={() => handleShortcutHover(group.label)}
                  onMouseLeave={handleShortcutLeave}
                >
                  <button
                    type="button"
                    onClick={() => setOpenShortcutMenu((current) => (current === group.label ? "" : group.label))}
                    className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ${
                      openShortcutMenu === group.label
                        ? "bg-navy text-white shadow-lg"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition duration-300 max-sm:!hidden sm:block ${openShortcutMenu === group.label ? "rotate-180" : ""}`} />
                  </button>

                  {/* Desktop dropdown */}
                  {openShortcutMenu === group.label && (
                    <motion.div
                      className="absolute left-0 top-full hidden pt-2 sm:block"
                      style={{ zIndex: 9999, minWidth: "220px" }}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl max-h-[60vh] overflow-y-auto">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.label}-${item.label}`}
                            to={item.to}
                            className="block rounded-lg px-4 py-2.5 text-sm font-medium text-navy transition duration-150 hover:bg-orange/5 hover:text-orange"
                            onClick={() => setOpenShortcutMenu("")}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}

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
                    {openShortcutGroup.items.map((item) => (
                      <Link
                        key={`${openShortcutGroup.label}-${item.label}`}
                        to={item.to}
                        className="block rounded-lg px-4 py-3 text-sm font-semibold leading-5 text-navy transition duration-150 hover:bg-orange/5 hover:text-orange"
                        onClick={() => setOpenShortcutMenu("")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="home-gsap-hero-item mt-4 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center mx-auto">
              <motion.button
                type="button"
                onClick={handlePostFreeProperty}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition duration-200 hover:shadow-2xl sm:w-auto overflow-hidden"
              >
                <style>{`
                  @keyframes boom {
                    0% { box-shadow: 0 0 0 0 rgba(255, 127, 14, 0.7); transform: scale(1); }
                    50% { box-shadow: 0 0 0 10px rgba(255, 127, 14, 0.4); }
                    100% { box-shadow: 0 0 0 20px rgba(255, 127, 14, 0); transform: scale(1); }
                  }
                  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                  @keyframes wave { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.08); } }
                  @keyframes shine { 0% { left: -100%; } 100% { left: 100%; } }
                  .boom-button { animation: boom 2s infinite, blink 1.5s ease-in-out infinite; }
                  .group:hover .wave-icon { animation: wave 0.5s ease-in-out infinite; }
                  .shine-effect { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shine 1.2s infinite; }
                `}</style>
                <div className="shine-effect"></div>
                <FlagIcon className="wave-icon h-5 w-5 transition-transform duration-300 relative z-10" />
                <span className="relative z-10">Post your free property</span>
                <div className="boom-button absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-orange to-orange-600" />
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  scrollToTop();
                  navigate(`/listings?${queryString || "intent=buy"}`);
                }}
                className="inline-flex items-center justify-center rounded-lg border-2 border-navy px-8 py-2.5 text-sm font-bold text-navy transition hover:bg-navy/5 w-full sm:w-auto"
              >
                Find Your Property
              </button>
            </div>
          </div>

          <div className="home-gsap-hero-item mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 text-center sm:mt-10 sm:gap-6">
            {homeStats.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-bold text-navy sm:text-2xl lg:text-3xl">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* ── Search bar section ── */}
      <section className="home-gsap-section relative bg-white px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-[1440px] space-y-5">
          <div
            className={`home-gsap-card rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition-[padding] duration-200 sm:p-7 ${
              localityDropdownOpen ? "lg:pb-[30rem]" : ""
            }`}
          >
            <p className="mb-5 text-center text-base font-semibold text-navy sm:text-left">Search properties in Hosur</p>
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
                className="site-input min-h-[52px] w-full rounded-xl text-sm"
                aria-label="Listing intent"
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
                <option value="new-project">New Project</option>
              </select>

              {/* Property type custom dropdown */}
              <div ref={propertyTypeMenuRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => setPropertyTypeMenuOpen((current) => !current)}
                  className="site-input flex min-h-[52px] w-full items-center justify-between rounded-xl text-left text-sm font-semibold"
                  aria-expanded={propertyTypeMenuOpen}
                  aria-haspopup="listbox"
                >
                  <span className="truncate">{selectedPropertyTypeLabel}</span>
                  <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 transition ${propertyTypeMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {propertyTypeMenuOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    role="listbox"
                  >
                    {propertyTypeOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setSearch((prev) => ({ ...prev, propertyType: option.value }));
                          setPropertyTypeMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-navy hover:bg-surface"
                      >
                        {option.label}
                        {option.value === search.propertyType ? <CheckIcon className="h-4 w-4 text-orange" /> : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  scrollToTop();
                  navigate(`/listings?${queryString || "intent=buy"}`);
                }}
                className="site-button-primary min-h-[52px] w-full rounded-xl px-8 text-sm font-bold lg:w-auto"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Property Types ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="home-property-types-section home-modern-section home-gsap-section px-5 py-14 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="home-property-types-intro">
            <p className="section-tag">Property types</p>
            <h2 className="mt-3">Explore property categories in Hosur</h2>
            <p>Browse verified listings across plots, villas, flats, and commercial properties.</p>
          </div>

          <div className="home-property-types-grid">
            {propertyTypeOptions
              .filter((option) => option.value)
              .map((option) => {
                const Icon = propertyTypeIcons[option.value] || BuildingOffice2Icon;
                const desc = propertyTypeDescriptions[option.value] || ["Browse verified", "listings in Hosur"];
                return (
                  <Link
                    key={option.value}
                    to={`/listings?intent=buy&propertyType=${encodeURIComponent(option.value)}`}
                    className="home-gsap-card home-property-type-card group"
                  >
                    <div className="home-type-icon">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="home-type-title">{option.label}</h3>
                    <p className="home-type-desc">
                      {desc[0]}
                      <br />
                      {desc[1]}
                    </p>
                    <span className="home-type-link">
                      Browse listings
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
      </MotionSection>

      {/* ── Our Services ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={reveal}
        className="home-modern-section home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] home-services-grid">
          <div className="text-left">
            <p className="section-tag">Our services</p>
            <h2 className="home-section-heading mt-3">Complete property support for Hosur</h2>
            <p className="mt-4 max-w-sm text-slate-600">
              From buying and selling to legal registration and construction — we provide end-to-end property support tailored for Hosur.
            </p>
            <Link
              to="/services"
              className="site-button-primary mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold"
            >
              Explore all services
            </Link>
          </div>

          <div className="space-y-7">
            {servicePreview.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.01 }}
                  className="home-gsap-card home-service-row"
                >
                  <div className="home-service-icon">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <Link to="/services" className="home-service-link">
                      Learn more
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="home-services-image-wrap home-gsap-card">
            <img src={servicesHeroImage} alt="Modern villa property in Hosur" loading="lazy" />
          </div>
        </div>
      </MotionSection>

      {/* ── Property Showcase carousel ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="home-modern-section home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="home-showcase-header">
            <div>
              <p className="section-tag">Property Showcase</p>
              <h2 className="home-section-heading mt-3">Services &amp; Property Types</h2>
              <p className="home-gsap-copy mt-3 max-w-xl text-slate-600">
                Explore the diverse range of properties and services we provide in Hosur
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
      </MotionSection>

      {/* ── Trust stats bar ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
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
      </MotionSection>

      {/* ── Featured Properties ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={reveal}
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        {/* Adissia header layout */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 border-b border-slate-100 pb-4 mb-10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-slate-300 pr-4">FEATURED PROPERTIES</span>
          <span className="text-xs font-bold text-orange uppercase tracking-wider">HOSUR'S PREMIUM SELECTION</span>
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
          </div>

          {/* Right Column: Discover Properties Sidebar */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-8 flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-sm">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange/10 via-transparent to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-navy/5 via-transparent to-transparent rounded-tr-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-5xl sm:text-6xl font-black text-navy leading-tight tracking-tight">
                Discover Properties
              </h2>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 mt-6 gap-6 text-sm font-semibold">
                {["Ongoing", "Upcoming", "Completed"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDiscoverTab(tab)}
                    className={`pb-3 relative transition-colors duration-200 ${
                      discoverTab === tab ? "text-navy" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                    {discoverTab === tab && (
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
                  "Explore active verified plots, villas, and apartments in Hosur's high-growth corridors."
                )}
                {discoverTab === "Upcoming" && (
                  "Secure early-stage properties coming soon in Hosur's key expansion zones."
                )}
                {discoverTab === "Completed" && (
                  "Recently sold-out premium layouts and successful real estate listings."
                )}
              </p>
            </div>

            {/* CTA button */}
            <div className="mt-8 border-t border-slate-200/80 pt-6 relative z-10">
              <Link
                to="/listings"
                className="inline-flex items-center justify-between w-full bg-navy text-white hover:bg-orange px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md group"
              >
                <span>Explore All Listings</span>
                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* ── Partners ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Trusted partnerships</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Our Partners</h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Working with industry leaders to provide comprehensive real estate solutions
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[1440px]">
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes scroll-partners { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .partners-scroll { display: flex; gap: 2rem; animation: scroll-partners 30s linear infinite; width: max-content; will-change: transform; }
              .partner-item { flex-shrink: 0; width: 200px; height: 120px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ffffff 0%, #eef5f4 100%); border: 2px solid #cfdcde; border-radius: 12px; transition: all 0.3s ease; cursor: pointer; box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08); user-select: none; }
              .partner-item:hover { border-color: #FF9914; background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%); transform: translateY(-4px); box-shadow: 0 8px 16px rgba(255, 153, 20, 0.15); }
              .gradient-fade { pointer-events: none; user-select: none; }
              .gradient-fade-left { position: absolute; left: 0; top: 0; bottom: 0; width: 80px; background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)); z-index: 10; pointer-events: none; }
              .gradient-fade-right { position: absolute; right: 0; top: 0; bottom: 0; width: 80px; background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)); z-index: 10; pointer-events: none; }
            `}</style>

            <div className="gradient-fade gradient-fade-left"></div>
            <div className="overflow-hidden pointer-events-none">
              <div className="home-scroll-track partners-scroll pointer-events-auto">
                {[
                  { name: "Gyes property & construction", logo: "Gyes P&C" },
                  { name: "Gyes traders", logo: "Gyes Traders" },
                  { name: "OneClick office & Home service", logo: "One Click" },
                  { name: "Alluring Realty", logo: "Alluring", image: alluringRealityImg },
                  { name: "Hareesh Enterprises (Document writer)", logo: "Hareesh" },
                  { name: "Gyes property & construction", logo: "Gyes P&C" },
                  { name: "Gyes traders", logo: "Gyes Traders" },
                  { name: "OneClick office & Home service", logo: "One Click" },
                  { name: "Alluring Realty", logo: "Alluring", image: alluringRealityImg },
                  { name: "Hareesh Enterprises (Document writer)", logo: "Hareesh" },
                ].map((partner, index) => (
                  <div key={index} className="partner-item group">
                    {partner.image ? (
                      <div className="flex flex-col items-center justify-center p-2">
                        <img 
                          src={partner.image} 
                          alt={partner.name} 
                          className="max-h-[70px] max-w-[170px] object-contain group-hover:scale-105 transition-transform duration-300 rounded"
                        />
                        <p className="mt-1 text-[10px] font-bold text-slate-500 group-hover:text-orange transition text-center">{partner.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-lg font-bold text-navy">{partner.logo}</p>
                        <p className="mt-1 text-xs text-slate-600 group-hover:text-orange transition">{partner.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="gradient-fade gradient-fade-right"></div>
          </div>
        </div>
      </MotionSection>

      {/* ── TESTIMONIALS placeholder ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={reveal}
        className="home-gsap-section bg-[#eef4fb] px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
            Stories That Inspire{" "}
            <span className="text-orange">Confidence</span> !!
          </h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Hear from our happy customers who found their perfect property through MyHosurProperty.
          </p>
        </div>

        {/* Testimonial cards — placeholder layout matching reference carousel style */}
        <div className="mx-auto mt-12 max-w-[1440px]">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonialPlaceholders.map((t, idx) => (
              <div
                key={t.id}
                className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${idx === 1 ? "md:-translate-y-4 md:scale-105 ring-2 ring-navy/20" : ""}`}
              >
                {/* Play button area */}
                <div className="relative flex h-52 w-full items-center justify-center bg-gradient-to-br from-navy to-navy-light">
                  {/* Decorative building silhouette */}
                  <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 400 200" className="h-full w-full" fill="white">
                      <rect x="50" y="60" width="60" height="140" />
                      <rect x="130" y="30" width="80" height="170" />
                      <rect x="230" y="50" width="70" height="150" />
                      <rect x="320" y="70" width="50" height="130" />
                    </svg>
                  </div>
                  {/* Play button */}
                  <button
                    type="button"
                    aria-label={`Play testimonial from ${t.name}`}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white text-white transition hover:bg-white hover:text-navy"
                  >
                    <svg className="h-7 w-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  {/* Customer badge */}
                  <div className="absolute bottom-3 left-3 rounded-md bg-orange px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {t.name}
                  </div>
                </div>

                <div className="p-5 text-center w-full">
                  <p className="font-bold text-navy">{t.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{t.role}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 italic">
                    "An excellent experience. The team at MyHosurProperty guided us through the entire process."
                  </p>
                  {/* Stars */}
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
          <div className="mt-8 flex justify-center gap-3">
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-navy hover:text-navy" aria-label="Previous testimonial">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-navy hover:text-navy" aria-label="Next testimonial">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </MotionSection>

      {/* ── CTA Banner ── */}
      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="home-gsap-section bg-navy px-5 py-16 text-white sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-[1440px] gap-5 text-center lg:grid-cols-[1fr_auto] lg:items-center lg:text-left">
          <div>
            <p className="section-tag text-orange">Need expert help</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Complete property support beyond listings.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white sm:text-base">
              From property search and loans to documentation, registration, construction, and local service coordination, our team helps you move with clarity.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/services" className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Explore Services
            </Link>
            <Link to="/contact" className="site-button-primary rounded-lg px-6 py-3 text-sm font-bold">
              Contact Us
            </Link>
          </div>
        </div>
      </MotionSection>
    </main>
  );
};

export default HomePage;
