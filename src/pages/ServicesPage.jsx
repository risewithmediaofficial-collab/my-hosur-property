import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  DocumentMagnifyingGlassIcon,
  DocumentTextIcon,
  HandRaisedIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapIcon,
  MapPinIcon,
  PaintBrushIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import CountUpNumber from "../components/CountUpNumber";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

// Import service images
import buySellImg from "../assets/property buy guideance.jpg";
import loanImg from "../assets/Home loan.jpg";
import registrationImg from "../assets/Sale deed registration.jpg";
import searchImg from "../assets/plot search.jpg";
import interiorImg from "../assets/interiros.jpg";
import contractorImg from "../assets/contarcts works.jpg";

const MotionSection = motion.section;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const listReveal = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

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
  },
  {
    id: 6,
    title: "Skilled Contractor Services",
    description: "Access our network of skilled contractors for electrical work, plumbing, masonry, and general maintenance. Quality workmanship, reliable service, and fair pricing for all your maintenance needs.",
    image: contractorImg,
    highlights: [
      "Certified workers",
      "Quality assured",
      "Fair pricing",
      "Quick response"
    ],
    imagePosition: "left"
  }
];

const serviceCategories = [
  {
    key: "buy-sell-rent",
    title: "Buy / Sell / Rent",
    description: "We help customers buy, sell, and rent properties with complete assistance.",
    icon: HomeModernIcon,
    services: [
      { label: "Property legal service", icon: ScaleIcon },
      { label: "Sale agreement support", icon: HandRaisedIcon },
      { label: "Property buying guidance", icon: HomeModernIcon },
      { label: "Property selling guidance", icon: SparklesIcon },
    ],
  },
  {
    key: "loan-services",
    title: "Loan Services",
    description: "Fast and reliable loan assistance for various property requirements.",
    icon: BanknotesIcon,
    services: [
      { label: "Home loan", icon: CreditCardIcon },
      { label: "Plot loan", icon: BanknotesIcon },
      { label: "Commercial loan", icon: BuildingOffice2Icon },
      { label: "Agriculture loan", icon: MapIcon },
      { label: "Home loan balance transfer", icon: DocumentTextIcon },
    ],
  },
  {
    key: "registration-services",
    title: "Registration Services",
    description: "End-to-end documentation and registration assistance.",
    icon: DocumentTextIcon,
    services: [
      { label: "Sale deed registration", icon: DocumentTextIcon },
      { label: "Patta transfer", icon: ShieldCheckIcon },
      { label: "Land survey", icon: MapIcon },
    ],
  },
  {
    key: "property-search",
    title: "Property Search",
    description: "Find suitable properties based on your requirements.",
    icon: MagnifyingGlassIcon,
    services: [
      { label: "Plot search", icon: MapPinIcon },
      { label: "Commercial property search", icon: BuildingOffice2Icon },
      { label: "Agriculture land search", icon: MapIcon },
    ],
  },
  {
    key: "interior-construction",
    title: "Interior & Construction",
    description: "Premium interior and construction solutions.",
    icon: PaintBrushIcon,
    services: [
      { label: "Home interiors", icon: HomeModernIcon },
      { label: "Office interiors", icon: PaintBrushIcon },
      { label: "Construction services", icon: BuildingOffice2Icon },
      { label: "Approval plans", icon: DocumentMagnifyingGlassIcon },
    ],
  },
  {
    key: "contractor-services",
    title: "Contractor Services",
    description: "Professional workers and construction support.",
    icon: WrenchScrewdriverIcon,
    services: [
      { label: "Electrical", icon: SparklesIcon },
      { label: "Plumbing", icon: WrenchScrewdriverIcon },
      { label: "Masonry work", icon: BuildingOffice2Icon },
      { label: "General maintenance", icon: ShieldCheckIcon },
    ],
  },
  {
    key: "property-management",
    title: "Property Management Service",
    description: "Comprehensive maintenance and management for all types of properties.",
    icon: HomeModernIcon,
    services: [
      { label: "House & Office, Apartment, Industry Maintenance & AMC Service", icon: BuildingOffice2Icon },
      { label: "NRI Property Management Service", icon: HomeModernIcon },
      { label: "Farm Management", icon: MapIcon },
      { label: "House Management", icon: HomeModernIcon },
      { label: "Bungalow Management", icon: HomeModernIcon },
      { label: "Agriculture Land Maintenance", icon: MapIcon },
    ],
  },
  {
    key: "home-office-services",
    title: "Home & Office Services",
    description: "Complete maintenance and support services for homes and offices.",
    icon: WrenchScrewdriverIcon,
    services: [
      { label: "Home & Office Cleaning", icon: SparklesIcon },
      { label: "Home & Office Shifting (Packers & Movers)", icon: DocumentTextIcon },
      { label: "Home Appliance Service (TV, Fridge, Washing Machine Repair)", icon: WrenchScrewdriverIcon },
      { label: "Electrical & Plumbing Service", icon: SparklesIcon },
      { label: "Carpentry & Interior Work", icon: PaintBrushIcon },
      { label: "Pest Control Service", icon: ShieldCheckIcon },
      { label: "Bathroom Cleaning (Toilet Acid Wash)", icon: SparklesIcon },
      { label: "Tank & Sump Cleaning", icon: WrenchScrewdriverIcon },
      { label: "Painting Work", icon: PaintBrushIcon },
      { label: "Sofa Cleaning", icon: SparklesIcon },
      { label: "Carpet Cleaning", icon: SparklesIcon },
      { label: "Land Scaping", icon: MapIcon },
      { label: "Garden Maintenance", icon: MapIcon },
    ],
  },
];

