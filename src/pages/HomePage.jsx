import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CheckIcon,
  CheckBadgeIcon,
  ChevronDownIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import CountUpNumber from "../components/CountUpNumber";
import PropertyCard from "../components/PropertyCard";
import SeoHead from "../components/SeoHead";
import AnimatedHeading from "../components/AnimatedHeading";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import useScrollToTop from "../hooks/useScrollToTop";
import realEstateBackground from "../assets/real-estate-background-hero.jpg";
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

const quickActions = [
  { label: "Buy Property", to: "/listings?intent=buy" },
  { label: "Rent Property", to: "/listings?intent=rent" },
  { label: "Commercial", to: "/listings?intent=buy&propertyType=Commercial" },
  { label: "Plots & Land", to: "/listings?intent=buy&propertyType=Plot" },
];

const propertyTypeOptions = [
  { label: "All types", value: "" },
  { label: "Plot", value: "Plot" },
  { label: "Villa", value: "Villa" },
  { label: "Independent House", value: "Independent House" },
  { label: "Flat", value: "Flat" },
  { label: "Commercial Land", value: "Commercial Land" },
  { label: "Agricultural Land", value: "Agricultural Land" },
];

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
    <main className="w-full bg-white">
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
        className="relative z-30 bg-[#06233b] px-5 pb-12 pt-8 text-white sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
          <div className="relative z-40 flex flex-col gap-4 rounded-2xl bg-white/7 p-3 xl:flex-row xl:items-center xl:justify-between">
            <div ref={shortcutBarRef} className="flex flex-wrap gap-3">
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
                    className={`inline-flex min-h-[54px] items-center gap-3 rounded-xl px-5 py-3 text-base font-extrabold transition sm:min-w-[118px] sm:justify-center ${
                      openShortcutMenu === group.label
                        ? "bg-white text-[#06233b]"
                        : "bg-white/10 text-white hover:bg-white/18 hover:text-white"
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDownIcon className={`h-5 w-5 transition ${openShortcutMenu === group.label ? "rotate-180 text-[#06233b]" : "text-white/70"}`} />
                  </button>

                  {openShortcutMenu === group.label ? (
                    <div className="absolute left-0 top-full z-50 min-w-[240px] pt-3">
                      <div className="rounded-md border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.label}-${item.label}`}
                            to={item.to}
                            className="block rounded px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
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
              className="inline-flex min-h-[54px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0b74d1] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#075da8]"
            >
              <FlagIcon className="h-5 w-5" />
              Post your free property
            </button>
          </div>

          <div className="mx-auto max-w-2xl pt-7 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Verified real estate platform</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.03] tracking-[-0.04em] text-white sm:text-5xl">
              Verified property listings in Hosur
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70">
              Find verified properties for sale and rent across Hosur. Search apartments, villas, plots, and houses with clearer tools and local support.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white px-4 py-3">
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
              className="site-button-primary min-h-[48px] rounded-md px-6 text-sm"
            >
              Find Your Property
            </button>

            <Link
              to="/post-property"
              className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-white/20 bg-transparent px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              List Property
            </Link>
          </div>

          <div className="mt-4 overflow-hidden">
            <img
              src={realEstateBackground}
              alt="Modern real estate search experience in Hosur"
              className="h-[260px] w-full object-cover sm:h-[360px]"
              loading="eager"
            />
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-6 text-center sm:grid-cols-3">
            {homeStats.map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-semibold text-white">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-xs text-white/55">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="hidden"
        style={{
          backgroundImage: `url(${realEstateBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,252,252,0.9)_0%,rgba(248,252,252,0.76)_36%,rgba(248,252,252,0.3)_62%,rgba(15,69,77,0.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(15,69,77,0.06)_100%)]" />

        <div className="relative z-10 flex min-h-[540px] flex-col justify-between gap-10 lg:min-h-[620px]">
          <div className="max-w-3xl pt-2 lg:max-w-[52rem] lg:pt-6">
            <motion.div variants={reveal} custom={0.05} className="site-kicker">
              <CheckBadgeIcon className="h-4 w-4" />
              Trusted property platform
            </motion.div>
            <motion.div variants={reveal} custom={0.1}>
              <AnimatedHeading
                as="h1"
                text="Buy, sell, rent, and manage property with a cleaner real-estate experience."
                className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.03] sm:text-5xl lg:text-6xl"
              />
            </motion.div>
            <motion.p variants={reveal} custom={0.15} className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              My Hosur Property brings verified listings, local guidance, and complete property support into one professional platform built for Hosur.
            </motion.p>

            <motion.div
              ref={propertyTypeMenuRef}
              variants={reveal}
              custom={0.2}
              className="relative z-40 mt-7 rounded-[1.75rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(234,247,245,0.74))] p-3 shadow-[0_18px_36px_rgba(16,95,104,0.14)] backdrop-blur-md"
            >
              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.7fr_0.6fr_auto]">
                <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/70 bg-white/90 px-4 py-3 backdrop-blur-sm">
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

                <div className="relative z-40">
                  <button
                    type="button"
                    onClick={() => setPropertyTypeMenuOpen((current) => !current)}
                    className={`flex min-h-[56px] w-full items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold shadow-[0_10px_24px_rgba(16,95,104,0.08)] transition ${
                      propertyTypeMenuOpen
                        ? "border-slate-900 bg-[rgba(255,255,255,0.98)] text-slate-900"
                        : "border-white/70 bg-white/92 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span>{selectedPropertyTypeLabel}</span>
                    <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition ${propertyTypeMenuOpen ? "rotate-180 text-slate-700" : ""}`} />
                  </button>

                  {propertyTypeMenuOpen ? (
                    <div className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[260px] overflow-y-auto rounded-[1.3rem] border border-white/85 bg-[rgba(255,255,255,0.99)] p-2 shadow-[0_24px_50px_rgba(16,95,104,0.2)] backdrop-blur-xl">
                      {propertyTypeOptions.map((option) => {
                        const isSelected = option.value === search.propertyType;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => {
                              setSearch((prev) => ({ ...prev, propertyType: option.value }));
                              setPropertyTypeMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                              isSelected
                                ? "bg-[rgba(222,241,239,0.82)] text-slate-900"
                                : "text-slate-600 hover:bg-[rgba(222,241,239,0.72)] hover:text-slate-900"
                            }`}
                          >
                            <span>{option.label}</span>
                            {isSelected ? <CheckIcon className="h-4 w-4 text-slate-700" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

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
                  className="rounded-full border border-white/65 bg-white/82 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(16,95,104,0.1)] backdrop-blur-sm transition hover:-translate-y-[6px] hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          </div>

          <motion.div variants={reveal} custom={0.3} className="relative z-10 grid gap-3 sm:grid-cols-3 lg:max-w-[52rem]">
            {homeStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.45rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(234,247,245,0.68))] p-4 shadow-[0_18px_30px_rgba(16,95,104,0.1)] backdrop-blur-md"
              >
                <p className="text-3xl font-semibold text-slate-900">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-2 text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 text-center md:grid-cols-3 lg:px-10"
      >
        {servicePreview.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              variants={reveal}
              custom={index * 0.05}
              className="bg-white p-2 transition duration-300 hover:-translate-y-1"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center text-slate-900">
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
        className="border-t border-slate-200 bg-[#f6f6f3] px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-center sm:items-center">
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

        <div className="mx-auto mt-8 grid max-w-[1440px] gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredListings.map((item) => (
            <PropertyCard key={item._id} item={item} />
          ))}

          {featuredLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden border border-slate-200 bg-white p-4">
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
        className="px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="mx-auto grid max-w-[1440px] gap-5 text-center lg:grid-cols-[1fr_auto] lg:items-center lg:text-left">
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
