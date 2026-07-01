import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon, UsersIcon } from "../components/AppIcons";
import CountUpNumber from "../components/CountUpNumber";
import MarketingCard, { IconCircle } from "../components/MarketingCard";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";
import founderImage from "../assets/myhosurproperty vijay kumar founder.jpeg";

const stats = [
  { value: 2500, suffix: "+", label: "Verified listings" },
  { value: 12000, suffix: "+", label: "Leads managed" },
  { value: 25, suffix: "+", label: "Service categories" },
];

const principles = [
  {
    title: "Trust-first moderation",
    description: "Listings are reviewed before they go live so the marketplace stays more reliable and professional.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Real local context",
    description: "The platform is built around Hosur demand, neighbourhood needs, and practical property decisions.",
    icon: UsersIcon,
  },
  {
    title: "Cleaner experience",
    description: "Discovery, posting, and lead handling are structured to feel simple, calm, and decision-ready.",
    icon: CheckCircleIcon,
  },
];

/* ── Vision / Mission / Core Values icons as inline SVGs for clean rendering ── */
const VisionIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto">
    <circle cx="32" cy="32" r="20" stroke="#0042a2" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="32" r="8" stroke="#0042a2" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="32" r="2" fill="#f79e26"/>
    <line x1="32" y1="8" x2="32" y2="14" stroke="#0042a2" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="50" x2="32" y2="56" stroke="#0042a2" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="8" y1="32" x2="14" y2="32" stroke="#0042a2" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="50" y1="32" x2="56" y2="32" stroke="#0042a2" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const MissionIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto">
    <circle cx="32" cy="32" r="22" stroke="#0042a2" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="32" r="14" stroke="#0042a2" strokeWidth="2" fill="none" strokeDasharray="4 3"/>
    <circle cx="32" cy="32" r="6" stroke="#0042a2" strokeWidth="2" fill="none"/>
    <path d="M32 10 L36 20 L48 16 L40 26" stroke="#f79e26" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="32" cy="32" r="2.5" fill="#f79e26"/>
  </svg>
);

const CoreValuesIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto">
    <path d="M32 8 L40 20 L54 22 L44 33 L46 48 L32 41 L18 48 L20 33 L10 22 L24 20 Z" stroke="#0042a2" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
    <path d="M32 16 L37 24 L46 26 L40 33 L42 42 L32 37 L22 42 L24 33 L18 26 L27 24 Z" stroke="#f79e26" strokeWidth="1.5" fill="none" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="32" cy="32" r="3" fill="#f79e26"/>
  </svg>
);

const vmcData = [
  {
    Icon: VisionIcon,
    title: "Vision",
    content: null,
    paragraph:
      "To become Hosur's most trusted real estate platform — offering verified listings, clear titles, and local property support that empowers every buyer, seller, and owner to make decisions with confidence and clarity.",
  },
  {
    Icon: MissionIcon,
    title: "Mission",
    bullets: [
      "Hosur's trusted and verified real estate marketplace, delivering lasting value and secure property transactions.",
      "Ensuring clear titles and transparent listings for every property seeker.",
      "Delivering customer-centric real estate solutions built on local knowledge.",
      "Leveraging technology to streamline property discovery and transactions.",
      "Expanding offerings across plots, villas, apartments, and commercial spaces.",
      "Building long-term relationships with clients, agents, and stakeholders.",
    ],
  },
  {
    Icon: CoreValuesIcon,
    title: "Core Values",
    bullets: ["Trust", "Integrity", "Team Spirit", "Respect", "Passion", "Transparency"],
  },
];

const AboutPage = () => {
  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
  ];

  return (
    <main className="page-shell w-full">
      <SeoHead
        title="About MyHosurProperty"
        description="Learn how MyHosurProperty combines verified listings, local real-estate support, and a professional digital experience for Hosur."
        keywords="about MyHosurProperty, Hosur real estate platform, verified property portal in Hosur, Hosur property marketplace"
        canonicalPath="/about"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />
      {/* Stats + Image */}
      <PageSection tone="surface" className="!pt-24 sm:!pt-28 !pb-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80"
              alt="Modern home exterior representing the MyHosurProperty platform"
              className="h-[280px] w-full object-cover sm:h-[320px]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="stat-card text-center lg:text-left">
                <p className="stat-value">
                  <CountUpNumber value={item.value} suffix={item.suffix} />
                </p>
                <p className="stat-label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ── Vision / Mission / Core Values ── */}
      <section className="bg-white px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 md:grid-cols-3">
            {vmcData.map(({ Icon, title, paragraph, bullets }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center px-4 py-6"
              >
                {/* Icon */}
                <Icon />

                {/* Divider line below icon */}
                <div className="mt-5 w-12 border-b-2 border-navy" />

                {/* Title */}
                <h2
                  style={{ fontFamily: "var(--site-heading)" }}
                  className="mt-5 text-3xl font-bold text-navy"
                >
                  {title}
                </h2>

                {/* Content */}
                {paragraph ? (
                  <p className="mt-4 text-sm leading-7 text-slate-600 text-left">
                    {paragraph}
                  </p>
                ) : null}

                {bullets ? (
                  <ul className="mt-4 space-y-2 text-left w-full">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-navy" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Principles ── */}
      <PageSection tag="Our principles" title="Built for trust and clarity in Hosur real estate">
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <MarketingCard key={item.title} className="text-center sm:text-left">
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
      
      <section className="bg-white px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              OUR FOUNDER
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Founder content */}
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
            {/* Text side */}
            <div>
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">
                Mr. Vijay Kumar
              </h2>
              <p className="mt-1 text-base font-semibold text-slate-500">
                Founder &amp; Managing Director, Gyes Construction
              </p>

              <p className="mt-6 text-sm leading-8 text-slate-600">
                A first-generation entrepreneur and visionary leader, Mr. Vijay Kumar is a dedicated
                contributor who began his entrepreneurial journey with an unwavering commitment to
                transforming Hosur's real estate landscape. Over the years, he has built a trusted
                name across property transactions, construction, and community-focused development.
              </p>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                Under his leadership, MyHosurProperty was founded with the goal of creating a
                transparent, verified, and accessible property platform for buyers, sellers, and
                investors in Hosur. He is deeply passionate about building communities, empowering
                local professionals, and ensuring every property seeker gets the honest guidance
                they deserve.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/contact"
                  className="site-button-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  Get In Touch
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Photo side */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-card">
              <img
                src={founderImage}
                alt="Founder of MyHosurProperty — Mr. Vijay Kumar"
                className="h-[520px] w-full object-cover object-center sm:h-[560px]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <PageSection tone="navy" innerClassName="lg:flex lg:items-center lg:justify-between lg:gap-8">
        <div className="text-center lg:text-left">
          <p className="section-tag !text-orange">Built for clarity</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            A local real-estate platform that feels simple, premium, and trustworthy.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white sm:text-base lg:mx-0">
            We combine property discovery, documentation support, service assistance, and local market knowledge into one structured platform for Hosur.
          </p>
        </div>
        <Link to="/services" className="site-button-primary mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold lg:mt-0">
          Explore Our Services
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </PageSection>
    </main>
  );
};

export default AboutPage;
