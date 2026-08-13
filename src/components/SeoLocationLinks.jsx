import { NavLink } from "react-router-dom";
import { HOSUR_LOCATIONS, INTENT_MODIFIERS, CORE_SEARCH_PHRASES, HIGH_AUTHORITY_BRANDING_KEYWORDS } from "../constants/seoLocations";
import { slugify } from "../utils/format";

const SeoLocationLinks = ({ currentSlug = "", showBrandingTags = true }) => {
  return (
    <section className="mt-12 rounded-2xl border border-navy/10 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 shadow-sm">
      {/* High Authority Branding Header */}
      {showBrandingTags && (
        <div className="mb-8 border-b border-navy/10 pb-6">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-orange mb-3">
            ⭐ Hosur Real Estate &amp; Land Experts
          </h3>
          <div className="flex flex-wrap gap-2">
            {HIGH_AUTHORITY_BRANDING_KEYWORDS.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1 text-xs font-semibold text-navy hover:border-orange hover:text-orange transition"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange"></span>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Target Area Links */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-navy">Top Verified Property Areas in Hosur</h4>
          <span className="text-xs font-medium text-slate-500">Ready to Register Plots &amp; Lands</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {HOSUR_LOCATIONS.map((loc) => {
            const areaSlug = slugify(`${loc.name} ${loc.defaultType}`);
            const isActive = currentSlug === areaSlug;
            return (
              <NavLink
                key={loc.id}
                to={`/location/${areaSlug}`}
                className={`rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition border ${
                  isActive
                    ? "bg-orange text-white border-orange shadow-sm"
                    : "bg-white text-navy border-slate-200 hover:border-orange hover:bg-orange/5 hover:text-orange"
                }`}
              >
                {loc.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Area & Intent Combinations Grid */}
      <div className="mb-8 border-t border-navy/10 pt-6">
        <h4 className="text-base font-bold text-navy mb-3">Featured High-Intent Hosur Land &amp; Villa Searches</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {[
            { label: "DTCP Plots Bagalur Road", slug: "dtcp-plots-bagalur-road" },
            { label: "Villas in Mathigiri", slug: "villas-in-mathigiri" },
            { label: "Land near SIPCOT Hosur", slug: "land-near-sipcot-hosur" },
            { label: "Anand Nagar Plots For Sale", slug: "anand-nagar-plots-for-sale" },
            { label: "Commercial Land Mookandapalli", slug: "commercial-property-mookandapalli" },
            { label: "Shoolagiri Land Investment", slug: "shoolagiri-property-investment" },
            { label: "Rayakottai Road Resale Plots", slug: "rayakottai-road-plots" },
            { label: "Denkanikottai Road Verified Plots", slug: "denkanikottai-road-land-verified" },
            { label: "TVS Nagar Residential Layouts", slug: "tvs-nagar-plots-residential" },
            { label: "Titan Township Luxury Villas", slug: "titan-township-property-villa" },
            { label: "Chennathur DTCP Approved Land", slug: "chennathur-plots-dtcp" },
            { label: "Kelamangalam Road House Sale", slug: "kelamangalam-road-property-for-sale" },
            { label: "Avalapalli Gated Plots", slug: "avalapalli-land-verified" },
            { label: "Zuzuvadi House near Electronic City", slug: "house-near-electronic-city" },
          ].map((item) => (
            <NavLink
              key={item.slug}
              to={`/location/${item.slug}`}
              className="flex items-center justify-between rounded-lg bg-white border border-slate-200 p-2.5 hover:border-orange hover:bg-orange/5 text-navy font-medium transition"
            >
              <span>{item.label}</span>
              <span className="text-orange text-sm font-bold">&rarr;</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Core Real Estate Search Terms */}
      <div className="border-t border-navy/10 pt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Popular Hosur Property Guides</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {CORE_SEARCH_PHRASES.slice(0, 15).map((item) => (
            <NavLink
              key={item.slug}
              to={`/location/${item.slug}`}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-navy/80 hover:bg-orange/10 hover:text-orange font-medium transition"
            >
              {item.phrase}
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SeoLocationLinks;
