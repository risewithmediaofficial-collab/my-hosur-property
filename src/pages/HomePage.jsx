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
  CheckIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  FlagIcon,
  LandIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  RentIcon,
  ScaleIcon,
  VillaIcon,
  WrenchScrewdriverIcon,
} from "../components/AppIcons";
import CountUpNumber from "../components/CountUpNumber";
import PropertyCard from "../components/PropertyCard";
import SeoHead from "../components/SeoHead";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
const HERO_BG =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80";
import { fetchHomeProperties } from "../services/api/propertyApi";
import { buildRealEstateAgentSchema, buildWebsiteSchema } from "../utils/seo";

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
    label: "Interior",
    items: [
      { label: "Home Interior", to: "/request-service?category=interior&type=Home Interior" },
      { label: "Office Interior", to: "/request-service?category=interior&type=Office Interior" },
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
    label: "Management",
    items: [
      { label: "Home Management", to: "/request-service?category=management&type=Home Management" },
      { label: "Office Management", to: "/request-service?category=management&type=Office Management" },
      { label: "Property Management", to: "/request-service?category=management&type=Property Management" },
    ],
  },
];

const homeStats = [
  { value: 2500, suffix: "+", label: "Verified listings" },
  { value: 1200, suffix: "+", label: "Buyer enquiries" },
  { value: 150, suffix: "+", label: "Local partners" },
];

const servicePreview = [
  {
    title: "Property Transactions",
    description: "Buying, selling, rental guidance, and documentation support tailored for Hosur buyers and owners.",
    icon: BuildingOffice2Icon,
  },
  {
    title: "Legal & Registration",
    description: "Agreement support, sale deed registration, patta transfer, and property legal coordination in one place.",
    icon: ScaleIcon,
  },
  {
    title: "Construction & Support",
    description: "Interior planning, construction services, electrical, plumbing, and trusted contractor support.",
    icon: WrenchScrewdriverIcon,
  },
];

const showcaseItems = [
  { title: "Buy Property", description: "Find your dream home", icon: HomeModernIcon },
  { title: "Sell Property", description: "Quick and verified sales", icon: BanknotesIcon },
  { title: "Rent Property", description: "Lease verified homes", icon: RentIcon },
  { title: "Commercial", description: "Office & retail spaces", icon: BuildingOffice2Icon },
  { title: "Land Sale", description: "Agricultural & residential land", icon: LandIcon },
  { title: "Interior Design", description: "Customized interiors", icon: PaintBrushIcon },
  { title: "Construction", description: "Build your project", icon: WrenchScrewdriverIcon },
  { title: "Legal Support", description: "Documentation assistance", icon: DocumentTextIcon },
];

