import seoRoutes from "../../shared/seoRoutes.json";

export const SEO_ROUTES = seoRoutes;

const routeMap = new Map(SEO_ROUTES.map((route) => [route.path, route]));

export const PROPERTY_CATEGORY_PATHS = {
  Villa: "/hosur/villas",
  Plot: "/hosur/plots",
  Apartment: "/hosur/apartments",
  Commercial: "/hosur/commercial",
};

export const PRIMARY_LISTING_PATHS = ["/buy", "/rent", "/plots", "/villas", "/apartments", "/commercial"];

export const getSeoRoute = (path = "/") => routeMap.get(path) || null;

export const getListingRoute = (path = "/") => {
  const route = getSeoRoute(path);
  return route?.listing ? route : null;
};

export const buildListingQueryFromFilters = (filters = {}, excludedKeys = []) => {
  const query = new URLSearchParams();

  [
    "intent",
    "search",
    "city",
    "area",
    "propertyType",
    "furnishingStatus",
    "minBhk",
    "maxBhk",
    "possessionStatus",
    "verified",
    "listingSource",
    "amenities",
    "minPrice",
    "maxPrice",
    "sort",
  ].forEach((key) => {
    if (!excludedKeys.includes(key) && filters[key]) {
      query.set(key, String(filters[key]));
    }
  });

  return query.toString();
};

export const buildListingPath = (basePath = "/buy", filters = {}, routeDefaults = {}) => {
  const excludedKeys = Object.entries(routeDefaults)
    .filter(([key, value]) => value && String(filters[key] || "") === String(value))
    .map(([key]) => key);
  const query = buildListingQueryFromFilters(filters, excludedKeys);
  return query ? `${basePath}?${query}` : basePath;
};

export const getListingInternalLinks = () =>
  PRIMARY_LISTING_PATHS.map((path) => ({
    path,
    label: getSeoRoute(path)?.label || path.replace("/", ""),
  }));

export const getCategoryPathForProperty = (property = {}) => {
  const propertyType = property.propertyType || "";
  return PROPERTY_CATEGORY_PATHS[propertyType] || "/buy";
};

export const getBestListingRoutePath = ({ intent = "", city = "", propertyType = "" } = {}) => {
  const normalizedCity = String(city || "").trim().toLowerCase();
  const isHosur = !normalizedCity || normalizedCity === "hosur";

  if (intent === "rent") return "/rent";

  if (propertyType === "Villa") return isHosur ? "/hosur/villas" : "/villas";
  if (propertyType === "Plot") return isHosur ? "/hosur/plots" : "/plots";
  if (propertyType === "Apartment") return isHosur ? "/hosur/apartments" : "/apartments";
  if (propertyType === "Commercial") return isHosur ? "/hosur/commercial" : "/commercial";

  return "/buy";
};
