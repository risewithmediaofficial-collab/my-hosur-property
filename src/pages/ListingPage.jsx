import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PropertyCard from "../components/PropertyCard";
import FilterSidebar from "../components/FilterSidebar";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { fetchProperties } from "../services/api/propertyApi";
import { toggleSavedProperty } from "../services/api/userApi";

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

  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-5 sm:py-8 md:flex-row md:gap-6 lg:px-6">
      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-80 shrink-0 overflow-y-auto dashboard-shell p-5 md:p-6 md:block">
        <div className="mb-4 md:mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Search tools</p>
            <h2 className="mt-1 md:mt-2 text-base md:text-lg font-bold text-slate-900">Filter results</h2>
          </div>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-slate-500 transition hover:text-slate-900 whitespace-nowrap">
            Reset
          </button>
        </div>
        <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      </aside>

      {mobileFilterOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <aside className="relative ml-auto h-full w-full max-w-sm overflow-y-auto rounded-l-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Filters</p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Refine search</h2>
              </div>
              <button type="button" onClick={() => setMobileFilterOpen(false)} className="rounded-2xl border border-slate-200 p-2 text-slate-600 flex-shrink-0">
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
        <div className="dashboard-shell p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Property catalog</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Browse verified property listings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Explore sale and rent inventory with a cleaner search experience and structured filters.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="dashboard-stat px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Results</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{data.total || data.items.length}</p>
              </div>
              <div className="dashboard-stat px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active filters</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{activeFilterCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing properties matched to your current filters and query selections.
            </p>
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="site-button-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm md:hidden"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Open filters
            </button>
          </div>
        </div>

        {data.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {data.items.map((item) => (
              <PropertyCard key={item._id} item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
            ))}
          </div>
        ) : (
          <div className="dashboard-shell px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-slate-900">No properties found</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Try adjusting your city, budget, or property type filters to widen the search.
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
