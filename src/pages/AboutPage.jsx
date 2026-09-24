import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  GardenIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "../components/AppIcons";
import CountUpNumber from "../components/CountUpNumber";
import MarketingCard, { IconCircle } from "../components/MarketingCard";
import PageSection from "../components/PageSection";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import { useAppLanguage } from "../context/LanguageContext";
import { localizeCatalogText } from "../utils/i18nCatalog";
import useScrollAnimation from "../hooks/useScrollAnimation";
import founderImage from "../assets/myhosurproperty vijay kumar founder.jpeg";
import directorImage from "../assets/director 1.jpeg";

const VisionIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.4"/>
    <path d="M6 24 C13 14 35 14 42 24 C35 34 13 34 6 24 Z" stroke="currentColor" strokeWidth="2.2" fill="none"/>
    <circle cx="24" cy="24" r="6" stroke="#f79e26" strokeWidth="2.2" fill="none"/>
    <circle cx="24" cy="24" r="2.5" fill="#f79e26"/>
    <path d="M24 6 L24 10 M24 38 L24 42 M6 24 L10 24 M38 24 L42 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const MissionIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.3"/>
    <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.6"/>
    <circle cx="24" cy="24" r="6" stroke="#f79e26" strokeWidth="2" fill="none"/>
    <path d="M33 15 L24 24" stroke="#f79e26" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M31 13 L35 17 L37 11 Z" fill="#f79e26"/>
    <circle cx="24" cy="24" r="2" fill="#f79e26"/>
  </svg>
);

const CoreValuesIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
    <path d="M24 6 L30 16 L41 18 L33 27 L35 38 L24 33 L13 38 L15 27 L7 18 L18 16 Z" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round"/>
    <path d="M24 12 L28 19 L36 20 L30 27 L31 35 L24 31 L17 35 L18 27 L12 20 L20 19 Z" stroke="#f79e26" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.8"/>
    <circle cx="24" cy="24" r="2.5" fill="#f79e26"/>
  </svg>
);

const coreValueItems = [
  { label: "Trust",        emoji: "🤝" },
  { label: "Integrity",    emoji: "⚖️" },
  { label: "Team Spirit",  emoji: "🌟" },
  { label: "Respect",      emoji: "🙏" },
  { label: "Passion",      emoji: "🔥" },
  { label: "Transparency", emoji: "🔍" },
];

