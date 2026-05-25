import {
  PROPERTY_FILTER_CATEGORIES,
  SORT_OPTIONS,
  getCategoryFieldKeys,
  propertyFilterConfig,
} from "../constants/propertyFilterConfig";

export const DEFAULT_CATEGORY = "buy";
export const DEFAULT_SORT = "latest";

const META_KEYS = ["category", "sort", "page", "limit"];

export const createDefaultFilterState = (overrides = {}) => ({
  category: DEFAULT_CATEGORY,
  sort: DEFAULT_SORT,
  page: 1,
  limit: 12,
  ...overrides,
});

/** Parse comma-separated multi values */
export const splitValues = (value) => {
  if (!value || typeof value !== "string") return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
};

export const joinValues = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join(",") : "");

/** Get value for a field from flat filter state */
export const getFieldValue = (state, key) => state[key] ?? "";

/** Toggle checkbox value in state */
export const toggleCheckboxValue = (current, option) => {
  const list = splitValues(current);
  const idx = list.indexOf(option);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(option);
  return joinValues(list);
};

/** Clear only fields belonging to a category */
export const clearCategoryFields = (state, categoryId) => {
  const next = { ...state, page: 1 };
  getCategoryFieldKeys(categoryId).forEach((key) => {
    delete next[key];
  });
  return next;
};

/** Reset entire filter state */
export const resetAllFilters = () => createDefaultFilterState();

/** Legacy URL params (intent, propertyType from homepage) → new state */
export const parseLegacyParams = (params) => {
  const state = createDefaultFilterState();
  const intent = params.get("intent");
  const propertyType = params.get("propertyType");

  if (intent === "rent") state.category = "rentLease";
  else if (intent === "buy" || intent === "new-project") state.category = "buy";

  if (propertyType) {
    const normalized = propertyType.trim();
    if (/agricultural|agri/i.test(normalized)) state.category = "agricultural";
    else if (/commercial/i.test(normalized)) state.category = "commercial";
    else if (/individual house/i.test(normalized)) state.category = "individualHouse";
    else if (/apartment|flat/i.test(normalized)) state.category = "apartment";
    else if (state.category === "buy") state.propertyType = normalized;
    else if (state.category === "rentLease") state.propertyType = normalized;
  }

  if (params.get("city")) state.location = params.get("city");
  if (params.get("area") && !state.location) state.location = params.get("area");
  if (params.get("search")) state.location = params.get("search");
  if (params.get("furnishingStatus")) state.furnishing = params.get("furnishingStatus");
  if (params.get("minBhk")) state.bhk = `${params.get("minBhk")} BHK`;
  if (params.get("minPrice")) state.minPrice = params.get("minPrice");
  if (params.get("maxPrice")) state.maxPrice = params.get("maxPrice");

  const legacySort = params.get("sort");
  if (legacySort === "-createdAt") state.sort = "latest";
  else if (legacySort === "price") state.sort = "priceLowHigh";
  else if (legacySort === "-price") state.sort = "priceHighLow";
  else if (legacySort === "rank") state.sort = "nearbyFirst";

  return state;
};

/** Parse URLSearchParams into filter state */
export const parseFiltersFromSearchParams = (params) => {
  let state = createDefaultFilterState();

  if (params.get("category")) {
    state.category = params.get("category") || DEFAULT_CATEGORY;
  } else if (params.get("intent") || params.get("propertyType")) {
    state = { ...state, ...parseLegacyParams(params) };
  }

  if (params.get("sort")) state.sort = params.get("sort") || DEFAULT_SORT;
  if (params.get("page")) state.page = Number(params.get("page")) || 1;

  const fieldKeys = getCategoryFieldKeys(state.category);
  [...fieldKeys, "minPrice", "maxPrice", "minRent", "maxRent", "minLease", "maxLease"].forEach((key) => {
    const val = params.get(key);
    if (val != null && val !== "") state[key] = val;
  });

  return state;
};

