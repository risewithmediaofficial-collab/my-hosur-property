import {
  PROPERTY_FILTER_CATEGORIES,
  SORT_OPTIONS,
  getCategoryFieldKeys,
  propertyFilterConfig,
} from "../constants/propertyFilterConfig";

export const DEFAULT_CATEGORY = "";
export const DEFAULT_SORT = "latest";

export const createDefaultFilterState = (overrides = {}) => ({
  category: DEFAULT_CATEGORY,
  sort: DEFAULT_SORT,
  page: 1,
  limit: 12,
  country: "",
  state: "",
  district: "",
  taluk: "",
  village: "",
  locality: "",
  location: "",
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

const expandFacingAliases = (facing) => {
  const aliases = {
    "East North": ["East North", "North East", "North-East"],
    "North East": ["East North", "North East", "North-East"],
    "North-East": ["East North", "North East", "North-East"],
    "South West": ["South West", "South-West"],
    "South-West": ["South West", "South-West"],
  };
  return aliases[facing] || [facing];
};

/** Clear only fields belonging to a category */
export const clearCategoryFields = (state, categoryId) => {
  const next = { ...state, page: 1 };
  getCategoryFieldKeys(categoryId).forEach((key) => {
    if (!["country", "state", "district", "taluk", "village", "locality", "location"].includes(key)) {
      delete next[key];
    }
  });
  return next;
};

/** Reset entire filter state */
export const resetAllFilters = () => createDefaultFilterState();

/** Legacy URL params → new state */
export const parseLegacyParams = (params) => {
  const state = createDefaultFilterState();
  const intent = params.get("intent");
  const propertyType = params.get("propertyType");

  if (intent === "rent") state.category = "houseRent";
  else if (intent === "buy" || intent === "new-project") state.category = "plot";

  if (propertyType) {
    const normalized = propertyType.trim().toLowerCase();
    if (normalized.includes("plot")) state.category = "plot";
    else if (normalized.includes("agri")) state.category = "agricultural";
    else if (normalized.includes("farm")) state.category = "farmland";
    else if (normalized.includes("villa")) state.category = "villa";
    else if (normalized.includes("individual house") || normalized.includes("independent")) state.category = "individualHouse";
    else if (normalized.includes("rent")) state.category = "houseRent";
    else if (normalized.includes("commercial")) state.category = "commercial";
    else if (normalized.includes("apartment") || normalized.includes("flat")) state.category = "apartment";
  }

  if (params.get("city")) state.locality = params.get("city");
  if (params.get("area") && !state.locality) state.locality = params.get("area");
  if (params.get("search")) state.locality = params.get("search");
  if (params.get("minPrice")) state.minPrice = params.get("minPrice");
  if (params.get("maxPrice")) state.maxPrice = params.get("maxPrice");
  if (params.get("facing")) state.facing = params.get("facing");

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

  // Location fields
  ["country", "state", "district", "taluk", "village", "locality", "location"].forEach((key) => {
    const val = params.get(key);
    if (val != null && val !== "") state[key] = val;
  });

  const fieldKeys = getCategoryFieldKeys(state.category);
  [
    ...fieldKeys,
    "minPrice",
    "maxPrice",
    "minRent",
    "maxRent",
    "length",
    "width",
    "maintenanceAmount",
    "maintenanceStatus",
    "approval",
  ].forEach((key) => {
    const val = params.get(key);
    if (val != null && val !== "") state[key] = val;
  });

  // Ignore a default India country filter when no other location criteria are applied,
  // so /listings shows all properties unless the user actually selects a specific location.
  if (
    state.country === "India" &&
    !state.state &&
    !state.district &&
    !state.taluk &&
    !state.village &&
    !state.locality &&
    !state.location
  ) {
    state.country = "";
  }

  return state;
};

/** Serialize filter state to URLSearchParams */
export const serializeFiltersToSearchParams = (state) => {
  const params = new URLSearchParams();
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  const locationKeys = ["country", "state", "district", "taluk", "village", "locality", "location"];
  locationKeys.forEach((key) => {
    if (state[key]) params.set(key, String(state[key]));
  });

  const fieldKeys = getCategoryFieldKeys(state.category);
  fieldKeys.forEach((key) => {
    const val = state[key];
    if (val != null && val !== "") params.set(key, String(val));
  });

  [
    "minPrice",
    "maxPrice",
    "minRent",
    "maxRent",
    "length",
    "width",
    "maintenanceAmount",
    "maintenanceStatus",
    "approval",
  ].forEach((key) => {
    if (state[key]) params.set(key, String(state[key]));
  });

  return params;
};

/** Convert applied filters to API query object */
export const filtersToApiParams = (state) => {
  const sortOption = SORT_OPTIONS.find((s) => s.id === state.sort) || SORT_OPTIONS[0];
  const params = {
    sort: sortOption.apiSort,
    page: state.page || 1,
    limit: state.limit || 12,
  };
  if (state.category) params.category = state.category;

  const loc = state.locality || state.village || state.taluk || state.district || state.location || "";
  if (loc) {
    params.city = loc;
    params.area = loc;
    params.search = loc;
  }

  if (state.country) params.country = state.country;
  if (state.state) params.state = state.state;
  if (state.district) params.district = state.district;
  if (state.taluk) params.taluk = state.taluk;
  if (state.village) params.village = state.village;

  const category = state.category;

  if (category === "plot") {
    params.intent = "buy";
    params.propertyType = "Plot";
  } else if (category === "agricultural") {
    params.intent = "buy";
    params.propertyType = "Agricultural Land,Agri Land";
  } else if (category === "plotRent") {
    params.intent = "rent";
    params.propertyType = "Plot";
    if (state.minRent) params.minPrice = state.minRent;
    if (state.maxRent) params.maxPrice = state.maxRent;
  } else if (category === "farmland") {
    params.intent = "buy";
    params.propertyType = "Farmland,Agricultural Land,Agri Land";
  } else if (category === "villa") {
    params.intent = "buy";
    params.propertyType = "Villa";
  } else if (category === "individualHouse") {
    params.intent = "buy";
    params.propertyType = "Individual House,Independent House";
  } else if (category === "houseRent") {
    params.intent = "rent";
    params.propertyType = "House,Individual House,Apartment,Flat";
    if (state.minRent) params.minPrice = state.minRent;
    if (state.maxRent) params.maxPrice = state.maxRent;
  } else if (category === "apartment" || category === "flat") {
    params.intent = "buy";
    params.propertyType = "Apartment,Flat";
  } else if (category === "commercial") {
    params.intent = "buy";
    params.propertyType = "Commercial Land / Building,Commercial Land,Commercial";
  } else if (category === "buy") {
    params.intent = "buy";
  } else if (category === "rentLease") {
    params.intent = "rent";
  }

  if (state.minPrice && category !== "houseRent" && category !== "plotRent") {
    params.minPrice = state.minPrice;
  }
  if (state.maxPrice && category !== "houseRent" && category !== "plotRent") {
    params.maxPrice = state.maxPrice;
  }

  const facing = state.facing || getFieldValue(state, "facing");
  if (facing) params.facing = facing;

  const bhkList = splitValues(state.bhk);
  if (bhkList.length) params.bhk = bhkList.join(",");

  const approvalList = splitValues(state.approval);
  if (approvalList.includes("RERA Approved")) {
    params.verified = "true";
  }

  const textHints = [
    ...splitValues(state.landArea),
    ...splitValues(state.plotType),
    ...splitValues(state.carParking).map((p) => `${p} parking`),
    ...splitValues(state.waterSource),
    ...approvalList,
    state.length ? `Length ${state.length}` : "",
    state.width ? `Width ${state.width}` : "",
  ].filter(Boolean);

  if (textHints.length) {
    params.filterTags = textHints.join(",");
  }

  Object.keys(params).forEach((key) => {
    if (params[key] === "" || params[key] == null) delete params[key];
  });

  if (params.page === 1) delete params.page;
  if (params.limit === 12) delete params.limit;

  return params;
};

/** Build removable filter chips from applied state */
export const buildFilterChips = (state) => {
  const chips = [];
  const fields = propertyFilterConfig[state.category] || [];

  // Location chips
  if (state.country && state.country !== "India") {
    chips.push({
      key: "country",
      fieldKey: "country",
      label: "Country",
      value: state.country,
      removeKeys: ["country"],
    });
  }
  if (state.state) {
    chips.push({
      key: "state",
      fieldKey: "state",
      label: "State",
      value: state.state,
      removeKeys: ["state"],
    });
  }
  if (state.district) {
    chips.push({
      key: "district",
      fieldKey: "district",
      label: "District",
      value: state.district,
      removeKeys: ["district"],
    });
  }
  if (state.taluk) {
    chips.push({
      key: "taluk",
      fieldKey: "taluk",
      label: "Taluk",
      value: state.taluk,
      removeKeys: ["taluk"],
    });
  }
  if (state.village) {
    chips.push({
      key: "village",
      fieldKey: "village",
      label: "Village",
      value: state.village,
      removeKeys: ["village"],
    });
  }
  if (state.locality) {
    chips.push({
      key: "locality",
      fieldKey: "locality",
      label: "Locality",
      value: state.locality,
      removeKeys: ["locality", "location"],
    });
  } else if (!state.village && state.location) {
    chips.push({
      key: "location",
      fieldKey: "location",
      label: "Search",
      value: state.location,
      removeKeys: ["location"],
    });
  }

  fields.forEach((field) => {
    if (field.type === "rangePresets") {
      const min = state[field.minKey];
      const max = state[field.maxKey];
      if (min || max) {
        let labelText = "";
        if (min && max) labelText = `₹${(Number(min) / 100000).toFixed(1)}L - ₹${(Number(max) / 100000).toFixed(1)}L`;
        else if (min) labelText = `From ₹${(Number(min) / 100000).toFixed(1)}L`;
        else if (max) labelText = `Up to ₹${(Number(max) / 100000).toFixed(1)}L`;

        chips.push({
          key: field.key,
          fieldKey: field.key,
          label: field.label,
          value: labelText,
          removeKeys: [field.minKey, field.maxKey],
        });
      }
      return;
    }

    if (field.type === "dimensions") {
      if (state.length || state.width) {
        chips.push({
          key: "dimensions",
          fieldKey: "dimensions",
          label: "Dimensions",
          value: `${state.length || "?"} x ${state.width || "?"} ft`,
          removeKeys: [field.lengthKey, field.widthKey],
        });
      }
      return;
    }

    if (field.type === "maintenance") {
      if (state.maintenanceStatus || state.maintenanceAmount) {
        chips.push({
          key: "maintenance",
          fieldKey: "maintenance",
          label: "Maintenance",
          value: state.maintenanceStatus || `₹${state.maintenanceAmount}`,
          removeKeys: [field.statusKey, field.amountKey],
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

/** Client-side property refinement */
export const clientRefineProperties = (items, state) => {
  if (!items?.length) return items;

  let result = [...items];

  // Location filter
  const targetLoc = (state.locality || state.village || state.taluk || state.district || state.location || "").toLowerCase();
  if (targetLoc) {
    result = result.filter((item) => {
      const hay = `${item.location?.city || ""} ${item.location?.area || ""} ${item.location?.address || ""} ${item.title || ""}`.toLowerCase();
      return hay.includes(targetLoc);
    });
  }

  // Facing filter
  const facingVal = state.facing || getFieldValue(state, "facing");
  if (facingVal) {
    const selectedFacings = splitValues(facingVal)
      .flatMap(expandFacingAliases)
      .map((value) => value.toLowerCase());
    result = result.filter((item) => {
      const itemFacing = String(item.facing || "").toLowerCase();
      return selectedFacings.some((facing) => itemFacing.includes(facing));
    });
  }

  // BHK filter
  const bhkList = splitValues(state.bhk).map((b) => Number(String(b).replace(/\D/g, ""))).filter(Boolean);
  if (bhkList.length) {
    result = result.filter((item) => bhkList.includes(Number(item.bhk)));
  }

  // Approval filters
  const approvalList = splitValues(state.approval);
  if (approvalList.length) {
    result = result.filter((item) => {
      const isRera = item.verification?.isVerified || Boolean(item.verification?.reraId);
      const descriptionText = `${item.description || ""} ${(item.amenities || []).join(" ")}`.toLowerCase();
      return approvalList.some((appr) => {
        if (appr === "RERA Approved") return isRera || descriptionText.includes("rera");
        if (appr === "HNTDA Approved") return descriptionText.includes("hntda");
        if (appr === "DTCP Approved") return descriptionText.includes("dtcp");
        return true;
      });
    });
  }

  // Price/Rent ranges
  const minP = Number(state.minPrice || state.minRent);
  const maxP = Number(state.maxPrice || state.maxRent);
  if (minP) {
    result = result.filter((item) => Number(item.price || 0) >= minP);
  }
  if (maxP) {
    result = result.filter((item) => Number(item.price || 0) <= maxP);
  }

  return result;
};

export const getCategoryLabel = (id) => {
  if (!id) return "All";
  return PROPERTY_FILTER_CATEGORIES.find((c) => c.id === id)?.label || id;
};
