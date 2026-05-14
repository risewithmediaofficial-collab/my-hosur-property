import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const siteUrl = trimTrailingSlash(process.env.VITE_SITE_URL || process.env.CLIENT_URL || "https://my-hosur-property.onrender.com");
const apiBaseUrl = trimTrailingSlash(
  process.env.VITE_API_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.SITEMAP_API_URL ||
    "http://127.0.0.1:5001"
);

const staticSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
  </url>
  <url>
    <loc>${siteUrl}/listings</loc>
  </url>
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