/** Serialize filter state to URLSearchParams (applied filters only) */
export const serializeFiltersToSearchParams = (state) => {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  const fieldKeys = getCategoryFieldKeys(state.category);
  fieldKeys.forEach((key) => {
    const val = state[key];
    if (val != null && val !== "") params.set(key, String(val));
  });

  ["minPrice", "maxPrice", "minRent", "maxRent", "minLease", "maxLease"].forEach((key) => {
    if (state[key]) params.set(key, String(state[key]));
  });

  return params;
};

const mapBuyPropertyType = (type) => {
  const map = {
    "Commercial Building": "Commercial",
    "Commercial Land": "Commercial Land",
    "Agricultural Land": "Agricultural Land",
    Apartment: "Apartment",
    Flat: "Flat",
  };
  return map[type] || type;
};

/** Convert applied filters to API query object */
export const filtersToApiParams = (state) => {
  const sortOption = SORT_OPTIONS.find((s) => s.id === state.sort) || SORT_OPTIONS[0];
  const params = {
    category: state.category,
    sort: sortOption.apiSort,
    page: state.page || 1,
    limit: state.limit || 12,
  };

  const location = getFieldValue(state, "location");
  if (location) {
    params.city = location;
    params.area = location;
    params.search = location;
  }

  const category = state.category;

  if (category === "buy") {
    params.intent = "buy";
    const types = splitValues(state.propertyType).map(mapBuyPropertyType);
    if (types.length) params.propertyType = types.join(",");
  } else if (category === "rentLease") {
    params.intent = "rent";
    const types = splitValues(state.propertyType);
    if (types.length) params.propertyType = types.join(",");
    if (state.minRent) params.minPrice = state.minRent;
    if (state.maxRent) params.maxPrice = state.maxRent;
    if (state.minLease) params.minPrice = state.minLease;
    if (state.maxLease) params.maxPrice = state.maxLease;
  } else if (category === "commercial") {
    params.intent = "buy";
    params.propertyType = "Commercial Land / Building,Commercial Land,Commercial,Office,Warehouse";
  } else if (category === "agricultural") {
    params.intent = "buy";
    params.propertyType = "Agricultural Land,Agri Land";
  } else if (category === "individualHouse") {
    params.intent = "buy";
    params.propertyType = "Individual House";
  } else if (category === "apartment") {
    params.intent = "buy";
    params.propertyType = "Apartment,Flat";
  }

  if (state.minPrice && category !== "rentLease") params.minPrice = state.minPrice;
  if (state.maxPrice && category !== "rentLease") params.maxPrice = state.maxPrice;

  const facing = splitValues(state.facing);
  if (facing.length) params.facing = facing.join(",");

  const bhkList = splitValues(state.bhk);
  if (bhkList.length) params.bhk = bhkList.join(",");

  const furnishing = splitValues(state.furnishing);
  if (furnishing.length === 1) {
    const f = furnishing[0].replace("Semi Furnished", "Semi-Furnished");
    params.furnishingStatus = f;
  }

  const amenityHints = [
    ...splitValues(state.nearbyPlaces),
    ...splitValues(state.purpose),
    ...splitValues(state.lift).map((v) => (v === "Yes" ? "Lift" : "")),
    ...splitValues(state.security).map((v) => (v === "Yes" ? "Security" : "")),
    ...splitValues(state.waterSource),
    ...splitValues(state.landCondition),
    ...splitValues(state.layoutType),
  ].filter(Boolean);

  if (amenityHints.length) params.amenities = amenityHints.join(",");

  const textHints = [
    ...splitValues(state.distance),
    ...splitValues(state.roadSize),
    ...splitValues(state.roadType),
    ...splitValues(state.buildingAge),
    ...splitValues(state.monthlyIncome),
    ...splitValues(state.acres),
    ...splitValues(state.pricePerAcre),
    ...splitValues(state.houseType),
    ...splitValues(state.landArea),
    ...splitValues(state.builtUpArea),
    ...splitValues(state.rentAdvance),
    ...splitValues(state.floors),
    ...splitValues(state.units),
    ...splitValues(state.toilet).map((t) => `${t} bathroom`),
  ].filter(Boolean);

  if (textHints.length) {
    params.filterTags = textHints.join(",");
    params.search = [params.search, ...textHints].filter(Boolean).join(" ");
  }

  Object.keys(params).forEach((key) => {
    if (params[key] === "" || params[key] == null) delete params[key];
  });

  if (params.page === 1) delete params.page;
  if (params.limit === 12) delete params.limit;

  return params;
};

