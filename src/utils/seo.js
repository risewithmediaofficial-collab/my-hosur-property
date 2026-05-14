import { slugify } from "./format";

export const SITE_NAME = "MyHosurProperty";
export const SITE_TITLE_SUFFIX = "MyHosurProperty";
export const SITE_DESCRIPTION =
  "MyHosurProperty helps buyers, sellers, owners, brokers, and builders discover verified property listings in Hosur with cleaner search, stronger lead flow, and a more trustworthy real estate experience.";
export const SITE_KEYWORDS = [
  "Hosur property",
  "property in Hosur",
  "real estate Hosur",
  "apartments in Hosur",
  "villas in Hosur",
  "plots in Hosur",
  "houses for sale in Hosur",
  "property listings Hosur",
  "rent house Hosur",
  "MyHosurProperty",
].join(", ");
export const DEFAULT_SITE_URL = "https://my-hosur-property.onrender.com";
export const DEFAULT_OG_IMAGE = "/favicon.svg";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const getSiteUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  const envUrl = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PUBLIC_SITE_URL;
  return trimTrailingSlash(envUrl || DEFAULT_SITE_URL);
};

export const absoluteUrl = (path = "/") => {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
};

export const buildPageTitle = (title) => (title ? `${title} | ${SITE_TITLE_SUFFIX}` : SITE_NAME);

export const truncateText = (text = "", limit = 160) => {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(limit - 1, 0)).trim()}…`;
};

export const buildPropertySlug = (property = {}) => {
  const parts = [
    property.bhk ? `${property.bhk} bhk` : "",
    property.propertyType || "",
    property.listingType === "rent" ? "for rent" : property.listingType === "new-project" ? "new project" : "for sale",
    property.location?.area || "",
    property.location?.city || "",
    property.title || "",
  ].filter(Boolean);

  return slugify(parts.join(" "));
};

export const getPropertyPath = (property = {}) => `/property/${property._id}/${buildPropertySlug(property)}`;

export const getPropertyImageAlt = (property = {}, index = 0) => {
  const propertyType = property.propertyType || "Property";
  const listingLabel =
    property.listingType === "rent" ? "for rent" : property.listingType === "new-project" ? "new project listing" : "for sale";
  const area = property.location?.area ? `${property.location.area}, ` : "";
  const city = property.location?.city || "Hosur";
  const bhkLabel = property.bhk ? `${property.bhk} BHK ` : "";
  const imageLabel = index > 0 ? `photo ${index + 1}` : "main photo";

  return `${bhkLabel}${propertyType} ${listingLabel} in ${area}${city} - ${imageLabel}`;
};

export const buildCanonicalListingQuery = (filters = {}) => {
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
  ].forEach((key) => {
    if (filters[key]) {
      query.set(key, String(filters[key]));
    }
  });

  const qs = query.toString();
  return qs ? `/listings?${qs}` : "/listings";
};

export const buildBreadcrumbSchema = (items = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.to || "/"),
  })),
});

export const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: `${getSiteUrl()}/listings?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildRealEstateAgentSchema = () => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
  areaServed: "Hosur, Tamil Nadu, India",
  priceRange: "₹₹",
  telephone: "+91 98765 43210",
  email: "support@myhosurproperty.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hosur",
    addressRegion: "Tamil Nadu",
    postalCode: "635109",
    addressCountry: "IN",
  },
  sameAs: [getSiteUrl()],
});

export const buildFaqSchema = (questions = []) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});
