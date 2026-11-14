const Property = require("../models/Property");
const { getPublicSiteUrl, getPropertyPath, xmlEscape } = require("../utils/seo");

const LOCATIONS = [
  "anand-nagar", "bagalur-road", "mathigiri", "alasanatham", "mookandapalli", "zuzuvadi",
  "shoolagiri", "rayakottai-road", "hosur-sipcot", "tvs-nagar", "titan-township",
  "denkanikottai-road", "chennathur", "kelamangalam", "kelamangalam-road", "avalapalli"
];

const INTENTS = [
  "for-sale", "investment", "near-me", "verified", "dtcp", "villa", "residential", "commercial"
];

const CORE_PHRASE_SLUGS = [
  "best-real-estate-company-in-hosur", "trusted-property-dealer-in-hosur", "verified-property-listings-hosur",
  "buy-dtcp-plots-in-hosur", "best-investment-property-in-hosur", "property-consultants-near-me",
  "land-near-hosur-sipcot", "house-near-electronic-city", "industrial-land-near-bangalore",
  "property-for-sale-near-hosur", "affordable-plots-in-hosur", "premium-villas-in-hosur",
  "buy-warehouse-land-hosur", "sell-property-quickly-hosur", "best-property-investment-in-hosur",
  "best-place-to-buy-land-in-hosur", "ready-to-register-plots-hosur", "investment-plots-near-bangalore",
  "affordable-plots-near-bangalore", "gated-community-villas-hosur", "premium-land-in-hosur",
  "luxury-villas-hosur", "approved-residential-layouts-hosur", "future-growth-areas-in-hosur",
  "land-with-clear-documents-hosur", "verified-property-for-sale-hosur", "genuine-land-deals-hosur",
  "direct-owner-properties-hosur", "resale-plots-hosur", "dtcp-plots-bagalur-road",
  "villas-in-mathigiri", "land-near-sipcot-hosur",
  "plots-for-sale-in-bagalur-road", "property-for-sale-in-mathigiri", "land-for-sale-in-shoolagiri",
  "property-for-sale-in-alasanatham", "plots-for-sale-in-rayakottai-road", "land-for-sale-in-avalapalli",
  "plots-for-sale-in-kelamangalam", "land-for-sale-in-denkanikottai-road"
];

const CATEGORY_LANDING_PATHS = [
  "/hosur-real-estate",
  "/plots-for-sale-in-hosur",
  "/land-for-sale-in-hosur",
  "/villas-for-sale-in-hosur",
  "/houses-for-sale-in-hosur",
  "/commercial-property-hosur",
  "/farm-land-near-hosur",
  "/property-for-rent-in-hosur",
];

const BLOG_PATHS = [
  "/blog",
  "/blog/best-areas-to-buy-property-in-hosur",
  "/blog/complete-guide-to-buying-residential-plots-in-hosur",
  "/blog/hosur-real-estate-investment-guide",
  "/blog/things-to-check-before-buying-land-in-hosur",
  "/blog/best-residential-locations-near-hosur",
  "/blog/dtcp-vs-hntda-approved-plots-what-buyers-should-know",
  "/blog/is-hosur-a-good-location-for-property-investment",
];

const generateLocationSlugs = () => {
  const slugs = new Set(CORE_PHRASE_SLUGS);
  LOCATIONS.forEach((loc) => {
    slugs.add(`${loc}-plots`);
    slugs.add(`${loc}-property`);
    slugs.add(`${loc}-land`);
    INTENTS.forEach((intent) => {
      slugs.add(`${intent}-plots-${loc}`);
      slugs.add(`${loc}-plots-${intent}`);
      slugs.add(`${intent}-property-${loc}`);
      slugs.add(`${loc}-property-${intent}`);
    });
  });
  return Array.from(slugs);
};

const locationSlugs = generateLocationSlugs();

const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/bank-loans",
  "/listings",
  ...CATEGORY_LANDING_PATHS,
  ...BLOG_PATHS,
  ...locationSlugs.map((s) => `/location/${s}`),
];

const buildSitemapXml = (siteUrl, properties = []) => {
  const urls = [
    ...STATIC_PATHS.map((path) => ({
      loc: `${siteUrl}${path}`,
      lastmod: new Date().toISOString(),
      changefreq: path === "/" || CATEGORY_LANDING_PATHS.includes(path) ? "daily" : "weekly",
      priority: path === "/" ? "1.0" : CATEGORY_LANDING_PATHS.includes(path) || path === "/blog" ? "0.9" : path.startsWith("/location/") ? "0.8" : "0.7",
    })),
    ...properties.map((property) => ({
      loc: `${siteUrl}${getPropertyPath(property)}`,
      lastmod: new Date(property.updatedAt || property.createdAt || Date.now()).toISOString(),
      changefreq: "daily",
      priority: property.featuredUntil && new Date(property.featuredUntil) > new Date() ? "0.9" : "0.8",
    })),
  ];

  const rows = urls
    .map(
      (item) => `<url>
  <loc>${xmlEscape(item.loc)}</loc>
  <lastmod>${item.lastmod}</lastmod>
  <changefreq>${item.changefreq}</changefreq>
  <priority>${item.priority}</priority>
</url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>`;
};

const sitemap = async (_req, res) => {
  const siteUrl = getPublicSiteUrl();
  const properties = await Property.find({ status: "approved" })
    .select("title propertyType bhk listingType location featuredUntil createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  res.type("application/xml");
  res.send(buildSitemapXml(siteUrl, properties));
};

const robots = async (_req, res) => {
  const siteUrl = getPublicSiteUrl();

  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard
Disallow: /auth
Disallow: /post-property
Disallow: /edit-property
Disallow: /plans

Sitemap: ${siteUrl}/sitemap.xml
`);
};

module.exports = {
  sitemap,
  robots,
};
