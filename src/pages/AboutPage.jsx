import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import SeoHead from "../components/SeoHead";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema } from "../utils/seo";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: "Platform users", value: "25K+" },
  { label: "Properties listed", value: "8K+" },
  { label: "Leads managed", value: "12K+" },
];

const principles = [
  {
    title: "Trust-first moderation",
    description: "Property submissions are screened before they appear publicly, keeping the marketplace cleaner from the start.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Multi-role workflow",
    description: "Buyers, owners, brokers, builders, and admins all move through one structured product instead of disconnected tools.",
    icon: UsersIcon,
  },
  {
    title: "Decision-ready experience",
    description: "Search, shortlist, and contact paths are built to reduce clutter so good listings are easier to act on.",
    icon: CheckCircleIcon,
  },
];

const storyBlocks = [
  {
    title: "Local by design",
    description: "The platform is shaped around Hosur demand, micro-markets, and the practical questions buyers and owners actually ask.",
  },
  {
    title: "Professional in feel",
    description: "From listing presentation to lead handling, the interface is meant to feel sharper than a typical classifieds board.",
  },
  {
    title: "Built to scale",
    description: "The same system supports everyday property search, posting workflows, moderation, plans, and admin operations.",
  },
];

const journey = [
  "Property discovery with cleaner filtering",
  "Publishing flow for owners and brokers",
  "Moderation before listings go live",
  "Inquiry approval and lead management",
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const MotionDiv = motion.div;
const MotionSection = motion.section;

const AboutPage = () => {
  const heroRef = useRef(null);
  const revealRefs = useRef([]);

  const setRevealRef = (node) => {
    if (node && !revealRefs.current.includes(node)) {
      revealRefs.current.push(node);
    }
  };

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll("[data-about-hero]"),
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
          }
        );
      }

      revealRefs.current.forEach((node, index) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            delay: index * 0.04,
            scrollTrigger: {
              trigger: node,
              start: "top 84%",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 md:space-y-8 md:py-8 lg:px-6">
      <SeoHead
        title="About MyHosurProperty"
        description="Learn how MyHosurProperty helps buyers, sellers, owners, and brokers discover verified property listings in Hosur with stronger trust, cleaner search, and better lead handling."
        keywords="about MyHosurProperty, Hosur real estate platform, verified property portal in Hosur, Hosur property marketplace"
        canonicalPath="/about"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />
      <Breadcrumbs items={breadcrumbs} className="px-1" />
      <section
        ref={heroRef}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(248,243,236,0.88))] px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:px-8 lg:px-10 lg:py-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(245,200,128,0.18),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(59,130,246,0.12),transparent_22%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <MotionDiv
              data-about-hero
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="site-kicker"
            >
              <SparklesIcon className="h-4 w-4" />
              About the platform
            </MotionDiv>

            <h1
              data-about-hero
              className="mt-5 max-w-4xl font-['Fraunces'] text-4xl leading-[1.03] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-6xl"
            >
              A more intentional way to discover and publish property in Hosur.
            </h1>

            <p data-about-hero className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              MyHosurProperty brings verified listings, cleaner decision-making, and structured lead handling into one experience
              that feels calmer, sharper, and more trustworthy for every role on the platform.
            </p>

            <div data-about-hero className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/listings" className="site-button-primary rounded-2xl px-5 py-3.5 text-sm">
                Explore listings
              </Link>
              <Link to="/post-property" className="site-button-secondary rounded-2xl px-5 py-3.5 text-sm">
                Post a property
              </Link>
            </div>
          </div>

          <div data-about-hero className="grid gap-4">
            <div className="overflow-hidden rounded-[1.8rem] border border-slate-200/70 bg-slate-900 text-white shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
              <div className="relative min-h-[280px] overflow-hidden p-6">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80"
                  alt="Modern luxury home exterior symbolizing verified Hosur real estate listings"
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.12),rgba(15,23,42,0.86))]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3d8af]">
                      <BuildingOffice2Icon className="h-4 w-4" />
                      Platform scope
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">
                      Search, posting, moderation, and lead flow in one connected system.
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-[1.25rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                        <p className="text-2xl font-semibold text-white">{stat.value}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-300">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {storyBlocks.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-white/70 bg-white/78 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b6b3f]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MotionSection
        ref={setRevealRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={fadeUp}
        className="grid gap-4 md:grid-cols-3"
      >
        {principles.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="site-panel p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6e9] text-[#8b6b3f]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </article>
          );
        })}
      </MotionSection>

      <section ref={setRevealRef} className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="site-section p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Built to remove friction from the local property journey.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600">
            The product isn&apos;t just a listing feed. It is a structured workflow for publishing, moderation, discovery, and follow-up.
          </p>

          <div className="mt-6 space-y-4">
            {journey.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[1.45rem] border border-slate-200/70 bg-white/72 p-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#111827,#334155)] p-6 text-white shadow-[0_24px_56px_rgba(15,23,42,0.18)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f3d8af]">What we optimize for</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">A marketplace that feels more composed and more credible at first glance.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
              Better hierarchy, stronger review flow, and a cleaner visual system help the product feel closer to a premium service brand than a noisy listings board.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "For buyers",
                description: "Clearer filters, more trustworthy inventory, and smoother ways to reach the right contact.",
                icon: UserGroupIcon,
              },
              {
                title: "For owners and brokers",
                description: "A stronger presentation layer and a cleaner inquiry pipeline for qualified responses.",
                icon: ShieldCheckIcon,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="site-panel p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff6e9] text-[#8b6b3f]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <MotionSection
        ref={setRevealRef}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={fadeUp}
        className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(239,246,255,0.86))] px-6 py-8 shadow-[0_22px_54px_rgba(15,23,42,0.08)] sm:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Next step</p>
            <h2 className="mt-3 font-['Fraunces'] text-4xl leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl">
              Explore a property experience that feels more premium from the first click.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              Browse verified homes, publish a better-looking listing, or move into the platform workflow with a cleaner brand experience.
            </p>
          </div>

          <Link to="/listings" className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            View properties
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </MotionSection>
    </main>
  );
};

export default AboutPage;