const AboutPage = () => {
  const { t, currentLanguage } = useAppLanguage();
  useScrollAnimation(null, []);
  const breadcrumbs = [
    { label: t("nav.home") || "Home", to: "/" },
    { label: t("nav.aboutUs") || "About", to: "/about" },
  ];

  const vmcData = useMemo(() => [
    {
      Icon: VisionIcon,
      accent: "from-blue-600 to-navy",
      title: t("about.visionTitle") || "Vision",
      paragraph:
        t("about.visionDesc") ||
        "To become Hosur's most trusted real estate platform — offering verified listings, clear titles, and local property support that empowers every buyer, seller, and owner to make decisions with confidence and clarity.",
    },
    {
      Icon: MissionIcon,
      accent: "from-orange to-amber-500",
      title: t("about.missionTitle") || "Mission",
      paragraph:
        t("about.missionDesc") ||
        "Hosur's trusted and verified real estate marketplace, delivering lasting value, transparent listings, and secure property transactions built on local knowledge and modern technology.",
    },
    {
      Icon: CoreValuesIcon,
      accent: "from-emerald-500 to-teal-600",
      title: t("about.coreValuesTitle") || "Core Values",
      coreValues: coreValueItems,
    },
  ], [t]);

  const principles = useMemo(() => [
    {
      icon: ShieldCheckIcon,
      title: t("about.trustTitle") || "Trust-first moderation",
      description:
        t("about.trustDesc") ||
        "Listings are reviewed before they go live so the marketplace stays more reliable and professional.",
    },
    {
      icon: SparklesIcon,
      title: t("about.localTitle") || "Real local context",
      description:
        t("about.localDesc") ||
        "The platform is built around Hosur demand, neighbourhood needs, and practical property decisions.",
    },
    {
      icon: UsersIcon,
      title: t("about.cleanTitle") || "Cleaner experience",
      description:
        t("about.cleanDesc") ||
        "Discovery, posting, and lead handling are structured to feel simple, calm, and decision-ready.",
    },
  ], [t]);

  return (
    <main className="page-shell w-full">
      <SeoHead
        title="About MyHosurProperty"
        description="Learn how MyHosurProperty combines verified listings, local real-estate support, and a professional digital experience for Hosur."
        keywords="about MyHosurProperty, Hosur real estate platform, verified property portal in Hosur, Hosur property marketplace"
        canonicalPath="/about"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />
      {/* Our Story */}
      <PageSection 
        tag={t("about.ourStoryTag") || "Our Story"} 
        title={t("about.ourStoryTitle") || "Built on Trust. Driven by Purpose."} 
        tone="surface" 
        className="!pt-6 sm:!pt-8 !pb-14"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="border-l-4 border-orange pl-4">
              <p className="text-base leading-7 text-slate-700 font-semibold">
                {t("about.ourStoryHighlight") || "What began as a small vision to create honest and quality real estate experiences has grown into a trusted platform for thousands of families and investors in Hosur."}
              </p>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {t("about.ourStoryDesc") || "We believe every property holds potential – not just in value, but in the life it helps build. That's why we combine local expertise with modern technology to help you find spaces that truly fit your dreams and future."}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-4 border-t border-slate-100 pt-6">
              {[
                { value: 100, suffix: "+", label: t("home.stats.verifiedListings") || "Verified Listings" },
                { value: 100, suffix: "+", label: t("home.trustStats.happyClients") || "Happy Clients" },
                { value: 8, suffix: "+", label: t("about.yearsOfTrust") || "Years of Trust" }
              ].map((item) => (
                <div key={item.label} className="text-left">
                  <p className="text-2xl font-bold text-navy sm:text-3xl">
                    <CountUpNumber value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card gsap-card">
            <img
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
              alt="Premium villa representing Gyes Construction"
              className="h-[320px] w-full object-cover sm:h-[380px]"
              loading="lazy"
              decoding="async"
            />
            {/* Overlay card */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-navy text-white rounded-xl p-4 shadow-lg flex items-center gap-3 max-w-[280px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                <CheckCircleIcon className="h-6 w-6 text-orange" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange">My Hosur Property</p>
                <p className="text-xs leading-relaxed text-white/90 font-medium mt-0.5">
                  {localizeCatalogText("Building more than properties, we build trust.", currentLanguage)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-20 border-t border-slate-100 pt-16">
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Connecting line for desktop */}
            <div className="absolute left-10 right-10 top-6 hidden h-0.5 bg-slate-200 lg:block" />

            {[
              { year: "2018", title: "The Beginning", desc: "Started with a simple goal to make real estate transparent and reliable in our community.", icon: GardenIcon },
              { year: "2020", title: "Growing Together", desc: "Expanded our team and services, helping more clients find the right spaces.", icon: UsersIcon },
              { year: "2022", title: "Building Trust", desc: "Earned thousands of happy clients and became a trusted real estate partner.", icon: CheckBadgeIcon },
              { year: "2024", title: "Expanding Horizons", desc: "Introduced advanced technology and new services to create better experiences.", icon: ChartBarIcon },
              { year: "Future", title: "Continuing Journey", desc: "We continue to innovate, serve, and build a better future for our clients.", icon: HomeModernIcon }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative z-10 flex flex-col items-center text-center px-4">
                  {/* Circle container */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#0042a2] text-[#0042a2] shadow-sm transition hover:scale-105">
                    <Icon className="h-5 w-5 text-orange" />
                  </div>
                  <div className="mt-3 text-sm font-bold text-orange">{item.year}</div>
                  <h4 className="mt-1 text-sm font-bold text-navy">{localizeCatalogText(item.title, currentLanguage)}</h4>
                  <p className="mt-2 text-xs leading-5 text-slate-500 max-w-[190px]">{localizeCatalogText(item.desc, currentLanguage)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Quote Box */}
        <div className="mt-16 bg-white border border-slate-200/60 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl text-orange font-serif leading-none select-none">“</span>
            <p className="text-sm sm:text-base font-medium text-navy leading-relaxed italic">
              {localizeCatalogText("Our story is not just about buildings. It's about people, dreams, and the future we build together.", currentLanguage)}
            </p>
          </div>
          <div className="flex-shrink-0 text-center md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{localizeCatalogText("With Gratitude", currentLanguage)}</p>
            <p className="text-sm font-bold text-navy mt-1 font-philosopher italic">{localizeCatalogText("Thank you for being part of our journey.", currentLanguage)}</p>
          </div>
        </div>
      </PageSection>

      {/* ── Vision / Mission / Core Values ── */}
      <section className="bg-slate-50 px-5 py-16 sm:px-8 lg:px-10 gsap-section border-t border-slate-100">
        <div className="mx-auto max-w-[1440px]">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{localizeCatalogText("Our Foundation", currentLanguage)}</span>
            <h2 className="mt-3 text-2xl font-bold text-navy sm:text-3xl">{localizeCatalogText("Vision, Mission & Core Values", currentLanguage)}</h2>
            <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-orange" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {vmcData.map(({ Icon, accent, title, paragraph, bullets, coreValues }) => (
              <div
                key={title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-card gsap-card hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icon badge */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md mb-6`}>
                  <Icon />
                </div>

                {/* Title */}
                <h3
                  style={{ fontFamily: "var(--site-heading)" }}
                  className="text-2xl font-bold text-navy"
                >
                  {title}
                </h3>
                <div className="mt-3 h-0.5 w-10 rounded-full bg-orange/60" />

                {/* Content */}
                {paragraph ? (
                  <p className="mt-5 text-sm leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ) : null}

                {bullets ? (
                  <ul className="mt-5 space-y-3 w-full">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                        <span className="mt-1.5 flex-shrink-0 h-4 w-4 rounded-full bg-orange/15 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange block" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {coreValues ? (
                  <div className="mt-5 grid grid-cols-2 gap-3 w-full">
                    {coreValues.map(({ label, emoji }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
                      >
                        <span className="text-lg leading-none">{emoji}</span>
                        <span className="text-xs font-semibold text-navy">{localizeCatalogText(label, currentLanguage)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Principles ── */}
      <PageSection tag="Our principles" title="Built for trust and clarity in Hosur real estate" className="gsap-section">
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <MarketingCard key={item.title} className="text-center sm:text-left gsap-card">
                <IconCircle className="mx-auto sm:mx-0">
                  <Icon className="h-6 w-6" />
                </IconCircle>
                <h3 className="mt-5 text-xl font-bold text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </MarketingCard>
            );
          })}
        </div>
      </PageSection>

      {/* ── Our Founder ── */}
      
      <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 gsap-section">
        <div className="mx-auto max-w-[1440px]">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              {t("about.founderTag") || "OUR FOUNDER"}
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Founder content */}
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            {/* Text side */}
            <div>
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">
                Mr. Vijaykumar
              </h2>
              <p className="mt-1 text-base font-semibold text-slate-500">
                {t("about.founderTitle") || "Founder & Managing Director"}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wide">B.Tech</p>

              {/* Associated Businesses */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Gyes Property & Construction", "OneClick", "My Hosur Property", "Gyes Traders"].map((company) => (
                  <span
                    key={company}
                    className="inline-flex items-center rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange border border-orange/20"
                  >
                    {company}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm leading-8 text-slate-600">
                {localizeCatalogText("A first-generation entrepreneur and visionary leader, Mr. Vijaykumar is a dedicated contributor who began his entrepreneurial journey with an unwavering commitment to transforming Hosur's real estate landscape. Over the years, he has built a trusted name across property transactions, construction, and community-focused development.", currentLanguage)}
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                {localizeCatalogText("Under his leadership, My Hosur Property was founded with the goal of creating a transparent, verified, and accessible property platform for buyers, sellers, and investors in Hosur. He is deeply passionate about building communities, empowering local professionals, and ensuring every property seeker gets the honest guidance they deserve.", currentLanguage)}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="site-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  {t("contactPage.getInTouch") || "Get In Touch"}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Photo side */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-card gsap-card">
              <img
                src={founderImage}
                alt="Founder of MyHosurProperty — Mr. Vijaykumar"
                className="h-[520px] w-full object-cover object-center sm:h-[560px]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-14 sm:px-8 lg:px-10 gsap-section border-t border-b border-slate-100">
        <div className="mx-auto max-w-[1440px]">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              {t("about.directorTag") || "OUR DIRECTOR"}
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Director content */}
          <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-center">
            {/* Photo side */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card gsap-card">
              <img
                src={directorImage}
                alt="Director of MyHosurProperty — Mr. Raja"
                className="h-[520px] w-full object-cover object-center sm:h-[560px]"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Text side */}
            <div>
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">
                Mr. Raja
              </h2>
              <p className="mt-1 text-base font-semibold text-slate-500">
                {t("about.directorTitle") || "Director, My Hosur Property"}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wide">B.Sc</p>

              <p className="mt-6 text-sm leading-8 text-slate-600">
                {localizeCatalogText("Raja is a dynamic leader and key strategist at MyHosurProperty, bringing 7 years of experience in marketing and property ecosystem growth. He plays an active role in driving our vision of a trusted real estate platform, with strong experience in client coordination, property valuation, and local operations.", currentLanguage)}
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                {localizeCatalogText("Focused on delivering high-value opportunities to buyers and investors, Raja coordinates closely with verified partners to maintain the highest quality standards on the platform. He is deeply committed to client satisfaction, direct communications, and building long-term relationships based on honesty and professional excellence.", currentLanguage)}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="site-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  {t("about.contactOffice") || "Contact Office"}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageSection tone="white" innerClassName="lg:flex lg:items-center lg:justify-between lg:gap-8 border border-slate-200/60 rounded-2xl bg-white p-8 sm:p-10 shadow-soft" className="gsap-section">
        <div className="text-center lg:text-left">
          <p className="section-tag !text-orange">{localizeCatalogText("Built for clarity", currentLanguage)}</p>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl lg:text-4xl">
            {localizeCatalogText("A local real-estate platform that feels simple, premium, and trustworthy.", currentLanguage)}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base lg:mx-0">
            {localizeCatalogText("We combine property discovery, documentation support, service assistance, and local market knowledge into one structured platform for Hosur.", currentLanguage)}
          </p>
        </div>
        <Link to="/services" className="site-button-primary mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold lg:mt-0">
          {t("about.exploreServices") || t("home.cta.exploreServices") || "Explore Our Services"}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </PageSection>
    </main>
  );
};

export default AboutPage;
