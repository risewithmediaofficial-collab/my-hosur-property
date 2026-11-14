import { useState } from "react";
import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import { BLOG_ARTICLES } from "../constants/blogArticles";
import { buildBreadcrumbSchema, buildWebsiteSchema } from "../utils/seo";
import {
  ArrowRightIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserIcon,
} from "../components/AppIcons";

const CATEGORIES = ["All", "Area Guides", "Buying Tips", "Investment Guide", "Legal & Approvals"];

const BlogIndexPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Blog & Real Estate Guides", to: "/blog" },
  ];

  const q = searchQuery.toLowerCase().trim();
  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="page-shell w-full bg-slate-50/50">
      <SeoHead
        title="Hosur Real Estate Blog & Buying Guides | Property Insights"
        description="Comprehensive guides to buying plots, land, houses, and villas in Hosur. Market trends, DTCP approvals, legal checks, and investment advice from local experts."
        keywords="Hosur real estate blog, buy plot in Hosur, Hosur property investment guide, DTCP plots Hosur, Hosur land checklist, MyHosurProperty"
        canonicalPath="/blog"
        schema={[buildWebsiteSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      {/* ── BREADCRUMBS ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-2.5 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.to} className="flex items-center gap-2">
                {idx > 0 && <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-navy">{crumb.label}</span>
                ) : (
                  <Link to={crumb.to} className="hover:text-orange transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-slate-900 text-white px-4 py-12 sm:px-8 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative mx-auto max-w-[1440px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange/20 border border-orange/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange">
            <SparklesIcon className="h-3.5 w-3.5" />
            Hosur Property Knowledge Hub
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight text-white">
            Hosur Real Estate Guides &amp; Market Insights
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            Expert analysis, legal checklists, locality comparisons, and actionable investment tips written by Hosur's leading property advisory team.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles: DTCP, Bagalur Road, Patta, Investment..."
                className="site-input w-full rounded-2xl border-0 bg-white/95 px-12 py-3.5 text-sm font-medium text-navy shadow-lg focus:bg-white focus:ring-2 focus:ring-orange placeholder:text-slate-400"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER PILLS ── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-orange text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── ARTICLES GRID ── */}
      <section className="px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-[1440px]">
          {filteredArticles.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-orange hover:shadow-lg transition-all duration-200"
                >
                  <Link to={`/blog/${article.slug}`} className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-navy/85 backdrop-blur-xs text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {article.readTime}
                      </span>
                      <span>•</span>
                      <span>{article.displayDate}</span>
                    </div>

                    <h2 className="text-lg font-bold text-navy group-hover:text-orange transition-colors leading-snug line-clamp-2">
                      <Link to={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <UserIcon className="h-3.5 w-3.5 text-orange" />
                        {article.author}
                      </span>
                      <Link
                        to={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange group-hover:translate-x-1 transition-transform"
                      >
                        <span>Read Guide</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-lg mx-auto">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-lg font-bold text-navy">No articles found</h3>
              <p className="mt-1 text-sm text-slate-600">
                Try searching with different keywords or reset the category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="site-button-primary mt-4 text-xs font-bold px-5 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── QUICK EXPLORE CATEGORIES ── */}
      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <h3 className="text-xl font-bold text-navy mb-4">Explore Verified Property Listings in Hosur</h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Hosur Real Estate Overview", to: "/hosur-real-estate" },
              { label: "Plots for Sale in Hosur", to: "/plots-for-sale-in-hosur" },
              { label: "Land for Sale in Hosur", to: "/land-for-sale-in-hosur" },
              { label: "Villas for Sale in Hosur", to: "/villas-for-sale-in-hosur" },
              { label: "Houses for Sale in Hosur", to: "/houses-for-sale-in-hosur" },
              { label: "Commercial Property in Hosur", to: "/commercial-property-hosur" },
              { label: "Farm Land Near Hosur", to: "/farm-land-near-hosur" },
              { label: "Property for Rent in Hosur", to: "/property-for-rent-in-hosur" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy hover:border-orange hover:bg-orange hover:text-white transition-all shadow-2xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogIndexPage;
