import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import seoRoutes from "../shared/seoRoutes.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const slugify = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const siteUrl = trimTrailingSlash(process.env.VITE_SITE_URL || process.env.CLIENT_URL || "https://myhosurproperty.com");
const apiBaseUrl = trimTrailingSlash(
  process.env.VITE_API_URL || process.env.VITE_API_BASE_URL || process.env.SITEMAP_API_URL || "http://127.0.0.1:5001"
);

const buildPropertySlug = (property = {}) =>
  slugify(
    [
      property.title || "",
      property.bhk ? `${property.bhk} bhk` : "",
      property.propertyType || "",
      property.location?.area || "",
      property.location?.city || "Hosur",
    ]
      .filter(Boolean)
      .join(" ")
  );

const buildAgentSlug = (agent = {}) => slugify(agent.slug || agent.name || agent.email?.split("@")[0] || "agent");

const buildUrlNode = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${loc}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}${changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : ""}${priority ? `    <priority>${priority}</priority>\n` : ""}  </url>`;

const staticSitemapXml = (properties = [], agents = []) => {
  const staticNodes = seoRoutes
    .filter((route) => route.sitemap)
    .map((route) =>
      buildUrlNode({
        loc: `${siteUrl}${route.path}`,
        lastmod: new Date().toISOString(),
        changefreq: route.changefreq || "weekly",
        priority: route.priority || "0.8",
      })
    );

  const propertyNodes = properties.map((property) =>
    buildUrlNode({
      loc: `${siteUrl}/property/${buildPropertySlug(property)}`,
      lastmod: new Date(property.updatedAt || property.createdAt || Date.now()).toISOString(),
      changefreq: "daily",
      priority: property.featuredUntil ? "0.9" : "0.8",
    })
  );

  const agentNodes = agents.map((agent) =>
    buildUrlNode({
      loc: `${siteUrl}/agent/${buildAgentSlug(agent)}`,
      lastmod: new Date(agent.updatedAt || agent.createdAt || Date.now()).toISOString(),
      changefreq: "weekly",
      priority: "0.75",
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticNodes, ...propertyNodes, ...agentNodes].join("\n")}
</urlset>
`;
};

const robotsContent = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const writePublicFile = async (name, content) => {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, name), content, "utf8");
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
};

const generate = async () => {
  let sitemapXml = staticSitemapXml();

  try {
    const [propertiesPayload, agentsPayload] = await Promise.all([
      fetchJson(`${apiBaseUrl}/api/properties/seo-listings`),
      fetchJson(`${apiBaseUrl}/api/users/agents`),
    ]);

    sitemapXml = staticSitemapXml(propertiesPayload.items || [], agentsPayload.items || []);
  } catch (error) {
    console.warn(`[seo] Could not fetch dynamic sitemap data from ${apiBaseUrl}: ${error.message}`);
  }

  await writePublicFile("sitemap.xml", sitemapXml);
  await writePublicFile("robots.txt", robotsContent);
};

generate().catch((error) => {
  console.error("[seo] Failed to generate SEO files:", error);
  process.exitCode = 1;
});
