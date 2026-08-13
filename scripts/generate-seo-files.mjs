import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const siteUrl = trimTrailingSlash(process.env.VITE_SITE_URL || process.env.CLIENT_URL || "https://myhosurproperty.com");
const apiBaseUrl = trimTrailingSlash(
  process.env.VITE_API_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.SITEMAP_API_URL ||
    "http://127.0.0.1:5001"
);

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

const staticPaths = [
  "/",
  "/about",
  "/services",
  "/bank-loans",
  "/listings",
  ...locationSlugs.map((s) => `/location/${s}`),
];

const staticSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${path === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${path === "/" ? "1.0" : path.startsWith("/location/") ? "0.9" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard
Disallow: /auth
Disallow: /post-property
Disallow: /edit-property
Disallow: /plans

Sitemap: ${siteUrl}/sitemap.xml
`;

const writePublicFile = async (name, content) => {
  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, name), content, "utf8");
};

const generate = async () => {
  let sitemapXml = staticSitemapXml;

  try {
    const response = await fetch(`${apiBaseUrl}/sitemap.xml`, {
      headers: { Accept: "application/xml" },
    });

    if (response.ok) {
      sitemapXml = await response.text();
    }
  } catch (error) {
    console.warn(`[seo] Could not fetch dynamic sitemap from ${apiBaseUrl}: ${error.message}`);
  }

  await writePublicFile("sitemap.xml", sitemapXml);
  await writePublicFile("robots.txt", robotsContent);
};

generate().catch((error) => {
  console.error("[seo] Failed to generate SEO files:", error);
  process.exitCode = 1;
});
