import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRightIcon,
  BanknotesIcon,
  BoltIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  HomeModernIcon,
  KeyIcon,
  MapPinIcon,
  PhoneArrowUpRightIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import PropertyCard from "../components/PropertyCard";
import useDebounce from "../hooks/useDebounce";
import { fetchHomeProperties } from "../services/api/propertyApi";

gsap.registerPlugin(ScrollTrigger);

const intentMeta = {
  buy: { label: "Buy", icon: HomeModernIcon },
  rent: { label: "Rent", icon: KeyIcon },
  sell: { label: "Sell", icon: PlusCircleIcon },
  "new-project": { label: "New Projects", icon: BuildingOffice2Icon },
};

const premiumMetrics = [
  { label: "Curated listings", value: "8.4K", note: "Fresh inventory across Hosur micro-markets" },
  { label: "Average response time", value: "12m", note: "Smoother owner and agent follow-up" },
  { label: "Qualified monthly buyers", value: "25K+", note: "High-intent traffic with cleaner inquiry flow" },
];

const serviceHighlights = [
  {
    title: "Verified before visible",
    description: "Every public listing goes through moderation so the catalog feels more trustworthy from the first click.",
    icon: CheckBadgeIcon,
  },
  {
    title: "Search with strategy",
    description: "Move through locality, price, and property-type filters with a layout designed for faster decisions.",
    icon: ChartBarSquareIcon,
  },
  {
    title: "Contact with confidence",
    description: "Better lead routing, approval flow, and direct response tools for buyers, owners, and agents.",
    icon: PhoneArrowUpRightIcon,
  },
];