const HomePage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openShortcutMenu, setOpenShortcutMenu] = useState("");
  const [propertyTypeMenuOpen, setPropertyTypeMenuOpen] = useState(false);
  const homeRootRef = useRef(null);
  const heroRef = useRef(null);
  const heroBgRef = useRef(null);
  const heroContentRef = useRef(null);
  const shortcutBarRef = useRef(null);
  const propertyTypeMenuRef = useRef(null);

  const [search, setSearch] = useState({
    intent: "buy",
    search: "",
    city: "",
    propertyType: "",
  });

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
  }, [featured.length]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.intent) params.set("intent", search.intent);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (search.city) params.set("city", search.city);
    if (search.propertyType) params.set("propertyType", search.propertyType);
    return params.toString();
  }, [debouncedSearch, search.city, search.intent, search.propertyType]);

  const featuredListings = featured.slice(0, 4);
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
      setOpenShortcutMenu(label);
    }
  };

  const handleShortcutLeave = () => {
    if (window.matchMedia("(min-width: 640px)").matches) {
      setOpenShortcutMenu("");
    }
  };

  return (
    <main ref={homeRootRef} className="page-shell w-full overflow-hidden">
      <SeoHead
        title="Verified Property Listings in Hosur"
        description="Explore verified property listings, real-estate services, and professional local property support through My Hosur Property."
        keywords="Hosur property listings, verified property in Hosur, buy property Hosur, rent property Hosur, real estate services Hosur"
        canonicalPath="/"
        schema={[buildWebsiteSchema(), buildRealEstateAgentSchema()]}
      />

      <MotionSection
        ref={heroRef}
        initial="hidden"
        animate="show"
        variants={reveal}
        className="relative min-h-[380px] overflow-hidden sm:min-h-[460px] lg:min-h-[500px]"
      >
        <div
          ref={heroBgRef}
          className="absolute -inset-y-16 inset-x-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-navy/75" />

        <div ref={heroContentRef} className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-5 py-12 text-center will-change-transform sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <p className="home-gsap-hero-item section-tag !text-orange">Verified real estate platform</p>
          <h1 className="home-gsap-hero-item hero-title mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Verified property listings in <span className="text-orange">Hosur</span>
          </h1>
          
          <div className="home-gsap-hero-item mt-8 flex flex-col gap-6 w-full sm:mt-10">
            <p className="mx-auto text-sm leading-7 text-white/85 sm:text-base">
              Find verified properties for sale and rent across Hosur. Search apartments, villas, plots, and houses with clearer tools and local support.
            </p>
            
            <div ref={shortcutBarRef} className="relative flex flex-wrap justify-center gap-2 sm:gap-2.5 lg:gap-3">
              {shortcutGroups.map((group) => (
                <div
                  key={group.label}
                  className={`relative ${openShortcutMenu === group.label ? "z-50" : "z-10"}`}
                  onMouseEnter={() => handleShortcutHover(group.label)}
                  onMouseLeave={handleShortcutLeave}
                >
                  <button
                    type="button"
                    onClick={() => setOpenShortcutMenu((current) => (current === group.label ? "" : group.label))}
                    className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 ${
                      openShortcutMenu === group.label
                        ? "bg-white text-navy shadow-lg"
                        : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:shadow-md border border-white/30"
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition duration-300 max-sm:!hidden sm:block ${openShortcutMenu === group.label ? "rotate-180" : ""}`} />
                  </button>
                  {openShortcutMenu === group.label ? (
                    <motion.div
                      className="absolute left-0 top-full z-50 hidden min-w-[220px] pt-2 sm:block"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
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
                  ) : null}
                </div>
              ))}
              {openShortcutGroup ? (
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
              ) : null}
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
                    0% {
                      box-shadow: 0 0 0 0 rgba(255, 127, 14, 0.7);
                      transform: scale(1);
                    }
                    50% {
                      box-shadow: 0 0 0 10px rgba(255, 127, 14, 0.4);
                    }
                    100% {
                      box-shadow: 0 0 0 20px rgba(255, 127, 14, 0);
                      transform: scale(1);
                    }
                  }
                  
                  @keyframes blink {
                    0%, 100% {
                      opacity: 1;
                    }
                    50% {
                      opacity: 0.7;
                    }
                  }
                  
                  @keyframes wave {
                    0%, 100% { transform: scaleX(1); }
                    50% { transform: scaleX(1.08); }
                  }
                  
                  @keyframes shine {
                    0% {
                      left: -100%;
                    }
                    100% {
                      left: 100%;
                    }
                  }
                  
                  .boom-button {
                    animation: boom 2s infinite, blink 1.5s ease-in-out infinite;
                  }
                  
                  .group:hover .wave-icon {
                    animation: wave 0.5s ease-in-out infinite;
                  }
                  
                  .shine-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shine 1.2s infinite;
                  }
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
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 w-full sm:w-auto"
              >
                Find Your Property
              </button>
            </div>
          </div>

          <div className="home-gsap-hero-item mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 text-center sm:mt-10 sm:gap-6">
            {homeStats.map((item) => (
              <div key={item.label}>
                <p className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-[11px] text-white sm:text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <section className="home-gsap-section relative bg-gradient-to-b from-slate-50 to-white px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-[1440px] space-y-5">
          <div className="home-gsap-card rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-7">
            <p className="mb-5 text-center text-base font-semibold text-navy sm:text-left">Search properties in Hosur</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_auto] lg:items-stretch">
              <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20 sm:col-span-2 lg:col-span-1">
                <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-orange" />
                <input
                  value={search.search}
                  onChange={(event) => setSearch((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Search locality, project, or property name"
                  className="min-w-0 w-full bg-transparent text-sm font-medium text-navy outline-none placeholder:text-slate-400"
                />
              </div>

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
                {propertyTypeMenuOpen ? (
                  <div
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card"
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
                ) : null}
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

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Property types</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Explore property categories in Hosur</h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-[1440px] grid-cols-2 gap-4 sm:mt-10 md:grid-cols-3 lg:grid-cols-6">
          {propertyTypeOptions
            .filter((option) => option.value)
            .map((option) => {
              const Icon = propertyTypeIcons[option.value] || BuildingOffice2Icon;
              return (
                <Link
                  key={option.value}
                  to={`/listings?intent=buy&propertyType=${encodeURIComponent(option.value)}`}
                  className="home-gsap-card property-type-card flex flex-col items-center p-6 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-bold text-navy">{option.label}</p>
                  <p className="mt-1 text-xs text-slate-500">Browse listings</p>
                </Link>
              );
            })}
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={reveal}
        className="home-gsap-section bg-surface px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Our services</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Complete property support for Hosur</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-[1440px] gap-6 md:grid-cols-3">
          {servicePreview.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={cardReveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.01 }}
                className="home-gsap-card home-parallax-soft rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:border-orange"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-navy">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                <Link to="/services" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange transition hover:text-orange-hover">
                  Learn more
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="home-gsap-section bg-gradient-to-b from-surface to-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Property Showcase</p>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Services & Property Types</h2>
          <p className="home-gsap-copy mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Explore the diverse range of properties and services we provide in Hosur
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[1440px]">
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes scroll-services {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }

              .services-scroll {
                display: flex;
                gap: 1.5rem;
                animation: scroll-services 40s linear infinite;
                width: max-content;
              }

              .services-scroll:hover {
                animation-play-state: paused;
              }

              .service-card {
                flex-shrink: 0;
                width: 280px;
                background: #ffffff;
                border: 2px solid #dfe6ee;
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
              }

              .service-card:hover {
                border-color: #ff7f0e;
                transform: translateY(-8px);
                box-shadow: 0 12px 24px rgba(255, 127, 14, 0.15);
                background: linear-gradient(135deg, #fff5e6 0%, #fffbf0 100%);
              }

              .service-icon {
                width: 60px;
                height: 60px;
                margin: 0 auto;
                background: linear-gradient(135deg, #001a4d 0%, #002d7a 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
              }

              .service-card:hover .service-icon {
                background: linear-gradient(135deg, #ff7f0e 0%, #ff9933 100%);
                transform: scale(1.1);
              }

              .gradient-fade-services {
                pointer-events: none;
              }

              .gradient-fade-left-services {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 100px;
                background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
                z-index: 10;
              }

              .gradient-fade-right-services {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 100px;
                background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
                z-index: 10;
              }
            `}</style>

            <div className="gradient-fade-services gradient-fade-left-services"></div>
            <div className="overflow-hidden">
              <div className="home-scroll-track services-scroll">
                {[...showcaseItems, ...showcaseItems].map((service, index) => {
                  const Icon = service.icon;
                  return (
                  <div key={`${service.title}-${index}`} className="service-card group">
                    <div className="service-icon">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-navy">{service.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 group-hover:text-orange transition">{service.description}</p>
                  </div>
                  );
                })}
              </div>
            </div>
            <div className="gradient-fade-services gradient-fade-right-services"></div>
          </div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="home-gsap-section bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-center sm:items-center">
          <div>
            <p className="section-tag">Featured properties</p>
            <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Cleanly presented, ready to compare.</h2>
            <p className="home-gsap-copy mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Browse verified homes, plots, and commercial properties arranged in a cleaner, more readable listing flow.
            </p>
          </div>
          <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-bold text-orange transition hover:text-orange-hover">
            View all listings
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-8 grid max-w-[1440px] gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredListings.map((item) => (
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
      </MotionSection>

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
              @keyframes scroll-partners {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }

              .partners-scroll {
                display: flex;
                gap: 2rem;
                animation: scroll-partners 30s linear infinite;
                width: max-content;
              }

              .partners-scroll:hover {
                animation-play-state: paused;
              }

              .partner-item {
                flex-shrink: 0;
                width: 200px;
                height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #ffffff 0%, #eef5f4 100%);
                border: 2px solid #cfdcde;
                border-radius: 12px;
                transition: all 0.3s ease;
                cursor: pointer;
                box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
              }

              .partner-item:hover {
                border-color: #ff7f0e;
                background: linear-gradient(135deg, #fff5e6 0%, #ffe6cc 100%);
                transform: translateY(-4px);
                box-shadow: 0 8px 16px rgba(255, 127, 14, 0.15);
              }

              .gradient-fade {
                pointer-events: none;
              }

              .gradient-fade-left {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 80px;
                background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
                z-index: 10;
              }

              .gradient-fade-right {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                width: 80px;
                background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
                z-index: 10;
              }
            `}</style>

            <div className="gradient-fade gradient-fade-left"></div>
            <div className="overflow-hidden">
              <div className="home-scroll-track partners-scroll">
                {[
                  { name: "Partner 1", logo: "P1" },
                  { name: "Partner 2", logo: "P2" },
                  { name: "Partner 3", logo: "P3" },
                  { name: "Partner 4", logo: "P4" },
                  { name: "Partner 5", logo: "P5" },
                  { name: "Partner 6", logo: "P6" },
                  { name: "Partner 1", logo: "P1" },
                  { name: "Partner 2", logo: "P2" },
                  { name: "Partner 3", logo: "P3" },
                  { name: "Partner 4", logo: "P4" },
                  { name: "Partner 5", logo: "P5" },
                  { name: "Partner 6", logo: "P6" },
                ].map((partner, index) => (
                  <div key={index} className="partner-item group">
                    <div className="text-center">
                      <p className="text-lg font-bold text-navy">{partner.logo}</p>
                      <p className="mt-1 text-xs text-slate-600 group-hover:text-orange transition">{partner.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="gradient-fade gradient-fade-right"></div>
          </div>
        </div>
      </MotionSection>

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
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Complete property support beyond listings.</h2>
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
