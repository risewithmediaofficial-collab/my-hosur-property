import { slugify } from "./format";
import { getCategoryPathForProperty } from "./seoRoutes";

export const SITE_NAME = "My Hosur Property";
export const SITE_TITLE_SUFFIX = "My Hosur Property";
export const SITE_DESCRIPTION =
  "My Hosur Property helps buyers, sellers, owners, brokers, and builders discover verified property listings in Hosur with cleaner search, stronger lead flow, and a more trustworthy real estate experience.";
export const SITE_KEYWORDS = [
  "Hosur property",
  "property in Hosur",
  "real estate Hosur",
  "apartments in Hosur",
  "villas in Hosur",
  "plots in Hosur",
  "commercial property Hosur",
  "property agents Hosur",
  "houses for sale Hosur",
  "My Hosur Property",
].join(", ");
export const DEFAULT_SITE_URL = "https://myhosurproperty.com";
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
  return `${normalized.slice(0, Math.max(limit - 1, 0)).trim()}...`;
};

export const buildPropertySlug = (property = {}) => {
  const parts = [
    property.title || "",
    property.bhk ? `${property.bhk} bhk` : "",
    property.propertyType || "",
    property.location?.area || "",
    property.location?.city || "Hosur",
  ].filter(Boolean);

  return slugify(parts.join(" "));
};

export const getPropertyPath = (property = {}) => `/property/${buildPropertySlug(property)}`;

export const buildAgentSlug = (agent = {}) =>
  slugify(agent.slug || agent.name || agent.email?.split("@")[0] || "agent");

export const getAgentPath = (agent = {}) => `/agent/${buildAgentSlug(agent)}`;

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
    target: `${getSiteUrl()}/buy?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const buildRealEstateAgentSchema = () => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE_NAME,
  url: getSiteUrl(),
  description: SITE_DESCRIPTION,
  areaServed: "Hosur",
  priceRange: "INR",
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

export const buildPropertySchema = (property = {}) => ({
  "@context": "https://schema.org",
  "@type": "Residence",
  name: property.title,
  description: truncateText(property.description || SITE_DESCRIPTION, 200),
  url: absoluteUrl(getPropertyPath(property)),
  image: (property.images || []).map((image) => absoluteUrl(image)),
  address: {
    "@type": "PostalAddress",
    addressLocality: property.location?.area || "",
    addressRegion: property.location?.city || "Hosur",
    addressCountry: "IN",
  },
  offers: {
    "@type": "Offer",
    price: property.price,
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: absoluteUrl(getPropertyPath(property)),
  },
  floorSize: property.carpetArea
    ? {
        "@type": "QuantitativeValue",
        value: property.carpetArea,
        unitCode: property.areaUnit === "sqm" ? "MTK" : "FTK",
      }
    : undefined,
  numberOfRooms: property.bhk || undefined,
});

export const buildAgentSchema = (agent = {}) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: agent.name || SITE_NAME,
  url: absoluteUrl(getAgentPath(agent)),
  email: agent.email || undefined,
  telephone: agent.phone || undefined,
  areaServed: agent.areaServed || "Hosur",
  worksFor: {
    "@type": "Organization",
    name: SITE_NAME,
  },
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

export const getPropertyCategoryLink = (property = {}) => getCategoryPathForProperty(property);
