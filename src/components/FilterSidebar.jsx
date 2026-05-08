const inputClass = "site-input";

const FilterSidebar = ({ filters, setFilters, clearFilters }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Refine search</p>
        <h3 className="mt-2 text-lg font-bold text-slate-900">Property filters</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">City</label>
          <input className={inputClass} placeholder="Enter city" value={filters.city} onChange={(e) => update("city", e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Area</label>
          <input className={inputClass} placeholder="Enter locality or area" value={filters.area} onChange={(e) => update("area", e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Property type</label>
          <select className={inputClass} value={filters.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
            <option value="">All property types</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Independent House</option>
            <option>Plot</option>
            <option>Commercial</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Furnishing</label>
          <select className={inputClass} value={filters.furnishingStatus} onChange={(e) => update("furnishingStatus", e.target.value)}>
            <option value="">Any furnishing</option>
            <option>Furnished</option>
            <option>Semi-Furnished</option>
            <option>Unfurnished</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">BHK range</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              type="number"
              placeholder="Min"
              value={filters.minBhk}
              onChange={(e) => update("minBhk", e.target.value)}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Max"
              value={filters.maxBhk}
              onChange={(e) => update("maxBhk", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Possession</label>
          <select className={inputClass} value={filters.possessionStatus} onChange={(e) => update("possessionStatus", e.target.value)}>
            <option value="">Any possession</option>
            <option>Ready to Move</option>
            <option>Under Construction</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Listing source</label>
          <select className={inputClass} value={filters.listingSource} onChange={(e) => update("listingSource", e.target.value)}>
            <option value="">Any source</option>
            <option value="owner">Owner</option>
            <option value="builder">Builder</option>
            <option value="agent">Agent/Broker</option>
          </select>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.verified === "true"}
            onChange={(e) => update("verified", e.target.checked ? "true" : "")}
            className="h-4 w-4 rounded border-slate-300"
          />
          Verified listings only
        </label>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Amenities</label>
          <input
            className={inputClass}
            placeholder="Parking, lift, security"
            value={filters.amenities}
            onChange={(e) => update("amenities", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price range (Rs)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Sort by</label>
          <select className={inputClass} value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
            <option value="rank">Best match</option>
            <option value="-createdAt">Newest</option>
            <option value="price">Price low to high</option>
            <option value="-price">Price high to low</option>
          </select>
        </div>
      </div>

      <button type="button" onClick={clearFilters} className="site-button-secondary w-full px-4 py-3 text-sm">
        Clear filters
      </button>
    </div>
  );
};

export default FilterSidebar;
