import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import FilterSidebar from "../components/FilterSidebar";
import { fetchProperties } from "../services/api/propertyApi";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { toggleSavedProperty } from "../services/api/userApi";
import toast from "react-hot-toast";

const ListingPage = () => {
  const [params, setParams] = useSearchParams();
  const { token, isAuthenticated } = useAuth();
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
    Object.keys(out).forEach((k) => {
      if (out[k] === "") delete out[k];
    });
    return out;
  }, [debounced]);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => searchParams.set(k, String(v)));
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Filter Sidebar */}
      <div className="hidden md:block w-80 bg-white border-r border-clay/60 p-4 shadow-sm fixed h-screen top-0 left-0 overflow-y-auto">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          clearFilters={() =>
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
          })
        }
        />
      </div>

      {/* Main Content */}
      <section className="md:ml-80 w-full overflow-y-auto h-screen bg-gray-50 py-8 px-4 md:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Property Listings</h1>
          <p className="text-sm text-ink/65">{data.total || data.items.length} properties</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item) => (
            <PropertyCard key={item._id} item={item} onSave={onSave} isSaved={savedIds.includes(item._id)} />
          ))}
        </div>

        <div ref={sentinelRef} className="py-6 text-center text-xs text-ink/50">
          {data.page < data.totalPages ? "Loading more..." : "No more properties"}
        </div>
      </section>
    </div>
  );
};

export default ListingPage;
