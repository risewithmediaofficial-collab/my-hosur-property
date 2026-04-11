const FilterSidebar = ({ filters, setFilters, clearFilters }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <aside className="glass-panel space-y-4 rounded-2xl border border-white/70 bg-white/60 p-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-ink/80">Filters</h3>
      <input
        className="soft-input w-full rounded-lg px-3 py-2 text-sm"
        placeholder="City"
        value={filters.city}
        onChange={(e) => update("city", e.target.value)}
      />
      <input
        className="soft-input w-full rounded-lg px-3 py-2 text-sm"
        placeholder="Area"
        value={filters.area}
        onChange={(e) => update("area", e.target.value)}
      />
      <select className="soft-input w-full rounded-lg px-3 py-2 text-sm" value={filters.propertyType} onChange={(e) => update("propertyType", e.target.value)}>
        <option value="">Property Type</option>
        <option>Apartment</option>
        <option>Villa</option>
        <option>Independent House</option>
        <option>Plot</option>
        <option>Commercial</option>
      </select>
      <select className="soft-input w-full rounded-lg px-3 py-2 text-sm" value={filters.furnishingStatus} onChange={(e) => update("furnishingStatus", e.target.value)}>
        <option value="">Furnishing</option>
        <option>Furnished</option>
        <option>Semi-Furnished</option>
        <option>Unfurnished</option>
      </select>
      <div>
        <p className="text-xs font-semibold text-ink/70 mb-1 ml-1">BHK Range</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" placeholder="Min BHK" value={filters.minBhk} onChange={(e) => update("minBhk", e.target.value)} />
          <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" placeholder="Max BHK" value={filters.maxBhk} onChange={(e) => update("maxBhk", e.target.value)} />
        </div>
      </div>
      <select className="soft-input w-full rounded-lg px-3 py-2 text-sm" value={filters.possessionStatus} onChange={(e) => update("possessionStatus", e.target.value)}>
        <option value="">Possession</option>
        <option>Ready to Move</option>
        <option>Under Construction</option>
      </select>
      <select className="soft-input w-full rounded-lg px-3 py-2 text-sm" value={filters.listingSource} onChange={(e) => update("listingSource", e.target.value)}>
        <option value="">Listing Source</option>
        <option value="owner">Owner</option>
        <option value="builder">Builder</option>
        <option value="agent">Agent/Broker</option>
      </select>
      <label className="soft-input flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
        <input type="checkbox" checked={filters.verified === "true"} onChange={(e) => update("verified", e.target.checked ? "true" : "")} />
        Verified Listings Only
      </label>
      <input
        className="soft-input w-full rounded-lg px-3 py-2 text-sm"
        placeholder="Amenities (comma-separated)"
        value={filters.amenities}
        onChange={(e) => update("amenities", e.target.value)}
      />
      <div>
        <p className="text-xs font-semibold text-ink/70 mb-1 ml-1">Pricing Range (Rs)</p>
        <div className="grid grid-cols-2 gap-2">
          <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} />
          <input className="soft-input rounded-lg px-3 py-2 text-sm" type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} />
        </div>
      </div>
      <select className="soft-input w-full rounded-lg px-3 py-2 text-sm" value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
        <option value="rank">Best Match</option>
        <option value="-createdAt">Newest</option>
        <option value="price">Price Low to High</option>
        <option value="-price">Price High to Low</option>
      </select>
      <button onClick={clearFilters} className="neo-btn w-full rounded-lg py-2 text-sm font-semibold text-ink/80">
        Clear
      </button>
    </aside>
  );
};

export default FilterSidebar;