/** Human-readable label for a field value */
const formatFieldLabel = (field, value) => {
  if (!value) return "";
  if (field.type === "rangePresets") {
    const min = value.minPrice || value.minRent || value.minLease;
    const max = value.maxPrice || value.maxRent || value.maxLease;
    if (min && max) return `₹${(Number(min) / 100000).toFixed(1)}L - ₹${(Number(max) / 100000).toFixed(1)}L`;
    if (min) return `From ₹${(Number(min) / 100000).toFixed(1)}L`;
    return "";
  }
  return String(value);
};

/** Build removable filter chips from applied state */
export const buildFilterChips = (state) => {
  const chips = [];
  const fields = propertyFilterConfig[state.category] || [];

  fields.forEach((field) => {
    if (field.type === "rangePresets") {
      const min = state[field.minKey];
      const max = state[field.maxKey];
      if (min || max) {
        chips.push({
          key: field.key,
          fieldKey: field.key,
          label: field.label,
          value: formatFieldLabel(field, state),
          removeKeys: [field.minKey, field.maxKey],
        });
      }
      return;
    }

    const raw = getFieldValue(state, field.key);
    if (!raw) return;

    splitValues(raw).forEach((part) => {
      chips.push({
        key: `${field.key}-${part}`,
        fieldKey: field.key,
        part,
        label: field.label,
        value: part,
      });
    });
  });

  return chips;
};

/** Remove one chip from state */
export const removeChipFromState = (state, chip) => {
  const next = { ...state, page: 1 };
  if (chip.removeKeys) {
    chip.removeKeys.forEach((k) => delete next[k]);
    return next;
  }
  const current = splitValues(next[chip.fieldKey]);
  const filtered = current.filter((v) => v !== chip.part);
  if (filtered.length) next[chip.fieldKey] = joinValues(filtered);
  else delete next[chip.fieldKey];
  return next;
};

/** Client-side refinement when API returns broader results */
export const clientRefineProperties = (items, state) => {
  if (!items?.length) return items;

  let result = [...items];
  const location = getFieldValue(state, "location").toLowerCase();
  if (location) {
    result = result.filter((item) => {
      const hay = `${item.location?.city || ""} ${item.location?.area || ""} ${item.title || ""}`.toLowerCase();
      return hay.includes(location);
    });
  }

  const facingList = splitValues(state.facing);
  if (facingList.length) {
    result = result.filter((item) => facingList.some((f) => String(item.facing || "").toLowerCase().includes(f.toLowerCase())));
  }

  const bhkList = splitValues(state.bhk).map((b) => Number(String(b).replace(/\D/g, ""))).filter(Boolean);
  if (bhkList.length) {
    result = result.filter((item) => bhkList.includes(Number(item.bhk)));
  }

  const tags = splitValues(state.filterTags || "").join(" ").toLowerCase();
  if (tags) {
    result = result.filter((item) => {
      const hay = `${item.description || ""} ${(item.amenities || []).join(" ")} ${(item.nearbyFacilities || []).join(" ")}`.toLowerCase();
      return tags.split(/\s+/).some((t) => t && hay.includes(t));
    });
  }

  return result;
};

export const getCategoryLabel = (id) => PROPERTY_FILTER_CATEGORIES.find((c) => c.id === id)?.label || id;
