import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AdjustmentsHorizontalIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  HomeIcon,
  LandIcon,
  MagnifyingGlassIcon,
  PropertySearchIcon,
  Squares2X2Icon,
  VillaIcon,
  XMarkIcon,
} from "../components/AppIcons";
import PropertyCard from "../components/PropertyCard";
import PropertySearchFilterPanel from "../components/PropertySearchFilterPanel";
import { SORT_OPTIONS } from "../constants/propertyFilterConfig";
import SeoHead from "../components/SeoHead";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import useAuth from "../hooks/useAuth";
import useScrollAnimation from "../hooks/useScrollAnimation";
import { fetchProperties } from "../services/api/propertyApi";
import { fetchSavedProperties, toggleSavedProperty } from "../services/api/userApi";
import {
  buildFilterChips,
  clearCategoryFields,
  clientRefineProperties,
  createDefaultFilterState,
  filtersToApiParams,
  getCategoryLabel,
  parseFiltersFromSearchParams,
  removeChipFromState,
  resetAllFilters,
  serializeFiltersToSearchParams,
} from "../utils/propertyFilters";
import { buildCanonicalListingQuery } from "../utils/seo";
import { useAppLanguage } from "../context/LanguageContext";

const ListingSkeleton = ({ isSidebarOpen }) => (
  <div className={`grid gap-6 ${isSidebarOpen ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"}`}>
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="h-52 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-10 animate-pulse rounded-lg bg-slate-100" />
      </div>
    ))}
  </div>
);

const QUICK_CATEGORIES = [
  { id: "", label: "All Properties", icon: Squares2X2Icon },
  { id: "plot", label: "Plots & Land", icon: LandIcon },
  { id: "villa", label: "Villas", icon: VillaIcon },
  { id: "individualHouse", label: "Houses", icon: HomeIcon },
  { id: "apartment", label: "Apartments", icon: BuildingOffice2Icon },
  { id: "commercial", label: "Commercial", icon: BuildingOfficeIcon },
  { id: "agricultural", label: "Agricultural", icon: LandIcon },
  { id: "houseRent", label: "For Rent", icon: HomeIcon },
];

