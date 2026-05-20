const Property = require("../models/Property");
const User = require("../models/User");
const { getPublicSiteUrl, getAgentPath, getPropertyPath, getStaticSeoRoutes, xmlEscape } = require("../utils/seo");

const buildSitemapXml = (siteUrl, properties = [], agents = []) => {
  const staticRoutes = getStaticSeoRoutes().map((route) => ({
    loc: `${siteUrl}${route.path}`,
    lastmod: new Date().toISOString(),
    changefreq: route.changefreq || "weekly",
    priority: route.priority || "0.8",
  }));

  const propertyRoutes = properties.map((property) => ({
    loc: `${siteUrl}${getPropertyPath(property)}`,
    lastmod: new Date(property.updatedAt || property.createdAt || Date.now()).toISOString(),
    changefreq: "daily",
    priority: property.featuredUntil && new Date(property.featuredUntil) > new Date() ? "0.9" : "0.8",
  }));

  const agentRoutes = agents.map((agent) => ({
    loc: `${siteUrl}${getAgentPath(agent)}`,
    lastmod: new Date(agent.updatedAt || agent.createdAt || Date.now()).toISOString(),
    changefreq: "weekly",
    priority: "0.75",
  }));

  const rows = [...staticRoutes, ...propertyRoutes, ...agentRoutes]
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
  const agents = await User.find({
    role: { $in: ["agent", "broker", "builder"] },
    status: "active",
  })
    .select("name email createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  res.type("application/xml");
  res.send(buildSitemapXml(siteUrl, properties, agents));
};

const robots = async (_req, res) => {
  const siteUrl = getPublicSiteUrl();

  res.type("text/plain");
  res.send(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
};

module.exports = {
  sitemap,
  robots,
};
