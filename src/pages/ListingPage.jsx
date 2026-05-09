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
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { fetchProperties } from "../services/api/propertyApi";
import { toggleSavedProperty } from "../services/api/userApi";

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
    return out;
  }, [debounced]);

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
  }, []);

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
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,245,238,0.84))] p-5 shadow-[0_20px_44px_rgba(15,23,42,0.08)] md:block md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Search studio</p>
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
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <aside className="relative ml-auto h-full w-full max-w-sm overflow-y-auto rounded-l-[32px] border-l border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,245,238,0.94))] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.2)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b6b3f]">Filters</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Refine search</h2>
              </div>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="rounded-2xl border border-slate-200/80 bg-white/80 p-2 text-slate-600 flex-shrink-0">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              clearFilters={() => {
                clearFilters();
                setMobileFilterOpen(false);
              }}
            />
          </aside>
        </div>
      ) : null}

      <section className="min-w-0 flex-1 space-y-6">
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,243,236,0.88))] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(245,200,128,0.18),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.12),transparent_18%)]" />
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  data-listing-hero
                  className="inline-flex items-center gap-2 rounded-full border border-[#eadbc4] bg-[#fff8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Property catalog
                </div>
                <h1
                  data-listing-hero
                  className="mt-4 max-w-3xl font-['Fraunces'] text-4xl leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-5xl"
                >
                  Browse verified Hosur listings in a cleaner, more premium flow.
                </h1>
                <p data-listing-hero className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                  Explore sale and rent inventory with calmer filters, stronger hierarchy, and a more editorial result grid.
                </p>
              </div>

              <div data-listing-hero className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/70 bg-white/78 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Results</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{data.total || data.items.length}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/70 bg-slate-900 px-5 py-4 text-white">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f3d8af]">Active filters</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{activeFilterCount}</p>
                </div>
              </div>
            </div>

            <div
              data-listing-hero
              className="flex flex-col gap-3 rounded-[1.6rem] border border-slate-200/70 bg-white/74 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#fff8ef] text-[#8b6b3f]">
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
                  <span key={chip.key} className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
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
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.08 }}
            variants={fadeUp}
            className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3"
          >
            {data.items.map((item, index) => (
              <MotionDiv
                key={item._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.18) }}
                whileHover={{ y: -6 }}
              >
                <PropertyCard item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <div ref={setRevealRef} className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,245,238,0.88))] px-6 py-16 text-center shadow-[0_22px_54px_rgba(15,23,42,0.06)]">
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
