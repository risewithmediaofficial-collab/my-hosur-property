import { Link } from "react-router-dom";
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon, UsersIcon } from "../components/AppIcons";
import CountUpNumber from "../components/CountUpNumber";
import MarketingCard, { IconCircle } from "../components/MarketingCard";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

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

      <PageHero
        tag="About the platform"
        title="A professional property platform designed around Hosur."
        description="MyHosurProperty connects buyers, sellers, agents, builders, and service teams through a cleaner real-estate experience focused on verified listings, guided transactions, and trustworthy local support."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/listings" className="site-button-primary rounded-lg px-6 py-3 text-sm font-bold">
            Browse Listings
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            Talk to Our Team
          </Link>
        </div>
      </PageHero>

      <PageSection tone="surface" className="!py-10">
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
