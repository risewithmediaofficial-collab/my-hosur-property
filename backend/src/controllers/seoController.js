const Property = require("../models/Property");
const { getPublicSiteUrl, getPropertyPath, xmlEscape } = require("../utils/seo");

const STATIC_PATHS = ["/", "/about", "/listings"];

const buildSitemapXml = (siteUrl, properties = []) => {
  const urls = [
    ...STATIC_PATHS.map((path) => ({
      loc: `${siteUrl}${path}`,
      lastmod: new Date().toISOString(),
      changefreq: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? "1.0" : "0.8",
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
