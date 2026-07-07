import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, MagnifyingGlassIcon, SparklesIcon } from "../components/AppIcons";
import ServiceCategoryModal from "../components/ServiceCategoryModal";
import SeoHead from "../components/SeoHead";
import { serviceCategories, serviceQuickLinks } from "../constants/serviceCatalog";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import useScrollAnimation from "../hooks/useScrollAnimation";

// Import service images
import buySellImg from "../assets/property buy guideance.jpg";
import loanImg from "../assets/Home loan.jpg";
import registrationImg from "../assets/Sale deed registration.jpg";
import searchImg from "../assets/plot search.jpg";
import interiorImg from "../assets/interiros.jpg";

const serviceHighlights = [
  {
    id: 1,
    title: "Buy, Sell & Rent Properties",
    description: "Whether you're looking to buy your dream property, sell an existing one, or rent space for your needs, we provide complete guidance through every step of the process. Our experienced team handles all legal documentation and ensures smooth transactions.",
    image: buySellImg,
    highlights: [
      "Expert legal support",
      "Safe & transparent deals",
      "Complete guidance",
      "Fast processing"
    ],
    imagePosition: "right"
  },
  {
    id: 2,
    title: "Loan & Finance Solutions",
    description: "Access competitive home loans, plot loans, commercial loans, and balance transfers with our trusted finance partners. We simplify the application process and help you secure the best rates and terms for your property investment.",
    image: loanImg,
    highlights: [
      "Competitive rates",
      "Easy documentation",
      "Fast approval",
      "Multiple loan options"
    ],
    imagePosition: "left"
  },
  {
    id: 3,
    title: "Registration & Legal Services",
    description: "Complete documentation, sale deed registration, patta transfers, and land surveys—all handled by our expert team. We ensure all your property transactions are legally compliant and registered correctly.",
    image: registrationImg,
    highlights: [
      "Legal compliance",
      "Error-free registration",
      "Fast processing",
      "Complete documentation"
    ],
    imagePosition: "right"
  },
  {
    id: 4,
    title: "Find Your Perfect Property",
    description: "Looking for a specific property? Our advanced search tools and local expertise help you find plots, commercial properties, and agricultural land that match your requirements and budget perfectly.",
    image: searchImg,
    highlights: [
      "Verified properties",
      "Best deals",
      "Local expertise",
      "Personalized search"
    ],
    imagePosition: "left"
  },
  {
    id: 5,
    title: "Interior & Construction Services",
    description: "Transform your vision into reality with our professional interior design and construction services. From residential homes to commercial offices, we deliver quality results on time and within budget.",
    image: interiorImg,
    highlights: [
      "Professional team",
      "Quality materials",
      "On-time delivery",
      "Budget-friendly"
    ],
    imagePosition: "right"
  }
];