const ListingPage = () => {
  const { t } = useAppLanguage();
  const [params, setParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(() => parseFiltersFromSearchParams(params));
  const [applied, setApplied] = useState(() => parseFiltersFromSearchParams(params));
  const [data, setData] = useState({ items: [], totalPages: 0, page: 1, total: 0 });
  const [savedIds, setSavedIds] = useState(new Set());
  const [searchInput, setSearchInput] = useState(
    () => applied.location || applied.locality || ""
  );

  useEffect(() => {
    setSearchInput(applied.location || applied.locality || "");
  }, [applied.location, applied.locality]);

  useScrollAnimation(null, [data.items.length]);
  const sentinelRef = useRef(null);
  const resultsScrollRef = useRef(null);

  useBodyScrollLock(mobileFilterOpen);

  const handleQuickCategoryChange = (catId) => {
    setDraft((prev) => {
      const cleared = clearCategoryFields(prev, prev.category);
      return { ...cleared, category: catId, page: 1 };
    });
    setApplied((prev) => {
      const cleared = clearCategoryFields(prev, prev.category);
      return { ...cleared, category: catId, page: 1 };
    });
  };

  const handleSortChange = (newSort) => {
    setDraft((prev) => ({ ...prev, sort: newSort, page: 1 }));
    setApplied((prev) => ({ ...prev, sort: newSort, page: 1 }));
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const val = searchInput.trim();
    setDraft((prev) => ({ ...prev, location: val, locality: val, page: 1 }));
    setApplied((prev) => ({ ...prev, location: val, locality: val, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDraft((prev) => ({ ...prev, location: "", locality: "", page: 1 }));
    setApplied((prev) => ({ ...prev, location: "", locality: "", page: 1 }));
  };

  const apiQuery = useMemo(() => filtersToApiParams(applied), [applied]);

  const listingTitle = useMemo(() => {
    const cat = getCategoryLabel(applied.category);
    const location = applied.location || "Hosur";
    return `${cat} properties in ${location}`;
  }, [applied.category, applied.location]);

  const listingDescription = useMemo(() => {
    const location = applied.location || "Hosur";
    return `Browse ${getCategoryLabel(applied.category).toLowerCase()} property listings in ${location} with advanced filters for budget, BHK, facing, and locality.`;
  }, [applied.category, applied.location]);

  const filterChips = useMemo(() => buildFilterChips(applied), [applied]);

  const dynamicLocations = useMemo(() => {
    const locs = new Set();
    (data.items || []).forEach((item) => {
      if (item.location?.city) locs.add(item.location.city);
      if (item.location?.area) locs.add(item.location.area);
    });
    return Array.from(locs);
  }, [data.items]);

  const loadProperties = useCallback(
    async (query, append = false) => {
      setLoading(!append);
      try {
        const res = await fetchProperties(query, token);
        const refined = clientRefineProperties(res.items || [], applied);
        setData((prev) => ({
          ...res,
          items: append ? [...prev.items, ...refined] : refined,
          total: append ? res.total : refined.length,
        }));
      } catch {
        setData({ items: [], totalPages: 0, page: 1, total: 0 });
      } finally {
        setLoading(false);
      }
    },
    [applied, token]
  );

  useEffect(() => {
    setParams(serializeFiltersToSearchParams(applied), { replace: true });
    loadProperties(apiQuery, applied.page > 1);
  }, [apiQuery, applied.page, loadProperties, setParams]);

  useEffect(() => {
    if (!token) {
      setSavedIds(new Set());
      return;
    }

    fetchSavedProperties(token)
      .then((res) => setSavedIds(new Set((res.items || []).map((item) => item._id))))
      .catch(() => setSavedIds(new Set()));
  }, [token]);

  useEffect(() => {
    const scrollRoot = resultsScrollRef.current;
    if (!scrollRoot || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && data.page < data.totalPages && !loading) {
          setApplied((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      },
      {
        threshold: 0.25,
        root: scrollRoot,
        rootMargin: "120px",
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [data.page, data.totalPages, loading, data.items.length]);

  const handleCategoryChange = (categoryId) => {
    setDraft((prev) => {
      const cleared = clearCategoryFields(prev, prev.category);
      return { ...cleared, category: categoryId, page: 1 };
    });
  };

  const handleFieldChange = (key, value) => {
    if (typeof key === "object" && key !== null) {
      setDraft((prev) => ({ ...prev, ...key }));
      return;
    }
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setApplied({ ...draft, page: 1 });
    setMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setDraft((prev) => clearCategoryFields(prev, prev.category));
  };

  const resetAll = () => {
    const fresh = resetAllFilters();
    setDraft(fresh);
    setApplied(fresh);
    setMobileFilterOpen(false);
  };

  const removeChip = (chip) => {
    const next = removeChipFromState(applied, chip);
    setApplied(next);
    setDraft(next);
  };

  const onSave = useCallback(async (propertyId) => {
    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      return;
    }
    try {
      const res = await toggleSavedProperty(token, { propertyId });
      setSavedIds(new Set(res.savedProperties));
      toast.success("Wishlist updated");
    } catch {
      toast.error("Unable to update wishlist");
    }
  }, [isAuthenticated, token]);

  const openMobileFilters = () => {
    setDraft({ ...applied });
    setMobileFilterOpen(true);
  };

  const openDesktopFilters = () => {
    setDraft({ ...applied });
    setDesktopFilterOpen((prev) => !prev);
  };

  const filterActions = (
    <>
      <button type="button" onClick={applyFilters} className="property-filter-btn-primary w-full">
        {t("filters.apply") || "Apply filters"}
      </button>
      <div className="property-filter-footer-row">
        <button type="button" onClick={clearFilters} className="property-filter-btn-secondary flex-1">
          {t("filters.clear") || "Clear"}
        </button>
        <button type="button" onClick={resetAll} className="property-filter-btn-ghost flex-1">
          {t("filters.resetAll") || "Reset all"}
        </button>
      </div>
    </>
  );

  return (
    <div className="listing-page-root flex min-h-0 flex-1 flex-col w-full bg-white">
      <SeoHead
        title={listingTitle}
        description={listingDescription}
        keywords={`Hosur property listings, ${getCategoryLabel(applied.category)} properties Hosur`}
        canonicalPath={buildCanonicalListingQuery(applied)}
      />

      <div className={`listing-page-layout mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col ${desktopFilterOpen ? "is-sidebar-open" : ""}`}>
        {/* Left: filters — own scrollbar, never tied to properties */}
        <aside className={desktopFilterOpen ? "listing-filter-aside hidden md:flex" : "hidden"} aria-label="Property filters">
          <div className="listing-filter-shell">
            <div className="listing-filter-scroll" data-scroll-panel="filters">
              <PropertySearchFilterPanel
                category={draft.category}
                values={draft}
                onCategoryChange={handleCategoryChange}
                onFieldChange={handleFieldChange}
                extraLocations={dynamicLocations}
              />
            </div>
            <div className="listing-filter-footer">{filterActions}</div>
          </div>
        </aside>

        {/* Right: properties — own scrollbar, independent from filters */}
        <section className="listing-results flex min-h-0 flex-1 flex-col gsap-section" aria-label="Property results">
          <div className="listing-results-header bg-white border-b border-slate-200 px-4 sm:px-6 py-4 space-y-3.5">
            {/* Row 1: Title, Count Badge, Subtitle & Request Property CTA */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange font-sans">
                    {t("search.propertyCategory") || "Property Listings"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/10 px-2.5 py-0.5 text-xs font-bold text-orange font-sans">
                    <BuildingOffice2Icon className="h-3.5 w-3.5" />
                    {loading ? (t("common.loading") || "Loading...") : `${data.total || data.items.length} ${t("search.propertiesFound") || "properties found"}`}
                  </span>
                </div>
                <h1 className="mt-1 font-sans text-2xl sm:text-3xl font-black text-navy tracking-tight leading-tight">
                  {applied.category
                    ? `${getCategoryLabel(applied.category)} Properties in Hosur`
                    : "All Properties in Hosur"}
                </h1>
                <p className="mt-1 font-sans text-xs sm:text-sm text-slate-500 max-w-2xl">
                  {loading
                    ? (t("common.loading") || "Fetching verified properties in Hosur...")
                    : "Explore verified residential, commercial, plots, and rental properties across Hosur with direct contact"}
                </p>
              </div>

              {/* Request for New Property CTA button */}
              <div className="shrink-0 pt-1 md:pt-0">
                <Link
                  to="/request-service?category=property_buy&type=Find%20your%20property"
                  className="h-10 sm:h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-orange bg-orange/10 hover:bg-orange text-orange hover:text-white px-4 text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all duration-200 whitespace-nowrap font-sans leading-none"
                  title="Can't find what you are looking for? Request your custom property requirement"
                >
                  <PropertySearchIcon className="h-4 w-4 shrink-0" />
                  <span>{t("hero.requestNewProperty") || "Request for New Property"}</span>
                </Link>
              </div>
            </div>

            {/* Row 2: Search Input, Sort Dropdown & Filter Button Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              {/* Search Input — with proper 40px left padding to prevent overlap with icon */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search area, locality, or keyword..."
                  className="h-10 sm:h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white py-0 pl-10 pr-9 text-xs sm:text-sm font-medium text-navy placeholder:text-slate-400 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/15 transition-all font-sans"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy cursor-pointer p-0.5"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </form>

              {/* Sort & Filter Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Sort Dropdown */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={applied.sort || "latest"}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="h-10 sm:h-11 w-full sm:w-auto appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-3.5 pr-9 text-xs sm:text-sm font-semibold text-navy shadow-xs hover:border-slate-300 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/15 cursor-pointer transition-all font-sans"
                    aria-label="Sort properties"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>

                {/* Desktop Filter Button */}
                <button
                  type="button"
                  onClick={openDesktopFilters}
                  className={`hidden md:inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 cursor-pointer whitespace-nowrap font-sans leading-none ${
                    desktopFilterOpen
                      ? "border-orange bg-orange text-white shadow-sm"
                      : "border-slate-200 bg-white text-navy hover:border-orange hover:text-orange hover:bg-orange/5"
                  }`}
                  aria-label={desktopFilterOpen ? "Close filters sidebar" : "Open filters sidebar"}
                  title={desktopFilterOpen ? "Close filters" : "Filter properties"}
                  aria-expanded={desktopFilterOpen}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 shrink-0" />
                  <span>Filters</span>
                  {filterChips.length ? (
                    <span className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] font-black px-1 ${desktopFilterOpen ? "bg-white text-orange" : "bg-orange text-white"}`}>
                      {filterChips.length}
                    </span>
                  ) : null}
                </button>

                {/* Mobile Filter Button */}
                <button
                  type="button"
                  onClick={openMobileFilters}
                  className="inline-flex md:hidden h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-navy shadow-xs hover:border-orange hover:text-orange transition-all cursor-pointer whitespace-nowrap font-sans leading-none"
                  aria-label="Open filters"
                  title="Filter properties"
                  aria-expanded={mobileFilterOpen}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 shrink-0" />
                  <span>Filters</span>
                  {filterChips.length ? (
                    <span className="inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white px-1">
                      {filterChips.length}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>

            {/* Row 3: Quick Category Navigation Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {QUICK_CATEGORIES.map((cat) => {
                const isSelected = (applied.category || "") === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id || "all"}
                    type="button"
                    onClick={() => handleQuickCategoryChange(cat.id)}
                    className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap font-sans ${
                      isSelected
                        ? "bg-navy text-white shadow-sm ring-2 ring-navy/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-orange hover:text-orange hover:bg-orange/5 shadow-2xs"
                    }`}
                  >
                    {Icon ? (
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${isSelected ? "text-orange" : "text-slate-400"}`} />
                    ) : null}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 4: Active Filter Chips */}
            {filterChips.length ? (
              <div className="listing-results-chips flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 mr-1">Active filters:</span>
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip)}
                    className="inline-flex items-center gap-1 rounded-lg border border-orange/30 bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-orange hover:bg-orange hover:text-white transition-all cursor-pointer font-sans"
                  >
                    <span>{chip.label}: {chip.value}</span>
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs font-bold text-slate-500 hover:text-red-500 underline ml-1 cursor-pointer transition-colors font-sans"
                >
                  Clear all
                </button>
              </div>
            ) : null}
          </div>

          <div
            ref={resultsScrollRef}
            className="listing-results-scroll min-h-0 flex-1"
            data-scroll-panel="properties"
          >
            <div className="listing-results-scroll-inner">
            <div className="mt-4 md:mt-6">
              {loading && !data.items.length ? (
                <ListingSkeleton isSidebarOpen={desktopFilterOpen} />
              ) : data.items.length ? (
                <div className={`grid gap-6 ${desktopFilterOpen ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"}`}>
                  {data.items.map((item) => (
                    <PropertyCard key={item._id} item={item} onSave={onSave} isSaved={savedIds.has(item._id)} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-surface px-6 py-16 text-center">
                  <h3 className="text-xl font-bold text-navy">{t("search.noResults") || "No properties found"}</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                    {t("search.tryAdjusting") || "Didn't find what you're looking for? Submit your property requirement and our Hosur team will help you find the right match."}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/request-service?category=property_buy&type=Find%20your%20property"
                      className="site-button-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
                    >
                      <PropertySearchIcon className="h-4 w-4" />
                      <span>{t("hero.requestNewProperty") || "Request for Property"}</span>
                    </Link>
                    <button type="button" onClick={resetAll} className="site-button-secondary px-5 py-3 text-sm font-bold">
                      {t("filters.resetAll") || "Reset all filters"}
                    </button>
                  </div>
                </div>
              )}
            </div>

              <div ref={sentinelRef} className="py-8 text-center text-sm text-slate-400">
                {loading && data.items.length ? (t("common.loading") || "Loading...") : null}
                {!loading && data.page < data.totalPages ? (t("common.loadingMore") || "Loading more properties...") : null}
                {!loading && data.items.length && data.page >= data.totalPages ? (t("common.endOfResults") || "You have reached the end of the results.") : null}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile: filters slide in from the left; properties stay visible behind backdrop */}
      {mobileFilterOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="property-filter-drawer-root md:hidden" role="dialog" aria-modal="true" aria-label="Property filters">
              <button
                type="button"
                className="property-filter-drawer-backdrop"
                aria-label="Close filters"
                onClick={() => setMobileFilterOpen(false)}
              />
              <aside className="property-filter-drawer">
                <div className="property-filter-drawer-header">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Filters</p>
                    <h2 className="text-lg font-bold text-navy">Search your property</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="property-filter-drawer-close"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="property-filter-drawer-body">
                  <PropertySearchFilterPanel
                    category={draft.category}
                    values={draft}
                    onCategoryChange={handleCategoryChange}
                    onFieldChange={handleFieldChange}
                    extraLocations={dynamicLocations}
                  />
                </div>
                <div className="property-filter-drawer-footer listing-filter-footer">{filterActions}</div>
              </aside>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default ListingPage;
