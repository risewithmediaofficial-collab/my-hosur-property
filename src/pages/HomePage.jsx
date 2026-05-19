import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import CountUpNumber from "../components/CountUpNumber";
import PropertyCard from "../components/PropertyCard";
import SeoHead from "../components/SeoHead";
import useDebounce from "../hooks/useDebounce";
import useScrollToTop from "../hooks/useScrollToTop";
import { fetchHomeProperties } from "../services/api/propertyApi";
import { buildRealEstateAgentSchema, buildWebsiteSchema } from "../utils/seo";

gsap.registerPlugin(ScrollTrigger);

const MotionSection = motion.section;
const MotionDiv = motion.div;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

// Premium 3D animations
const heroHeroVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatingVariants = {
  hidden: { opacity: 0, y: 100 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay,
    },
  }),
  float: {
    y: [0, -12, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const cardHoverVariants = {
  initial: { scale: 1, rotateX: 0, rotateY: 0 },
  hover: {
    scale: 1.02,
    rotateX: 2,
    rotateY: 2,
    boxShadow: "0 20px 60px rgba(17, 17, 17, 0.15)",
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const gradientText = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay },
    background: "linear-gradient(135deg, #111111 0%, #555555 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),
};

const quickActions = [
  { label: "Buy Property", to: "/listings?intent=buy" },
  { label: "Rent Property", to: "/listings?intent=rent" },
  { label: "Commercial", to: "/listings?intent=buy&propertyType=Commercial" },
  { label: "Plots & Land", to: "/listings?intent=buy&propertyType=Plot" },
];

const shortcutGroups = [
  {
    label: "Buy",
    items: [
      { label: "Apartment", to: "/listings?intent=buy&propertyType=Apartment" },
      { label: "Villa", to: "/listings?intent=buy&propertyType=Villa" },
      { label: "Independent House", to: "/listings?intent=buy&propertyType=Independent House" },
      { label: "Plot", to: "/listings?intent=buy&propertyType=Plot" },
      { label: "Commercial", to: "/listings?intent=buy&propertyType=Commercial" },
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
      { label: "House", to: "/listings?intent=rent&propertyType=House" },
      { label: "Office", to: "/listings?intent=rent&propertyType=Office" },
      { label: "Commercial", to: "/listings?intent=rent&propertyType=Commercial" },
      { label: "Warehouse", to: "/listings?intent=rent&propertyType=Warehouse" },
    ],
  },
  {
    label: "Loan",
    items: [
      { label: "Home Loan", to: "/request-service?category=loan&type=House%20Loan" },
      { label: "Plot Loan", to: "/request-service?category=loan&type=Plot%20Loan" },
      { label: "Private Finance", to: "/request-service?category=loan&type=Private%20Finance" },
    ],
  },
  {
    label: "Interior",
    items: [
      { label: "House Interior", to: "/request-service?category=interior&type=House" },
      { label: "Office Interior", to: "/request-service?category=interior&type=Office" },
    ],
  },
  {
    label: "Construction",
    items: [
      { label: "House Construction", to: "/request-service?category=construction&type=House" },
      { label: "Commercial Construction", to: "/request-service?category=construction&type=Commercial" },
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

const HomePage = () => {
  const navigate = useNavigate();
  const scrollToTop = useScrollToTop();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openShortcutMenu, setOpenShortcutMenu] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const servicesRef = useRef(null);
  
  const [search, setSearch] = useState({
    intent: "buy",
    search: "",
    city: "",
    propertyType: "",
  });

  const debouncedSearch = useDebounce(search.search, 300);

  // Track mouse for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP animations on scroll
  useEffect(() => {
    if (!statsRef.current) return;

    gsap.to(statsRef.current, {
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top center",
        end: "bottom center",
        markers: false,
      },
      y: -20,
      opacity: 1,
      duration: 0.8,
    });
  }, []);

  // Services parallax
  useEffect(() => {
    if (!servicesRef.current) return;

    const cards = servicesRef.current.querySelectorAll(".service-card");
    cards.forEach((card, index) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top center+=100",
          end: "center center",
          scrub: 1,
        },
        y: -30 * (index + 1),
        opacity: 1,
      });
    });
  }, []);

  useEffect(() => {
    fetchHomeProperties()
      .then((res) => setFeatured(res.items || []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.intent) params.set("intent", search.intent);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (search.city) params.set("city", search.city);
    if (search.propertyType) params.set("propertyType", search.propertyType);
    return params.toString();
  }, [debouncedSearch, search.city, search.intent, search.propertyType]);

  const featuredListings = featured.slice(0, 4);

  return (
    <main className="w-full space-y-6 bg-white px-4 py-6 sm:px-5 md:space-y-8 md:py-8 lg:px-6">
      <SeoHead
        title="Verified Property Listings in Hosur"
        description="Explore verified property listings, real-estate services, and professional local property support through My Hosur Property."
        keywords="Hosur property listings, verified property in Hosur, buy property Hosur, rent property Hosur, real estate services Hosur"
        canonicalPath="/"
        schema={[buildWebsiteSchema(), buildRealEstateAgentSchema()]}
      />

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(17,17,17,0.04)] sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {shortcutGroups.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenShortcutMenu(group.label)}
                onMouseLeave={() => setOpenShortcutMenu("")}
              >
                <button
                  type="button"
                  onClick={() => setOpenShortcutMenu((current) => (current === group.label ? "" : group.label))}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    openShortcutMenu === group.label
                      ? "border-slate-300 bg-white text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{group.label}</span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition ${openShortcutMenu === group.label ? "rotate-180" : ""}`} />
                </button>

                {openShortcutMenu === group.label ? (
                  <div className="absolute left-0 top-full z-30 min-w-[220px] pt-3">
                    <div className="rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                      {group.items.map((item) => (
                        <Link
                          key={`${group.label}-${item.label}`}
                          to={item.to}
                          className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="flex items-center gap-3 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              <input
                value={search.search}
                onChange={(event) => setSearch((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search locality, project, office, land, warehouse, or property name"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                scrollToTop();
                navigate(`/listings?${queryString || "intent=buy"}`);
              }}
              className="site-button-primary min-h-[56px] rounded-[1.3rem] px-6 text-sm"
            >
              Find Your Property
            </button>

            <Link
              to="/post-property"
              className="inline-flex min-h-[56px] items-center justify-center rounded-[1.3rem] border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:-translate-y-[6px] hover:border-slate-900 hover:bg-slate-50"
            >
              List Property
            </Link>
          </div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(17,17,17,0.04)] sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <motion.div variants={reveal} custom={0.05} className="site-kicker">
              <CheckBadgeIcon className="h-4 w-4" />
              Trusted property platform
            </motion.div>
            <motion.h1 variants={reveal} custom={0.1} className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
              Buy, sell, rent, and manage property with a cleaner real-estate experience.
            </motion.h1>
            <motion.p variants={reveal} custom={0.15} className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              My Hosur Property brings verified listings, local guidance, and complete property support into one professional platform built for Hosur.
            </motion.p>

            <motion.div variants={reveal} custom={0.2} className="mt-7 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.7fr_0.6fr_auto]">
                <div className="flex items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                  <input
                    value={search.search}
                    onChange={(event) => setSearch((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Search locality, project, property type, or landmark"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <input
                  value={search.city}
                  onChange={(event) => setSearch((prev) => ({ ...prev, city: event.target.value }))}
                  placeholder="City"
                  className="site-input rounded-[1.1rem] bg-white text-sm"
                />

                <select
                  value={search.propertyType}
                  onChange={(event) => setSearch((prev) => ({ ...prev, propertyType: event.target.value }))}
                  className="site-input rounded-[1.1rem] bg-white text-sm"
                >
                  <option value="">All types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Independent House">Independent House</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    scrollToTop();
                    navigate(`/listings?${queryString || "intent=buy"}`);
                  }}
                  className="site-button-primary min-h-[56px] rounded-[1.1rem] px-6 text-sm"
                >
                  Search
                </button>
              </div>
            </motion.div>

            <motion.div variants={reveal} custom={0.25} className="mt-6 flex flex-wrap gap-2">
              {quickActions.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-[6px] hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </div>

          <motion.div variants={reveal} custom={0.2} className="grid gap-4">
            <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80"
                alt="Modern residential property in Hosur"
                className="h-[320px] w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {homeStats.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <p className="text-3xl font-semibold text-slate-900">
                    <CountUpNumber value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="grid gap-4 md:grid-cols-3"
      >
        {servicePreview.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              variants={reveal}
              custom={index * 0.05}
              className="rounded-[1.7rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-[6px] hover:border-slate-900 hover:shadow-[0_16px_30px_rgba(17,17,17,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              <Link to="/services" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-600">
                Learn more
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </motion.article>
          );
        })}
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Featured properties</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Cleanly presented, ready to compare.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Browse verified homes, plots, and commercial properties arranged in a cleaner, more readable listing flow.
            </p>
          </div>
          <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-600">
            View all listings
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredListings.map((item) => (
            <PropertyCard key={item._id} item={item} />
          ))}

          {featuredLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-4">
                <div className="h-52 animate-pulse rounded-[1.2rem] bg-slate-100" />
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
        className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(17,17,17,0.04)] sm:px-8"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Need expert help</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Complete property support beyond listings.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              From property search and loans to documentation, registration, construction, and local service coordination, our team helps you move with clarity.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/services" className="site-button-secondary rounded-2xl px-6 py-3 text-sm">
              Explore Services
            </Link>
            <Link to="/contact" className="site-button-primary rounded-2xl px-6 py-3 text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </MotionSection>
    </main>
  );
};

export default HomePage;
