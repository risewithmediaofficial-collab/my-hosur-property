const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");

const getPublicSiteUrl = () => trimTrailingSlash(process.env.CLIENT_URL || "http://localhost:5173");

const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const buildPropertySlug = (property = {}) => {
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

const getPropertyPath = (property = {}) => `/property/${property._id}/${buildPropertySlug(property)}`;

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
  getPropertyPath,
  xmlEscape,
};
