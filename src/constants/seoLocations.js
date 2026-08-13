import { slugify } from "../utils/format";

export const HIGH_AUTHORITY_BRANDING_KEYWORDS = [
  "Hosur Property Experts",
  "Hosur Property Specialists",
  "Hosur Property Marketplace",
  "Hosur Property Hub",
  "Hosur Land Experts",
  "Hosur Real Estate Solutions",
  "Hosur Property Network",
  "Hosur Verified Properties",
  "Hosur Property Guide",
  "Trusted Hosur Realtors",
];

export const HOSUR_LOCATIONS = [
  { id: "anand-nagar", name: "Anand Nagar", defaultType: "plots", areaName: "Anand Nagar" },
  { id: "bagalur-road", name: "Bagalur Road", defaultType: "property", areaName: "Bagalur Road" },
  { id: "mathigiri", name: "Mathigiri", defaultType: "plots", areaName: "Mathigiri" },
  { id: "mookandapalli", name: "Mookandapalli", defaultType: "property", areaName: "Mookandapalli" },
  { id: "zuzuvadi", name: "Zuzuvadi", defaultType: "land", areaName: "Zuzuvadi" },
  { id: "shoolagiri", name: "Shoolagiri", defaultType: "property", areaName: "Shoolagiri" },
  { id: "rayakottai-road", name: "Rayakottai Road", defaultType: "plots", areaName: "Rayakottai Road" },
  { id: "hosur-sipcot", name: "Hosur SIPCOT", defaultType: "property", areaName: "Hosur SIPCOT" },
  { id: "tvs-nagar", name: "TVS Nagar", defaultType: "plots", areaName: "TVS Nagar" },
  { id: "titan-township", name: "Titan Township", defaultType: "property", areaName: "Titan Township" },
  { id: "denkanikottai-road", name: "Denkanikottai Road", defaultType: "land", areaName: "Denkanikottai Road" },
  { id: "chennathur", name: "Chennathur", defaultType: "plots", areaName: "Chennathur" },
  { id: "kelamangalam-road", name: "Kelamangalam Road", defaultType: "property", areaName: "Kelamangalam Road" },
  { id: "avalapalli", name: "Avalapalli", defaultType: "land", areaName: "Avalapalli" },
];

export const INTENT_MODIFIERS = [
  { id: "for-sale", label: "For Sale", queryCategory: "", queryIntent: "buy" },
  { id: "investment", label: "Investment", queryCategory: "", queryIntent: "investment" },
  { id: "near-me", label: "Near Me", queryCategory: "", queryIntent: "buy" },
  { id: "verified", label: "Verified", queryCategory: "", queryIntent: "verified" },
  { id: "dtcp", label: "DTCP Approved", queryCategory: "plot", queryIntent: "dtcp" },
  { id: "villa", label: "Villa", queryCategory: "villa", queryIntent: "buy" },
  { id: "residential", label: "Residential", queryCategory: "plot", queryIntent: "buy" },
  { id: "commercial", label: "Commercial", queryCategory: "commercial", queryIntent: "buy" },
];

export const CORE_SEARCH_PHRASES = [
  { phrase: "Best real estate company in Hosur", slug: "best-real-estate-company-in-hosur", category: "all", intent: "trusted" },
  { phrase: "Trusted property dealer in Hosur", slug: "trusted-property-dealer-in-hosur", category: "all", intent: "trusted" },
  { phrase: "Verified property listings Hosur", slug: "verified-property-listings-hosur", category: "all", intent: "verified" },
  { phrase: "Buy DTCP plots in Hosur", slug: "buy-dtcp-plots-in-hosur", category: "plot", intent: "dtcp" },
  { phrase: "Best investment property in Hosur", slug: "best-investment-property-in-hosur", category: "all", intent: "investment" },
  { phrase: "Property consultants near me", slug: "property-consultants-near-me", category: "all", intent: "consultant" },
  { phrase: "Land near Hosur SIPCOT", slug: "land-near-hosur-sipcot", category: "land", location: "Hosur SIPCOT" },
  { phrase: "House near Electronic City", slug: "house-near-electronic-city", category: "house", location: "Zuzuvadi" },
  { phrase: "Industrial land near Bangalore", slug: "industrial-land-near-bangalore", category: "commercial", location: "Shoolagiri" },
  { phrase: "Property for sale near Hosur", slug: "property-for-sale-near-hosur", category: "all", intent: "buy" },
  { phrase: "Affordable plots in Hosur", slug: "affordable-plots-in-hosur", category: "plot", intent: "affordable" },
  { phrase: "Premium villas in Hosur", slug: "premium-villas-in-hosur", category: "villa", intent: "premium" },
  { phrase: "Buy warehouse land Hosur", slug: "buy-warehouse-land-hosur", category: "commercial", intent: "warehouse" },
  { phrase: "Sell property quickly Hosur", slug: "sell-property-quickly-hosur", category: "all", intent: "sell" },
  { phrase: "Best property investment in Hosur", slug: "best-property-investment-in-hosur", category: "all", intent: "investment" },
  { phrase: "Best place to buy land in Hosur", slug: "best-place-to-buy-land-in-hosur", category: "land", intent: "investment" },
  { phrase: "Ready to register plots Hosur", slug: "ready-to-register-plots-hosur", category: "plot", intent: "dtcp" },
  { phrase: "Investment plots near Bangalore", slug: "investment-plots-near-bangalore", category: "plot", intent: "investment" },
  { phrase: "Affordable plots near Bangalore", slug: "affordable-plots-near-bangalore", category: "plot", intent: "affordable" },
  { phrase: "Gated community villas Hosur", slug: "gated-community-villas-hosur", category: "villa", intent: "gated" },
  { phrase: "Premium land in Hosur", slug: "premium-land-in-hosur", category: "land", intent: "premium" },
  { phrase: "Luxury villas Hosur", slug: "luxury-villas-hosur", category: "villa", intent: "luxury" },
  { phrase: "Approved residential layouts Hosur", slug: "approved-residential-layouts-hosur", category: "plot", intent: "dtcp" },
  { phrase: "Future growth areas in Hosur", slug: "future-growth-areas-in-hosur", category: "all", intent: "investment" },
  { phrase: "Land with clear documents Hosur", slug: "land-with-clear-documents-hosur", category: "land", intent: "verified" },
  { phrase: "Verified property for sale Hosur", slug: "verified-property-for-sale-hosur", category: "all", intent: "verified" },
  { phrase: "Genuine land deals Hosur", slug: "genuine-land-deals-hosur", category: "land", intent: "verified" },
  { phrase: "Direct owner properties Hosur", slug: "direct-owner-properties-hosur", category: "all", intent: "direct-owner" },
  { phrase: "Resale plots Hosur", slug: "resale-plots-hosur", category: "plot", intent: "resale" },
];

