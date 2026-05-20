import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import SeoHead from "../components/SeoHead";
import useAuth from "../hooks/useAuth";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import useDebounce from "../hooks/useDebounce";
import { fetchProperties } from "../services/api/propertyApi";
import { toggleSavedProperty } from "../services/api/userApi";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import { buildListingPath, getListingInternalLinks, getSeoRoute } from "../utils/seoRoutes";

const MotionDiv = motion.div;

const EMPTY_FILTERS = {
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
};

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

const buildInitialFilters = (params, routePath) => {
  const route = getSeoRoute(routePath);
  const routeDefaults = route?.listing || {};

  return {
    ...EMPTY_FILTERS,
    ...routeDefaults,
    intent: params.get("intent") || routeDefaults.intent || "",
    search: params.get("search") || "",
    city: params.get("city") || routeDefaults.city || "",
    area: params.get("area") || "",
    propertyType: params.get("propertyType") || routeDefaults.propertyType || "",
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
    page: Number(params.get("page") || 1),
    limit: Number(params.get("limit") || 12),
  };
};

const ListingPage = ({ routePath = "/buy" }) => {
  const [params, setParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => buildInitialFilters(params, routePath));
  const [data, setData] = useState({ items: [], totalPages: 0, page: 1, total: 0 });
  const [savedIds, setSavedIds] = useState([]);
  const sentinelRef = useRef(null);
  const debounced = useDebounce(filters, 400);
  const route = getSeoRoute(routePath);
  const routeDefaults = route?.listing || {};
  const internalLinks = getListingInternalLinks();
  const paramsSignature = params.toString();

  useBodyScrollLock(mobileFilterOpen);

  useEffect(() => {
    setFilters(buildInitialFilters(params, routePath));
  }, [paramsSignature, routePath]);

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

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: "Home", to: "/" }];

    if (routePath.startsWith("/hosur/")) {
      items.push({ label: "Hosur", to: "/buy" });
    }

    if (route?.label && routePath !== "/") {
      items.push({ label: route.label, to: routePath });
    }

    return items;
  }, [route?.label, routePath]);

  const listingTitle = useMemo(() => {
    if (!route) return "Property Listings in Hosur";
    const searchLabel = filters.search ? ` matching "${filters.search}"` : "";
    return `${route.seo?.title || route.label}${searchLabel}`;
  }, [filters.search, route]);

  const listingDescription = useMemo(() => {
    const fallback = route?.seo?.description || "Browse verified property listings in Hosur.";
    if (!filters.area && !filters.city && !filters.search) return fallback;

    const fragments = [
      route?.seo?.description || "Browse verified property listings",
      filters.area ? `near ${filters.area}` : "",
      filters.city ? `in ${filters.city}` : "",
      filters.search ? `for searches related to ${filters.search}` : "",
    ].filter(Boolean);

    return `${fragments.join(" ")}.`;
  }, [filters.area, filters.city, filters.search, route]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (routeDefaults[key] && String(routeDefaults[key]) === String(value)) return;
      searchParams.set(key, String(value));
    });
    setParams(searchParams, { replace: true });

    fetchProperties(query, token)
      .then((res) => {
        setData((prev) => ({
          ...res,
          items: query.page > 1 ? [...prev.items, ...(res.items || [])] : res.items || [],
        }));
      })
      .catch(() => setData({ items: [], totalPages: 0, page: 1, total: 0 }));
  }, [query, routeDefaults, setParams, token]);

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

  const clearFilters = () =>
    setFilters({
      ...EMPTY_FILTERS,
      ...routeDefaults,
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
    if (routeDefaults[key] && String(routeDefaults[key]) === String(value)) return false;
    return value !== "";
  }).length;

  const activeFilterChips = Object.entries(filters)
    .filter(([key, value]) => !["sort", "page", "limit"].includes(key) && value !== "")
    .filter(([key, value]) => !(routeDefaults[key] && String(routeDefaults[key]) === String(value)))
    .map(([key, value]) => ({
      key,
      label: filterLabels[key] || key,
      value: key === "verified" ? "Yes" : value,
    }));

  return (
    <main className="flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-5 sm:py-8 lg:px-6">
      <SeoHead
        title={listingTitle}
        description={listingDescription}
        keywords={`Hosur property, ${route?.label || "property"} listings, Hosur real estate, villas plots apartments Hosur`}
        canonicalPath={buildListingPath(routePath, filters, routeDefaults)}
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbItems)]}
      />

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
        <Breadcrumbs items={breadcrumbItems} className="px-1" />

        <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,247,245,0.92))] p-6 shadow-[0_16px_38px_rgba(16,95,104,0.08)] md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                  <SparklesIcon className="h-4 w-4" />
                  SEO collection page
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-5xl">
                  {route?.seo?.title || "Browse Hosur Property Listings"}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">{listingDescription}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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

            <div className="flex flex-col gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Use this page as a focused entry point for Google and buyers.</p>
                  <p className="mt-1 text-sm text-slate-500">The clean route, related links, and breadcrumb trail help search engines understand the structure.</p>
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
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span key={chip.key} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {chip.label}: {chip.value}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] overflow-y-auto rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(252,255,254,0.98),rgba(240,248,247,0.96))] p-6 shadow-[0_18px_38px_rgba(16,95,104,0.1)] md:block">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Search studio</p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">Filter results</h2>
              </div>
              <button type="button" onClick={clearFilters} className="whitespace-nowrap text-xs font-semibold text-slate-500 transition hover:text-slate-900">
                Reset
              </button>
            </div>
            <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
          </aside>

          <section className="min-w-0 space-y-6">
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

            {data.items.length ? (
              <MotionDiv className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {data.items.map((item) => (
                  <PropertyCard key={item._id} item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
                ))}
              </MotionDiv>
            ) : (
              <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">No properties found</h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-slate-600">
                  Try widening your city, budget, or property-type filters to bring more inventory into view.
                </p>
                <button type="button" onClick={clearFilters} className="site-button-primary mt-6 px-5 py-3 text-sm">
                  Clear filters
                </button>
              </div>
            )}

            <nav aria-label="Related collections" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Related property pages</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Keep exploring Hosur categories</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {internalLinks.map((item) => (
                  <Link key={item.path} to={item.path} className="site-button-secondary px-5 py-3 text-sm">
                    {item.label}
                  </Link>
                ))}
                <Link to="/agents" className="site-button-secondary px-5 py-3 text-sm">
                  Agents
                </Link>
              </div>
            </nav>

            <div ref={sentinelRef} className="py-6 text-center text-sm text-slate-400">
              {data.page < data.totalPages ? "Loading more properties..." : data.items.length ? "You have reached the end of the results." : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
};

export default ListingPage;
