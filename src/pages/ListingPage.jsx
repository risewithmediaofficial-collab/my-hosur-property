import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PropertyCard from "../components/PropertyCard";
import FilterSidebar from "../components/FilterSidebar";
import SeoHead from "../components/SeoHead";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import useLowMotionDevice from "../hooks/useLowMotionDevice";
import { fetchProperties } from "../services/api/propertyApi";
import { toggleSavedProperty } from "../services/api/userApi";
import { buildCanonicalListingQuery } from "../utils/seo";

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const MotionDiv = motion.div;

const filterLabels = {
  intent: "Intent",
  search: "Search",
  city: "City",
  area: "Area",
  propertyType: "Type",
  furnishingStatus: "Furnishing",
  minBhk: "Min BHK",
  maxBhk: "Max BHK",
  possessionStatus: "Possession",
  verified: "Verified",
  listingSource: "Source",
  amenities: "Amenities",
  minPrice: "Min price",
  maxPrice: "Max price",
};

const ListingPage = () => {
  const [params, setParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    intent: params.get("intent") || "",
    search: params.get("search") || "",
    city: params.get("city") || "",
    area: params.get("area") || "",
    propertyType: params.get("propertyType") || "",
    furnishingStatus: params.get("furnishingStatus") || "",
    minBhk: params.get("minBhk") || "",
    maxBhk: params.get("maxBhk") || "",
    possessionStatus: params.get("possessionStatus") || "",
    verified: params.get("verified") || "",
    listingSource: params.get("listingSource") || "",
    amenities: params.get("amenities") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: params.get("sort") || "rank",
    page: 1,
    limit: 12,
  });

  const debounced = useDebounce(filters, 400);
  const [data, setData] = useState({ items: [], totalPages: 0, page: 1, total: 0 });
  const [savedIds, setSavedIds] = useState([]);
  const sentinelRef = useRef(null);
  const heroRef = useRef(null);
  const revealRefs = useRef([]);
  const lowMotionDevice = useLowMotionDevice();

  useBodyScrollLock(mobileFilterOpen);

  const setRevealRef = (node) => {
    if (node && !revealRefs.current.includes(node)) {
      revealRefs.current.push(node);
    }
  };

  const query = useMemo(() => {
    const out = { ...debounced };
    Object.keys(out).forEach((key) => {
      if (out[key] === "") delete out[key];
    });
    if (out.page === 1) delete out.page;
    if (out.limit === 12) delete out.limit;
    if (out.sort === "rank") delete out.sort;
    return out;
  }, [debounced]);

  const listingTitle = useMemo(() => {
    const type = filters.propertyType ? `${filters.propertyType} ` : "";
    const intent =
      filters.intent === "rent" ? "for Rent" : filters.intent === "new-project" ? "New Projects" : "for Sale";
    const city = filters.city || "Hosur";

    return `${type}Properties ${intent} in ${city}`;
  }, [filters.city, filters.intent, filters.propertyType]);

  const listingDescription = useMemo(() => {
    const city = filters.city || "Hosur";
    const searchLabel = filters.search ? ` matching "${filters.search}"` : "";
    return `Browse verified ${filters.propertyType || "property"} listings${searchLabel} in ${city}. Compare apartments, villas, plots, and houses with detailed filters, local insights, and direct listing access.`;
  }, [filters.city, filters.propertyType, filters.search]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => searchParams.set(key, String(value)));
    setParams(searchParams);

    fetchProperties(query, token)
      .then((res) => {
        setData((prev) => ({
          ...res,
          items: query.page > 1 ? [...prev.items, ...(res.items || [])] : res.items || [],
        }));
      })
      .catch(() => setData({ items: [], totalPages: 0, page: 1, total: 0 }));
  }, [query, setParams, token]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && data.page < data.totalPages) {
          setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      },
      { threshold: 0.8 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [data.page, data.totalPages]);

  useEffect(() => {
    if (lowMotionDevice) return undefined;

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll("[data-listing-hero]"),
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.1,
          }
        );
      }

      revealRefs.current.forEach((node, index) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.04,
            scrollTrigger: {
              trigger: node,
              start: "top 84%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, [lowMotionDevice]);

  const clearFilters = () =>
    setFilters({
      intent: "",
      search: "",
      city: "",
      area: "",
      propertyType: "",
      furnishingStatus: "",
      minBhk: "",
      maxBhk: "",
      possessionStatus: "",
      verified: "",
      listingSource: "",
      amenities: "",
      minPrice: "",
      maxPrice: "",
      sort: "rank",
      page: 1,
      limit: 12,
    });

  const onSave = async (propertyId) => {
    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      const res = await toggleSavedProperty(token, { propertyId });
      setSavedIds(res.savedProperties);
      toast.success("Wishlist updated");
    } catch {
      toast.error("Unable to update wishlist");
    }
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (["sort", "page", "limit"].includes(key)) return false;
    return value !== "";
  }).length;

  const activeFilterChips = Object.entries(filters)
    .filter(([key, value]) => !["sort", "page", "limit"].includes(key) && value !== "")
    .map(([key, value]) => ({
      key,
      label: filterLabels[key] || key,
      value: key === "verified" ? "Yes" : value,
    }));

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-5 sm:py-8 md:flex-row md:gap-6 lg:px-6">
      <SeoHead
        title={listingTitle}
        description={listingDescription}
        keywords={`Hosur property listings, ${filters.propertyType || "property"} in ${filters.city || "Hosur"}, property for sale in Hosur, property for rent in Hosur`}
        canonicalPath={buildCanonicalListingQuery(filters)}
      />
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(252,255,254,0.98),rgba(240,248,247,0.96))] p-5 shadow-[0_18px_38px_rgba(16,95,104,0.1)] md:block md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Search studio</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Filter results</h2>
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 whitespace-nowrap">
            Reset
          </button>
        </div>
        <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      </aside>

      {mobileFilterOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]" onClick={() => setMobileFilterOpen(false)} />
          <aside className="relative ml-auto flex h-full w-full max-w-[88vw] flex-col overflow-hidden rounded-l-[32px] border-l border-slate-200 bg-[linear-gradient(180deg,rgba(252,255,254,1),rgba(238,247,246,1))] shadow-[0_28px_60px_rgba(16,95,104,0.18)]">
            <div className="border-b border-slate-200 bg-[rgba(252,255,254,0.98)] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Filters</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">Refine search</h2>
                </div>
                <button type="button" onClick={() => setMobileFilterOpen(false)} className="flex-shrink-0 rounded-2xl border border-slate-200 bg-[rgba(255,255,255,0.98)] p-2 text-slate-600 shadow-[0_12px_22px_rgba(16,95,104,0.08)]">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-500">Use the controls below to tighten price, type, and locality without leaving the results.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="rounded-[1.75rem] border border-white/70 bg-[rgba(255,255,255,0.97)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  clearFilters={() => {
                    clearFilters();
                    setMobileFilterOpen(false);
                  }}
                />
              </div>
            </div>
            <div className="border-t border-slate-200 bg-[rgba(252,255,254,0.98)] px-5 py-4">
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="site-button-primary w-full px-4 py-3 text-sm">
                View {data.total || data.items.length || 0} Properties
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 space-y-6">
        <section
          ref={heroRef}
          className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,247,245,0.92))] p-6 shadow-[0_16px_38px_rgba(16,95,104,0.08)] md:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  data-listing-hero
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Property catalog
                </div>
                <h1
                  data-listing-hero
                  className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-5xl"
                >
                  Browse verified Hosur listings in a cleaner, more premium flow.
                </h1>
                <p data-listing-hero className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                  Explore sale and rent inventory with calmer filters, stronger hierarchy, and a more editorial result grid.
                </p>
              </div>

              <div data-listing-hero className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Results</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{data.total || data.items.length}</p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active filters</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{activeFilterCount}</p>
                </div>
              </div>
            </div>

            <div
              data-listing-hero
              className="flex flex-col gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Showing matched inventory for your current search.</p>
                  <p className="mt-1 text-sm text-slate-500">Adjust locality, price, or type to widen or sharpen the result set.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="site-button-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm md:hidden"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Open filters
              </button>
            </div>

            {activeFilterChips.length ? (
              <div data-listing-hero className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span key={chip.key} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {chip.label}: {chip.value}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {data.items.length ? (
          <MotionDiv
            ref={setRevealRef}
            initial={lowMotionDevice ? false : "hidden"}
            whileInView={lowMotionDevice ? undefined : "show"}
            viewport={{ once: true, amount: 0.08 }}
            variants={fadeUp}
            className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3"
          >
            {data.items.map((item, index) => (
              <MotionDiv
                key={item._id}
                initial={lowMotionDevice ? false : { opacity: 0, y: 24 }}
                animate={lowMotionDevice ? undefined : { opacity: 1, y: 0 }}
                transition={lowMotionDevice ? undefined : { duration: 0.5, delay: Math.min(index * 0.03, 0.18) }}
                whileHover={lowMotionDevice ? undefined : { y: -6 }}
              >
                <PropertyCard item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <div ref={setRevealRef} className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
            <h3 className="text-3xl font-semibold tracking-tight text-slate-900">No properties found</h3>
            <p className="mt-4 mx-auto max-w-xl text-sm leading-8 text-slate-600">
              Try widening your city, budget, or property-type filters to bring more inventory into view.
            </p>
            <button type="button" onClick={clearFilters} className="site-button-primary mt-6 px-5 py-3 text-sm">
              Clear filters
            </button>
          </div>
        )}

        <div ref={sentinelRef} className="py-6 text-center text-sm text-slate-400">
          {data.page < data.totalPages ? "Loading more properties..." : data.items.length ? "You have reached the end of the results." : null}
        </div>
      </section>
    </div>
  );
};

export default ListingPage;
