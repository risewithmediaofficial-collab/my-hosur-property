const Property = require("../models/Property");
const { getPublicSiteUrl, getPropertyPath, xmlEscape } = require("../utils/seo");

const LOCATIONS = [
  "anand-nagar", "bagalur-road", "mathigiri", "mookandapalli", "zuzuvadi",
  "shoolagiri", "rayakottai-road", "hosur-sipcot", "tvs-nagar", "titan-township",
  "denkanikottai-road", "chennathur", "kelamangalam-road", "avalapalli"
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
  "villas-in-mathigiri", "land-near-sipcot-hosur"
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
  ...locationSlugs.map((s) => `/location/${s}`),
];

const buildSitemapXml = (siteUrl, properties = []) => {
  const urls = [
    ...STATIC_PATHS.map((path) => ({
      loc: `${siteUrl}${path}`,
      lastmod: new Date().toISOString(),
      changefreq: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? "1.0" : path.startsWith("/location/") ? "0.9" : "0.8",
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