const ServicesPage = () => {
  useScrollAnimation();
  const [search, setSearch] = useState("");
  const [activeCategoryKey, setActiveCategoryKey] = useState(null);

  const activeCategory = serviceCategories.find((category) => category.key === activeCategoryKey) || null;

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Our Services", to: "/services" },
  ];

  const term = search.trim().toLowerCase();
  const filteredServices = term
    ? serviceCategories.filter((category) => {
        return (
          category.title.toLowerCase().includes(term) ||
          category.description.toLowerCase().includes(term) ||
          category.services.some((item) => item.label.toLowerCase().includes(term))
        );
      })
    : serviceCategories;

  return (
    <main className="page-shell w-full">
      <SeoHead
        description="Complete property solutions from My Hosur Property, including buying, selling, loans, registration, construction, and legal support."
        keywords="Hosur property services, home loan Hosur, registration services Hosur, construction services Hosur, property legal services Hosur"
        canonicalPath="/services"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      {/* Hero section with load transitions */}
      <section className="marketing-hero px-6 py-10 sm:px-8 lg:px-10 lg:py-14 gsap-section">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center gsap-hero-item">
          <div className="max-w-3xl">
            <div className="site-kicker text-orange-400">
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-navy">
              Complete property solutions for every stage of your real-estate journey.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Complete Property Solutions - From Buying & Selling to Loans, Registration, Construction, and Legal Support.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Quick service links</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {serviceQuickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveCategoryKey(item.key)}
                    className="group inline-flex min-h-[52px] w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-orange hover:text-orange"
                  >
                    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange transition group-hover:bg-orange group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="leading-snug">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <ServiceCategoryModal category={activeCategory} onClose={() => setActiveCategoryKey(null)} />

      {/* Services list section */}
      <section className="bg-surface px-5 py-10 sm:px-8 lg:px-10 gsap-section">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-tag">Search services</p>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">Find the service that matches your property need.</h2>
            </div>
            <div className="w-full max-w-md">
              <div className="flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card">
                <MagnifyingGlassIcon className="h-5 w-5 text-orange" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search loan, registration, legal, interior..."
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              return (
                <article
                  key={category.key}
                  id={`service-${category.key}`}
                  className="group relative flex h-full min-h-[520px] w-full min-w-0 scroll-mt-32 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-orange hover:shadow-[0_18px_42px_rgba(0,66,162,0.12)] gsap-card"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-orange via-orange to-navy" />

                  <div className="flex items-start gap-4 border-b border-slate-100 p-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-navy bg-transparent text-navy shadow-sm transition duration-300 group-hover:border-orange group-hover:text-orange">
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange">
                          {String(categoryIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      <h3 className="mt-2 text-xl font-bold leading-tight text-navy">{category.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="space-y-1">
                      {category.services.map((service) => {
                        const ServiceIcon = service.icon;
                        return (
                          <div
                            key={service.label}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition duration-200 hover:bg-surface"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
                              <ServiceIcon className="h-4 w-4" />
                            </div>
                            <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-navy">{service.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <Link
                      to="/contact"
                      className="inline-flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-bold text-navy ring-1 ring-slate-200 transition hover:bg-orange hover:text-white hover:ring-orange"
                    >
                      <span>Request this service</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Expertise section */}
      <div className="space-y-8 bg-white px-5 py-12 sm:px-8 md:space-y-10 lg:px-10 gsap-section">
        <div className="mx-auto max-w-[1440px] text-center">
          <p className="section-tag">Our Core Expertise</p>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">
            Comprehensive Services with Professional Excellence
          </h2>
        </div>

        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:gap-10">
          {serviceHighlights.map((service) => {
            const isImageRight = service.imagePosition === "right";
            return (
              <div
                key={service.id}
                className="marketing-card w-full overflow-hidden p-0 hover:border-orange gsap-card"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch">
                  <div className={`p-6 sm:p-8 lg:p-10 ${!isImageRight ? "lg:order-2" : ""}`}>
                    <div>
                      <p className="section-tag">Service #{service.id}</p>
                      <h3 className="mt-3 text-2xl font-bold leading-tight text-navy sm:text-3xl">
                        {service.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                        {service.description}
                      </p>
                    </div>

                    {/* Highlights with checkmarks */}
                    <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {service.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-surface px-3 py-2">
                          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange text-white">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium leading-snug text-navy">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-6">
                      <Link
                        to="/contact"
                        className="site-button-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
                      >
                        Contact Us
                        <SparklesIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div
                    className={`relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-64 lg:h-auto lg:min-h-[260px] ${!isImageRight ? "lg:order-1" : ""}`}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support CTA section */}
      <section className="bg-navy px-5 py-12 text-white sm:px-8 lg:px-10 gsap-section">
        <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="text-center lg:text-left">
            <p className="section-tag !text-orange">Need support</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">Need Help Finding Your Property Solution?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white sm:text-base lg:mx-0">
              Connect with My Hosur Property for help across buying, selling, registration, finance, construction, and local property support.
            </p>
            <p className="mt-5 text-sm font-semibold text-orange">My Hosur Property - Trusted Real Estate Partner</p>
          </div>
          <Link to="/contact" className="site-button-primary inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
