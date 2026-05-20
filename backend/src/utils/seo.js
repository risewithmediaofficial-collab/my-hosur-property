const seoRoutes = require("../../../shared/seoRoutes.json");

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");

const getPublicSiteUrl = () => trimTrailingSlash(process.env.CLIENT_URL || "https://myhosurproperty.com");

const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const buildPropertySlug = (property = {}) => {
  const parts = [
    property.title || "",
    property.bhk ? `${property.bhk} bhk` : "",
    property.propertyType || "",
    property.location?.area || "",
    property.location?.city || "Hosur",
  ].filter(Boolean);

  return slugify(parts.join(" "));
};

const buildAgentSlug = (agent = {}) => slugify(agent.slug || agent.name || agent.email?.split("@")[0] || "agent");

const getPropertyPath = (property = {}) => `/property/${buildPropertySlug(property)}`;

const getAgentPath = (agent = {}) => `/agent/${buildAgentSlug(agent)}`;

const getStaticSeoRoutes = () => seoRoutes.filter((route) => route.sitemap);

const xmlEscape = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

module.exports = {
  getPublicSiteUrl,
  buildPropertySlug,
  buildAgentSlug,
  getPropertyPath,
  getAgentPath,
  getStaticSeoRoutes,
  xmlEscape,
};
