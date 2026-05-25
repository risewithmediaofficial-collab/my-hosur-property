import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  CheckIcon,
  ChevronDownIcon,
  FlagIcon,
  HomeIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
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
  Plot: HomeIcon,
  Villa: HomeModernIcon,
  "Independent House": HomeIcon,
  Flat: BuildingOfficeIcon,
  "Commercial Land": BuildingOffice2Icon,
  "Agricultural Land": HomeIcon,
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
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [openShortcutMenu, setOpenShortcutMenu] = useState("");
  const [propertyTypeMenuOpen, setPropertyTypeMenuOpen] = useState(false);
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

  const handlePostFreeProperty = () => {
    scrollToTop();

    if (isAuthenticated) {
      navigate("/post-property");
      return;
    }

    toast.success("Sign in to post your free property listing.");
    navigate("/auth", { state: { from: { pathname: "/post-property" } } });
  };

  return (
    <main className="page-shell w-full">
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
        className="relative min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-navy/75" />

        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <p className="section-tag !text-orange">Verified real estate platform</p>
          <h1 className="hero-title mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Verified property listings in <span className="text-orange">Hosur</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:mt-5 sm:text-base">
            Find verified properties for sale and rent across Hosur. Search apartments, villas, plots, and houses with clearer tools and local support.
          </p>

          <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                scrollToTop();
                navigate(`/listings?${queryString || "intent=buy"}`);
              }}
              className="site-button-primary w-full rounded-lg px-8 py-3 text-sm font-bold sm:w-auto"
            >
              Find Your Property
            </button>
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Contact Us
            </Link>
          </div>

          <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-3 text-center sm:mt-10 sm:gap-6">
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

      <section className="bg-surface px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1440px] space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-search sm:p-6">
            <p className="mb-4 text-center text-sm font-semibold text-navy sm:text-left">Search properties in Hosur</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_auto] lg:items-stretch">
              <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2 lg:col-span-1">
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

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div ref={shortcutBarRef} className="flex flex-wrap gap-2 sm:gap-3">
              {shortcutGroups.map((group) => (
                <div
                  key={group.label}
                  className={`relative ${openShortcutMenu === group.label ? "z-50" : "z-10"}`}
                  onMouseEnter={() => setOpenShortcutMenu(group.label)}
                  onMouseLeave={() => setOpenShortcutMenu("")}
                >
                  <button
                    type="button"
                    onClick={() => setOpenShortcutMenu((current) => (current === group.label ? "" : group.label))}
                    className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                      openShortcutMenu === group.label
                        ? "bg-navy text-white"
                        : "bg-surface text-navy hover:bg-orange/10 hover:text-orange"
                    }`}
                  >
                    {group.label}
                    <ChevronDownIcon className={`h-4 w-4 transition ${openShortcutMenu === group.label ? "rotate-180" : ""}`} />
                  </button>
                  {openShortcutMenu === group.label ? (
                    <div className="absolute left-0 top-full z-50 min-w-[220px] pt-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-card">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.label}-${item.label}`}
                            to={item.to}
                            className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-surface hover:text-orange"
                            onClick={() => setOpenShortcutMenu("")}
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
            <button
              type="button"
              onClick={handlePostFreeProperty}
              className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-orange px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-hover sm:w-auto"
            >
              <FlagIcon className="h-5 w-5" />
              Post your free property
            </button>
          </div>
        </div>
      </section>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="bg-white px-5 py-16 sm:px-8 lg:px-10"
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
                  className="property-type-card flex flex-col items-center p-6 text-center"
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
        className="bg-surface px-5 py-16 sm:px-8 lg:px-10"
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
                className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:border-orange"
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
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="bg-white px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-center sm:items-center">
          <div>
            <p className="section-tag">Featured properties</p>
            <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Cleanly presented, ready to compare.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
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
            <PropertyCard key={item._id} item={item} />
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
        className="bg-navy px-5 py-16 text-white sm:px-8 lg:px-10"
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
