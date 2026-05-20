import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import CountUpNumber from "../components/CountUpNumber";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

const MotionSection = motion.section;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

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
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 md:space-y-8 md:py-8 lg:px-6">
      <SeoHead
        title="About MyHosurProperty"
        description="Learn how MyHosurProperty combines verified listings, local real-estate support, and a professional digital experience for Hosur."
        keywords="about MyHosurProperty, Hosur real estate platform, verified property portal in Hosur, Hosur property marketplace"
        canonicalPath="/about"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <MotionSection
        initial="hidden"
        animate="show"
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_12px_30px_rgba(17,17,17,0.04)] sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <motion.div variants={reveal} custom={0.05} className="site-kicker">
              About the platform
            </motion.div>
            <motion.h1 variants={reveal} custom={0.1} className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl">
              A professional property platform designed around Hosur.
            </motion.h1>
            <motion.p variants={reveal} custom={0.15} className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              MyHosurProperty connects buyers, sellers, agents, builders, and service teams through a cleaner real-estate experience focused on verified listings, guided transactions, and trustworthy local support.
            </motion.p>
            <motion.div variants={reveal} custom={0.2} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/listings" className="site-button-primary rounded-2xl px-6 py-3.5 text-sm">
                Browse Listings
              </Link>
              <Link to="/contact" className="site-button-secondary rounded-2xl px-6 py-3.5 text-sm">
                Talk to Our Team
              </Link>
            </motion.div>
          </div>

          <motion.div variants={reveal} custom={0.15} className="grid gap-4">
            <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white">
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80"
                alt="Modern home exterior representing the MyHosurProperty platform"
                className="h-[320px] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-3xl font-semibold text-slate-900">
                    <CountUpNumber value={item.value} suffix={item.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.18 }}
        variants={reveal}
        className="grid gap-4 md:grid-cols-3"
      >
        {principles.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              variants={reveal}
              custom={index * 0.05}
              className="rounded-[1.7rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </motion.article>
          );
        })}
      </MotionSection>

      <MotionSection
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={reveal}
        className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-8 sm:px-8"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Built for clarity</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              A local real-estate platform that feels simple, premium, and trustworthy.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              We combine property discovery, documentation support, service assistance, and local market knowledge into one structured platform for Hosur.
            </p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black">
            Explore Our Services
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </MotionSection>
    </main>
  );
};

export default AboutPage;
