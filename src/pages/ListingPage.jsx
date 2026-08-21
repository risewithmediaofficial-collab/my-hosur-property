import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AdjustmentsHorizontalIcon, PropertySearchIcon, XMarkIcon } from "../components/AppIcons";
import PropertyCard from "../components/PropertyCard";
import PropertySearchFilterPanel from "../components/PropertySearchFilterPanel";
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

const ListingPage = () => {
  const [params, setParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(() => parseFiltersFromSearchParams(params));
  const [applied, setApplied] = useState(() => parseFiltersFromSearchParams(params));
  const [data, setData] = useState({ items: [], totalPages: 0, page: 1, total: 0 });
  const [savedIds, setSavedIds] = useState([]);

  useScrollAnimation([data.items]);
  const sentinelRef = useRef(null);
  const resultsScrollRef = useRef(null);

  useBodyScrollLock(mobileFilterOpen);

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
      setSavedIds([]);
      return;
    }

    fetchSavedProperties(token)
      .then((res) => setSavedIds((res.items || []).map((item) => item._id)))
      .catch(() => setSavedIds([]));
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
        Apply filters
      </button>
      <div className="property-filter-footer-row">
        <button type="button" onClick={clearFilters} className="property-filter-btn-secondary flex-1">
          Clear
        </button>
        <button type="button" onClick={resetAll} className="property-filter-btn-ghost flex-1">
          Reset all
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
          <div className="listing-results-header">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="listing-results-intro gsap-hero-item">
                <p className="section-tag">Property listings</p>
                <h1 className="mt-1.5 text-2xl font-bold text-navy sm:text-3xl">Search your property in Hosur</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {loading ? "Searching properties..." : `${data.total || data.items.length} properties found`}
                  {applied.category ? ` · ${getCategoryLabel(applied.category)}` : ""}
                </p>
              </div>

              {/* Action Buttons: Request Property + Filter Icon */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  to="/request-service?category=property_buy&type=Find%20your%20property"
                  className="inline-flex h-[2.65rem] items-center gap-2 rounded-xl border border-orange bg-orange/10 px-4 text-xs font-bold text-orange shadow-xs transition-all duration-200 hover:bg-orange hover:text-white sm:text-sm hover:shadow-md hover:-translate-y-0.5"
                  title="Can't find what you are looking for? Request your custom property requirement"
                >
                  <PropertySearchIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Request for New Property</span>
                </Link>

                <button
                  type="button"
                  onClick={openDesktopFilters}
                  className={`property-filter-toggle-icon-btn hidden md:inline-flex ${desktopFilterOpen ? "is-active" : ""}`}
                  aria-label={desktopFilterOpen ? "Close filters sidebar" : "Open filters sidebar"}
                  title={desktopFilterOpen ? "Close filters" : "Filter properties"}
                  aria-expanded={desktopFilterOpen}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  {filterChips.length ? <span className="property-filter-badge-dot">{filterChips.length}</span> : null}
                </button>
                <button
                  type="button"
                  onClick={openMobileFilters}
                  className="property-filter-toggle-icon-btn inline-flex md:hidden"
                  aria-label="Open filters"
                  title="Filter properties"
                  aria-expanded={mobileFilterOpen}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  {filterChips.length ? <span className="property-filter-badge-dot">{filterChips.length}</span> : null}
                </button>
              </div>
            </div>

            {filterChips.length ? (
              <div className="listing-results-chips mt-3">
                {filterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => removeChip(chip)}
                    className="property-filter-chip"
                  >
                    {chip.label}: {chip.value}
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ))}
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
                    <PropertyCard key={item._id} item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-surface px-6 py-16 text-center">
                  <h3 className="text-xl font-bold text-navy">No properties found</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                    Didn't find what you're looking for? Submit your property requirement and our Hosur team will help you find the right match.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/request-service?category=property_buy&type=Find%20your%20property"
                      className="site-button-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-bold"
                    >
                      <PropertySearchIcon className="h-4 w-4" />
                      <span>Request for Property</span>
                    </Link>
                    <button type="button" onClick={resetAll} className="site-button-secondary px-5 py-3 text-sm font-bold">
                      Reset all filters
                    </button>
                  </div>
                </div>
              )}
            </div>

              <div ref={sentinelRef} className="py-8 text-center text-sm text-slate-400">
                {loading && data.items.length ? "Loading..." : null}
                {!loading && data.page < data.totalPages ? "Loading more properties..." : null}
                {!loading && data.items.length && data.page >= data.totalPages ? "You have reached the end of the results." : null}
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