const ServicesPage = () => {
  const [search, setSearch] = useState("");

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Our Services", to: "/services" },
  ];

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return serviceCategories;
    return serviceCategories.filter((category) => {
      return (
        category.title.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term) ||
        category.services.some((item) => item.label.toLowerCase().includes(term))
      );
    });
  }, [search]);

  return (
    <main className="page-shell w-full">
      <SeoHead
        title="My Hosur Property - Our Services"
        description="Complete property solutions from My Hosur Property, including buying, selling, loans, registration, construction, and legal support."
        keywords="Hosur property services, home loan Hosur, registration services Hosur, construction services Hosur, property legal services Hosur"
        canonicalPath="/services"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="marketing-hero px-6 py-10 sm:px-8 lg:px-10 lg:py-14"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <motion.div variants={reveal} custom={0.05} className="site-kicker">
              My Hosur Property - Our Services
            </motion.div>
            <motion.h1 variants={reveal} custom={0.1} className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Complete property solutions for every stage of your real-estate journey.
            </motion.h1>
            <motion.p variants={reveal} custom={0.15} className="mt-5 max-w-3xl text-base leading-8">
              Complete Property Solutions - From Buying & Selling to Loans, Registration, Construction, and Legal Support.
            </motion.p>
          </div>

          <motion.div variants={reveal} custom={0.2} className="grid gap-3 sm:grid-cols-3">
            <div className="stat-card text-center">
              <p className="stat-value">
                <CountUpNumber value={serviceCategories.length} />
              </p>
              <p className="stat-label">Core service categories</p>
            </div>
            <div className="stat-card text-center">
              <p className="stat-value">
                <CountUpNumber value={42} suffix="+" />
              </p>
              <p className="stat-label">Specialized support services</p>
            </div>
            <div className="stat-card text-center">
              <p className="stat-value">
                <CountUpNumber value={1} />
              </p>
              <p className="stat-label">Trusted platform partner</p>
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={listReveal}
        className="bg-surface px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
        <motion.div variants={cardReveal} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
        </motion.div>

        <div className="mt-6 grid grid-cols-1 items-start gap-5 min-w-0 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <motion.article
                key={category.key}
                variants={cardReveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.01 }}
                className="marketing-card w-full min-w-0 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange sm:p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy sm:text-xl">{category.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>

                <div className="mt-4 space-y-2">
                  {category.services.map((service) => {
                    const ServiceIcon = service.icon;
                    return (
                      <div
                        key={service.label}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-surface px-3 py-2"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-navy text-white">
                          <ServiceIcon className="h-4 w-4" />
                        </div>
                        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-navy">{service.label}</p>
                      </div>
                    );
                  })}
                </div>

                <Link to="/contact" className="link-orange mt-5 inline-flex items-center gap-2">
                  Contact Us
                  <SparklesIcon className="h-4 w-4" />
                </Link>
              </motion.article>
            );
          })}
        </div>
        </div>
      </MotionSection>

      <div className="space-y-8 bg-white px-5 py-12 sm:px-8 md:space-y-10 lg:px-10">
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
            <motion.div
              key={service.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              variants={cardReveal}
              className="marketing-card w-full overflow-hidden p-0 hover:border-orange"
            >
              <div className="grid lg:grid-cols-2 lg:items-stretch">
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
                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
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
                  className={`relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-64 lg:h-full lg:min-h-[260px] ${!isImageRight ? "lg:order-1" : ""}`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>
      </div>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="bg-navy px-5 py-12 text-white sm:px-8 lg:px-10"
      >
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
      </MotionSection>
    </main>
  );
};

export default ServicesPage;