const marketMoments = [
  {
    title: "Premium villas",
    caption: "Gated communities, private gardens, and sharper architecture for buyers who want room to grow.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Urban apartments",
    caption: "Well-connected homes close to schools, offices, and lifestyle essentials.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Smart land options",
    caption: "Verified plots and future-ready investments in emerging Hosur zones.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  },
];

const journeySteps = [
  {
    id: "01",
    title: "Discover the right pocket",
    description: "Browse localities, price bands, and property types with a cleaner search experience.",
    icon: MapPinIcon,
  },
  {
    id: "02",
    title: "Compare what matters",
    description: "Review listing quality, furnishing, budget, and map context before you shortlist.",
    icon: BanknotesIcon,
  },
  {
    id: "03",
    title: "Reach the right contact",
    description: "Send a precise inquiry to owners or agents without the usual marketplace noise.",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    id: "04",
    title: "Track every next step",
    description: "Use the dashboard to manage leads, saved homes, and approvals from one place.",
    icon: ShieldCheckIcon,
  },
];

const premiumSignals = [
  { label: "Live market pulse", value: "North Hosur demand up 18%" },
  { label: "Best for families", value: "Bagalur Road, Alasanatham, Denkanikottai Road" },
  { label: "Investor interest", value: "Plots and premium apartments leading this month" },
];

const testimonials = [
  {
    quote: "The new flow feels far more premium than a normal listing site. Shortlisting and contacting owners is finally less chaotic.",
    name: "Arun Prakash",
    role: "Buyer",
  },
  {
    quote: "As an agent, I like how leads and approvals feel structured. It gives the brand a more trustworthy first impression.",
    name: "Nithya Realtors",
    role: "Agent Partner",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const MotionDiv = motion.div;
const MotionArticle = motion.article;
const MotionHeading = motion.h1;
const MotionParagraph = motion.p;

const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({
    intent: "buy",
    search: "",
    city: "",
    propertyType: "",
    maxPrice: "",
  });
  const heroRef = useRef(null);
  const artworkRef = useRef(null);
  const floatingCardRefs = useRef([]);
  const revealRefs = useRef([]);
  const debouncedSearch = useDebounce(search.search, 350);

  const setFloatingCardRef = (node) => {
    if (node && !floatingCardRefs.current.includes(node)) {
      floatingCardRefs.current.push(node);
    }
  };

  const setRevealRef = (node) => {
    if (node && !revealRefs.current.includes(node)) {
      revealRefs.current.push(node);
    }
  };

  useEffect(() => {
    fetchHomeProperties()
      .then((res) => setFeatured(res.items || []))
      .catch(() => setFeatured([]));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll("[data-hero-item]"),
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.12,
          }
        );
      }

      if (artworkRef.current) {
        gsap.fromTo(
          artworkRef.current,
          { rotate: -2, scale: 0.96, opacity: 0 },
          { rotate: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power3.out", delay: 0.18 }
        );
      }

      floatingCardRefs.current.forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 === 0 ? -12 : 12,
          duration: 2.8 + index * 0.35,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      revealRefs.current.forEach((node, index) => {
        gsap.fromTo(
          node,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
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

  const queryString = useMemo(() => {
    const q = new URLSearchParams();
    if (debouncedSearch) q.set("search", debouncedSearch);
    if (search.intent) q.set("intent", search.intent);
    if (search.city) q.set("city", search.city);
    if (search.propertyType) q.set("propertyType", search.propertyType);
    if (search.maxPrice) q.set("maxPrice", search.maxPrice);
    return q.toString();
  }, [debouncedSearch, search.intent, search.city, search.propertyType, search.maxPrice]);

  const featuredListings = featured.slice(0, 4);

  return (
    <main className="relative overflow-hidden bg-white">
      <section className="site-shell relative px-4 pb-6 pt-0 sm:px-5 lg:px-6">
        <div
          ref={heroRef}
          className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 px-4 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          <div className="relative grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="max-w-3xl">
              <MotionDiv
                data-hero-item
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-[#eadbc4] bg-[#fff8ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8b6b3f]"
              >
                <SparklesIcon className="h-4 w-4" />
                Premium Hosur property experience
              </MotionDiv>
              <MotionHeading
                data-hero-item
                initial="hidden"
                animate="show"
                custom={0.08}
                variants={fadeUp}
                className="mt-5 max-w-4xl font-['Fraunces'] text-4xl leading-[1.02] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-7xl"
              >
                Discover a sharper, more premium way to search property in Hosur.
              </MotionHeading>

              <MotionParagraph
                data-hero-item
                initial="hidden"
                animate="show"
                custom={0.16}
                variants={fadeUp}
                className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8"
              >
                From luxury villas and move-in apartments to investment-ready plots, MyHosurProperty now feels more editorial,
                more intentional, and far easier to act on.
              </MotionParagraph>

              <MotionDiv
                data-hero-item
                initial="hidden"
                animate="show"
                custom={0.24}
                variants={fadeUp}
                className="mt-7 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore premium listings
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/post-property"
                  className="site-button-secondary inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-sm"
                >
                  Post a property
                </Link>
              </MotionDiv>

              <div data-hero-item className="mt-8 grid gap-3 sm:grid-cols-3">
                {premiumMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-[1.6rem] border border-white/70 bg-white/76 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{metric.value}</p>
                    <p className="mt-2 text-sm font-semibold text-[#8b6b3f]">{metric.label}</p>
                    <p className="mt-1 text-xs leading-6 text-slate-600">{metric.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div ref={artworkRef} className="relative mx-auto max-w-[560px]">
                  <div className="absolute -left-8 top-10 hidden h-28 w-28 rounded-full bg-amber-200/70 blur-3xl sm:block" />
                <div className="absolute -right-10 bottom-10 hidden h-32 w-32 rounded-full bg-sky-100/90 blur-3xl sm:block" />

                <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                  <div className="overflow-hidden rounded-[1.6rem]">
                    <img
                      src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80"
                      alt="Luxury home exterior"
                      className="h-[420px] w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.4rem] border border-white/70 bg-[#fff8ef] p-4 text-slate-900">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Featured pocket</p>
                      <h3 className="mt-2 text-xl font-semibold">Bagalur Road premium belt</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Spacious villas, newer apartment launches, and quicker road connectivity driving premium demand.
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-slate-800 bg-slate-900 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#f3d8af]">Market watch</p>
                      <p className="mt-3 text-3xl font-semibold text-white">+18%</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Demand growth in premium localities this quarter.</p>
                    </div>
                  </div>
                </div>

                <div
                  ref={setFloatingCardRef}
                  className="absolute -left-4 top-8 max-w-[180px] rounded-[1.4rem] border border-white/70 bg-white/90 p-4 text-slate-900 shadow-2xl"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">New launch</p>
                  <p className="mt-2 text-lg font-semibold">Lake-view residences</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Fresh inventory with large balconies and club access.</p>
                </div>

                <div
                  ref={setFloatingCardRef}
                  className="absolute right-4 top-6 hidden max-w-[190px] rounded-[1.4rem] border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl sm:block sm:right-6 sm:top-6"
                >
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#f3d8af]">
                    <StarIcon className="h-4 w-4" />
                    Buyer favorite
                  </p>
                  <p className="mt-2 text-lg font-semibold">Fastest inquiry flow</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Shortlisted homes now feel easier to compare and contact.</p>
                </div>
              </div>
            </div>
          </div>

          <div data-hero-item className="relative mt-8 grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/72 p-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Premium search flow</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Search faster, shortlist smarter, contact cleaner.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                A premium landing page deserves an equally polished search panel, so we reworked the first interaction into something calmer and more useful.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {premiumSignals.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white/70 bg-white/84 px-4 py-3 text-sm text-slate-700">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  <p className="mt-2 leading-6">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell px-4 pb-6 sm:px-5 lg:px-6">
        <div
          ref={setRevealRef}
          className="grid gap-5 rounded-[2rem] border border-white/70 bg-white/86 px-4 py-5 shadow-[0_22px_54px_rgba(15,23,42,0.07)] sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
        >
          <div className="rounded-[1.6rem] border border-[#eedfca] bg-[linear-gradient(145deg,#faf5ec,#fffdfa)] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Start here</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Find the right match with a more premium search experience</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Select your intent, shape the search, and jump directly into curated listings or posting flow.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {Object.entries(intentMeta).map(([key, meta]) => {
                const Icon = meta.icon;
                const isActive = search.intent === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSearch((prev) => ({ ...prev, intent: key }))}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-[#eadfce] bg-white text-slate-700 hover:border-[#d1b58b] hover:bg-[#fff8ef]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-white/12" : "bg-slate-100"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{meta.label}</p>
                        <p className={`text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>Tailored starting point</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/70 bg-white/88 p-5 sm:p-6">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Locality or project</label>
                <input
                  className="site-input mt-2 border-[#eadfce] bg-[#fcfaf6]"
                  placeholder="Enter locality, project, or landmark"
                  value={search.search}
                  onChange={(e) => setSearch((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">City</label>
                  <input
                    className="site-input mt-2 border-[#eadfce] bg-[#fcfaf6]"
                    placeholder="Hosur"
                    value={search.city}
                    onChange={(e) => setSearch((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Property type</label>
                  <select
                    className="site-input mt-2 border-[#eadfce] bg-[#fcfaf6]"
                    value={search.propertyType}
                    onChange={(e) => setSearch((prev) => ({ ...prev, propertyType: e.target.value }))}
                  >
                    <option value="">All property types</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Independent House</option>
                    <option>Plot</option>
                    <option>Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Budget cap</label>
                <input
                  className="site-input mt-2 border-[#eadfce] bg-[#fcfaf6]"
                  type="number"
                  placeholder="Enter your maximum budget"
                  value={search.maxPrice}
                  onChange={(e) => setSearch((prev) => ({ ...prev, maxPrice: e.target.value }))}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => (search.intent === "sell" ? navigate("/post-property") : navigate(`/listings?${queryString}`))}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {search.intent === "sell" ? "Start property posting" : "Search properties"}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <Link
                  to="/plans"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d9c3a0] bg-[#fff6e9] px-5 py-3.5 text-sm font-semibold text-[#7c5e31] transition hover:bg-[#ffefd6]"
                >
                  View premium plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell px-4 pb-6 sm:px-5 lg:px-6">
        <div ref={setRevealRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Featured inventory</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Editorial-style property highlights</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              We kept the featured feed but framed it with a more premium visual rhythm so the property cards feel curated, not dumped into a grid.
            </p>
          </div>
          <Link to="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-600">
            View all listings
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div ref={setRevealRef} className="mt-6 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[linear-gradient(135deg,#111827,#334155)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="relative h-full min-h-[320px] overflow-hidden p-6">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80"
                alt="Premium architectural exterior"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.16),rgba(15,23,42,0.88))]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#f3d8af]">
                    <BoltIcon className="h-4 w-4" />
                    This month&apos;s spotlight
                  </span>
                  <h3 className="mt-4 max-w-sm font-['Fraunces'] text-3xl leading-tight text-white">Homes that feel ready the moment you open them.</h3>
                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                    Premium visuals, stronger content hierarchy, and better motion make the featured block feel closer to a modern luxury portal.
                  </p>
                </div>

                <div className="grid gap-3">
                  {serviceHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-[1.35rem] border border-white/15 bg-white/12 p-4 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                            <Icon className="h-5 w-5 text-[#f3d8af]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs leading-6 text-slate-300">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featuredListings.map((item) => (
              <MotionDiv key={item._id} whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                <PropertyCard item={item} />
              </MotionDiv>
            ))}

            {featuredListings.length === 0 &&
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="overflow-hidden rounded-[1.7rem] border border-[#eadfce] bg-white p-4 shadow-[0_14px_34px_rgba(90,73,49,0.06)]"
                >
                  <div className="h-52 animate-pulse rounded-[1.25rem] bg-[#efe7db]" />
                  <div className="mt-4 h-6 animate-pulse rounded-full bg-[#f3ede4]" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-[#f3ede4]" />
                  <div className="mt-5 h-11 animate-pulse rounded-2xl bg-[#f6f1ea]" />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="site-shell px-4 pb-6 sm:px-5 lg:px-6">
        <div ref={setRevealRef} className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-[#eadfce] bg-white/85 p-6 shadow-[0_18px_42px_rgba(90,73,49,0.07)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Why it feels better</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Premium components, calmer layout, stronger hierarchy</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The landing page now leans into layered cards, soft gradients, warm neutrals, and image-first storytelling instead of a flat marketplace layout.
              </p>

              <div className="mt-6 grid gap-4">
                {journeySteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="rounded-[1.4rem] border border-[#efe4d5] bg-[#fcfaf6] p-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b38a57]">{step.id}</p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,248,238,0.92))] p-6 text-slate-900 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">Motion system</p>
              <h3 className="mt-2 text-3xl font-semibold">Built to feel more like a luxury product than a classifieds board.</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "Framer Motion", label: "Layered entry transitions" },
                  { value: "GSAP", label: "Scroll-based reveal rhythm" },
                  { value: "Tailwind", label: "Sharper premium surfaces" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.2rem] border border-white/70 bg-white/84 p-4">
                    <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                    <p className="mt-2 text-xs leading-6 text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              {marketMoments.map((item, index) => (
                <MotionArticle
                  key={item.title}
                  ref={setRevealRef}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ duration: 0.26 }}
                  className={`overflow-hidden rounded-[2rem] border border-[#eadfce] bg-white shadow-[0_18px_42px_rgba(90,73,49,0.07)] ${
                    index === 0 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className={`overflow-hidden ${index === 0 ? "h-72" : "h-60"}`}>
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b38a57]">Curated collection</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.caption}</p>
                  </div>
                </MotionArticle>
              ))}
            </div>

            <div ref={setRevealRef} className="grid gap-4 md:grid-cols-2">
              {testimonials.map((item) => (
                <div key={item.name} className="rounded-[1.7rem] border border-[#eadfce] bg-[#fffdfa] p-5 shadow-[0_12px_30px_rgba(90,73,49,0.06)]">
                  <p className="text-sm leading-7 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell px-4 pb-8 sm:px-5 lg:px-6">
        <MotionDiv
          ref={setRevealRef}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(255,248,238,0.92)_48%,rgba(239,246,255,0.86)_100%)] px-4 py-6 shadow-[0_22px_54px_rgba(15,23,42,0.08)] sm:px-6 sm:p-8 lg:px-8 lg:py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#eadbc4] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b3f]">
                <SparklesIcon className="h-4 w-4" />
                Crafted for a premium first impression
              </p>
              <h2 className="mt-4 font-['Fraunces'] text-4xl leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl">
                Ready to explore Hosur with a UI that finally feels premium?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                Start with curated listings, present your property in a stronger visual system, or move into dashboards and plans with a more polished brand feel.
              </p>
            </div>

            <div className="grid gap-3 self-center sm:grid-cols-2">
              <Link
                to="/listings"
                className="inline-flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Browse listings
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/post-property"
                className="site-button-secondary inline-flex min-h-[64px] items-center justify-center rounded-2xl px-5 py-4 text-sm"
              >
                Post property
              </Link>
            </div>
          </div>
        </MotionDiv>
      </section>
    </main>
  );
};

export default HomePage;