/**
 * Generates all SEO landing page definitions programmatically.
 */
export const getAllSeoPages = () => {
  const pages = [];
  const slugMap = new Map();

  const addPage = (page) => {
    if (!slugMap.has(page.slug)) {
      slugMap.set(page.slug, page);
      pages.push(page);
    }
  };

  // 1. Core high-intent search phrase pages
  CORE_SEARCH_PHRASES.forEach((item) => {
    addPage({
      slug: item.slug,
      title: item.phrase,
      h1: `${item.phrase} - Verified Deals & Direct Listings`,
      locationName: item.location || "Hosur",
      category: item.category || "all",
      intent: item.intent || "general",
      seoType: "core-phrase",
      metaTitle: `${item.phrase} | Hosur Property Marketplace`,
      metaDescription: `Discover ${item.phrase} with MyHosurProperty. Verified DTCP plots, clear document lands, villas, and direct owner deals across Hosur.`,
    });
  });

  // 2. Area + Default Asset Type pages (e.g. /location/anand-nagar-plots, /location/bagalur-road-property)
  HOSUR_LOCATIONS.forEach((loc) => {
    const defaultSlug = slugify(`${loc.name} ${loc.defaultType}`);
    addPage({
      slug: defaultSlug,
      title: `${loc.name} ${loc.defaultType}`,
      h1: `${loc.name} ${loc.defaultType} for Sale in Hosur`,
      locationName: loc.name,
      category: loc.defaultType.includes("plot") ? "plot" : loc.defaultType.includes("land") ? "land" : "all",
      intent: "buy",
      seoType: "area-default",
      metaTitle: `${loc.name} ${loc.defaultType} in Hosur | DTCP & Verified Listings`,
      metaDescription: `Explore top ${loc.defaultType} in ${loc.name}, Hosur. Clear title documents, ready for registration, prime connectivity near Bangalore & SIPCOT.`,
    });

    // 3. Area + Intent permutations (e.g. /location/bagalur-road-dtcp-plots, /location/mathigiri-villas, /location/sipcot-hosur-land)
    INTENT_MODIFIERS.forEach((mod) => {
      const combinationSlug = slugify(`${mod.label} ${loc.defaultType} ${loc.name}`);
      const altSlug = slugify(`${loc.name} ${loc.defaultType} ${mod.label}`);

      const titleStr = `${mod.label} ${loc.name} ${loc.defaultType}`;
      const descriptionStr = `Find verified ${mod.label.toLowerCase()} ${loc.defaultType} in ${loc.name}, Hosur. Direct owner listings, DTCP layout approvals & instant legal guidance.`;

      addPage({
        slug: combinationSlug,
        title: titleStr,
        h1: `${mod.label} ${loc.defaultType} in ${loc.name}, Hosur`,
        locationName: loc.name,
        category: mod.queryCategory || (loc.defaultType.includes("plot") ? "plot" : "all"),
        intent: mod.queryIntent,
        seoType: "area-intent",
        metaTitle: `${titleStr} | Hosur Property Marketplace`,
        metaDescription: descriptionStr,
      });

      addPage({
        slug: altSlug,
        title: `${loc.name} ${mod.label} ${loc.defaultType}`,
        h1: `${loc.name} ${mod.label} ${loc.defaultType} for Sale`,
        locationName: loc.name,
        category: mod.queryCategory || (loc.defaultType.includes("plot") ? "plot" : "all"),
        intent: mod.queryIntent,
        seoType: "area-intent",
        metaTitle: `${loc.name} ${mod.label} ${loc.defaultType} | Verified Listings`,
        metaDescription: descriptionStr,
      });
    });
  });

  return pages;
};

export const ALL_SEO_PAGES = getAllSeoPages();

export const getSeoPageBySlug = (slug) => {
  if (!slug) return null;
  const normalized = slugify(slug);
  return ALL_SEO_PAGES.find((p) => p.slug === normalized) || null;
};
