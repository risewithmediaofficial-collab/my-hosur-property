import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import ContactModal from "../components/ContactModal";
import { BLOG_ARTICLES, getBlogArticleBySlug } from "../constants/blogArticles";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebsiteSchema,
} from "../utils/seo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  PhoneIcon,
  ShareIcon,
  ShieldCheckIcon,
  UserIcon,
  WhatsAppIcon,
} from "../components/AppIcons";
import { CONTACT_PHONE_NUMBERS, SOCIAL_LINKS } from "../constants/contactInfo";

const BlogPostPage = () => {
  const { slug } = useParams();
  const article = getBlogArticleBySlug(slug);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const breadcrumbs = useMemo(() => [
    { label: "Home", to: "/" },
    { label: "Blog", to: "/blog" },
    ...(article ? [{ label: article.title, to: `/blog/${article.slug}` }] : []),
  ], [article]);

  const currentIndex = BLOG_ARTICLES.findIndex((a) => a.slug === slug);
  const prevArticle = currentIndex > 0 ? BLOG_ARTICLES[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < BLOG_ARTICLES.length - 1
      ? BLOG_ARTICLES[currentIndex + 1]
      : null;

  if (!article) {
    return (
      <div className="mx-auto max-w-4xl py-24 text-center px-4">
        <h1 className="text-3xl font-bold text-navy">Article Not Found</h1>
        <p className="mt-4 text-slate-600">The requested real estate guide does not exist.</p>
        <Link to="/blog" className="site-button-primary mt-6 inline-block">
          Return to Blog Directory
        </Link>
      </div>
    );
  }

  const articleSchema = buildArticleSchema({
    title: article.title,
    description: article.metaDescription,
    url: `/blog/${article.slug}`,
    image: article.image,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate,
    authorName: article.author,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.metaDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Article link copied to clipboard!");
    }
  };

  return (
    <main className="page-shell w-full bg-slate-50/50">
      <SeoHead
        title={article.title}
        description={article.metaDescription}
        keywords={`${article.title}, Hosur real estate, property investment Hosur, DTCP plots Hosur, Hosur Property Experts`}
        canonicalPath={`/blog/${article.slug}`}
        image={article.image}
        type="article"
        schema={[
          buildWebsiteSchema(),
          buildBreadcrumbSchema(breadcrumbs),
          articleSchema,
          article.faqs && article.faqs.length > 0 ? buildFaqSchema(article.faqs) : null,
        ]}
      />

      {/* ── BREADCRUMBS ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-2.5 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.to} className="flex items-center gap-2 whitespace-nowrap">
                {idx > 0 && <ChevronRightIcon className="h-3 w-3 text-slate-400" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-navy max-w-[280px] sm:max-w-md truncate">
                    {crumb.label}
                  </span>
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

      {/* ── ARTICLE HEADER ── */}
      <header className="bg-white border-b border-slate-200 px-4 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-orange/10 text-orange px-3 py-1 font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ClockIcon className="h-3.5 w-3.5" />
              {article.readTime}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Published on {article.displayDate}</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy leading-tight">
            {article.h1 || article.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white font-bold text-sm">
                MH
              </div>
              <div>
                <p className="text-sm font-bold text-navy">{article.author}</p>
                <p className="text-xs text-slate-500">{article.authorRole || "Editorial Reviewer"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-navy hover:border-orange hover:text-orange transition"
              >
                <ShareIcon className="h-4 w-4" />
                Share
              </button>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition shadow-2xs"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Ask Advisor
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── FEATURED IMAGE ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-8 mt-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-slate-100">
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* ── ARTICLE CONTENT & TOC ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-8 py-10 sm:py-14">
        {/* Table of Contents */}
        {article.tableOfContents && article.tableOfContents.length > 0 && (
          <nav
            aria-label="Table of Contents"
            className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-3 text-navy font-bold text-sm">
              <DocumentTextIcon className="h-5 w-5 text-orange" />
              <span>Table of Contents</span>
            </div>
            <ol className="grid gap-2 text-xs sm:text-sm text-slate-600 pl-4 list-decimal marker:text-orange">
              {article.tableOfContents.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="hover:text-orange hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Body Sections */}
        <div className="space-y-10">
          {article.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-20">
              <h2 className="text-xl sm:text-2xl font-bold text-navy border-b border-slate-200 pb-2 mb-4">
                {sec.heading}
              </h2>
              <div
                className="text-sm sm:text-base leading-relaxed text-slate-700 space-y-4 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sec.content }}
              />
            </section>
          ))}
        </div>

        {/* Author Verification Box */}
        <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <ShieldCheckIcon className="h-10 w-10 text-emerald-600 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-navy flex items-center gap-1.5">
              <span>Verified Real Estate Information</span>
              <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              This guide has been prepared by MyHosurProperty's legal scrutiny and valuation desk.
              Always verify original title deeds, DTCP/HNTDA orders, and Encumbrance Certificates
              before executing real estate transactions.
            </p>
          </div>
        </div>

        {/* FAQs */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="text-xl font-bold text-navy mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {article.faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h4 className="text-sm font-bold text-navy flex items-start gap-2">
                    <span className="text-orange font-black">Q.</span>
                    <span>{faq.question}</span>
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next / Prev Article Navigation */}
        <nav className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-8">
          {prevArticle ? (
            <Link
              to={`/blog/${prevArticle.slug}`}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 hover:border-orange transition"
            >
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-orange">
                <ArrowLeftIcon className="h-3 w-3" />
                Previous Guide
              </span>
              <span className="mt-1 text-sm font-bold text-navy line-clamp-2">
                {prevArticle.title}
              </span>
            </Link>
          ) : <div />}

          {nextArticle ? (
            <Link
              to={`/blog/${nextArticle.slug}`}
              className="group flex flex-col text-right rounded-xl border border-slate-200 bg-white p-4 hover:border-orange transition"
            >
              <span className="inline-flex items-center justify-end gap-1 text-xs font-bold text-slate-400 group-hover:text-orange">
                <span>Next Guide</span>
                <ArrowRightIcon className="h-3 w-3" />
              </span>
              <span className="mt-1 text-sm font-bold text-navy line-clamp-2">
                {nextArticle.title}
              </span>
            </Link>
          ) : <div />}
        </nav>

        {/* Call to Action Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-navy to-slate-900 text-white p-6 sm:p-8 text-center shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold">Looking to Buy Property in Hosur?</h3>
          <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-slate-300">
            Connect with our verified local property specialists for free legal consultation and curated site visits.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="site-button-primary rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold"
            >
              Request Free Consultation
            </button>
            <Link
              to="/plots-for-sale-in-hosur"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
            >
              Browse DTCP Plots
            </Link>
          </div>
        </div>
      </div>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        propertyTitle={`Consultation from Blog: ${article.title}`}
      />
    </main>
  );
};

export default BlogPostPage;
