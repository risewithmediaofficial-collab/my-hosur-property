import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchFeaturedProperties } from "../services/api/propertyApi";
import PropertyCard from "../components/PropertyCard";
import { useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import {
  BanknotesIcon,
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
} from "@heroicons/react/24/outline";

const intentMeta = {
  buy: { label: "Buy", icon: HomeModernIcon },
  rent: { label: "Rent", icon: KeyIcon },
  sell: { label: "Sell", icon: PlusCircleIcon },
  "new-project": { label: "New Projects", icon: BuildingOffice2Icon },
};

const workflowSteps = [
  { id: 1, title: "Search verified listings", icon: ShieldCheckIcon },
  { id: 2, title: "Compare location and facts", icon: MapPinIcon },
  { id: 3, title: "Send inquiry/callback/visit", icon: ChatBubbleLeftRightIcon },
  { id: 4, title: "Track leads in dashboard", icon: ChartBarSquareIcon },
];

const showcaseItems = [
  {
    title: "Premium Villas",
    subtitle: "Spacious gated communities with modern amenities.",
    image: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Ready Apartments",
    subtitle: "Move-in ready homes near schools and transit.",
    image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Residential Plots",
    subtitle: "Verified plot options for future construction.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
];

const featureCards = [
  {
    title: "Verified Listings",
    description: "All listings are moderated and reviewed before going live.",
    icon: CheckBadgeIcon,
  },
  {
    title: "Smart Pricing Insights",
    description: "Compare area-level pricing and make better offers confidently.",
    icon: BanknotesIcon,
  },
  {
    title: "Direct Callback Flow",
    description: "Connect with owner/agent quickly through secure inquiry workflow.",
    icon: PhoneArrowUpRightIcon,
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState({ intent: "buy", search: "", city: "", propertyType: "", maxPrice: "" });
  const debouncedSearch = useDebounce(search.search, 350);

  useEffect(() => {
    fetchFeaturedProperties().then((res) => setFeatured(res.items || [])).catch(() => setFeatured([]));
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <section className="glass-panel uiverse-card animate-fade-up rounded-3xl border border-white/70 bg-gradient-to-br from-white/55 to-[#e9eef4] p-5 md:p-12">
        <h1 className="max-w-2xl text-2xl font-extrabold leading-tight md:text-5xl">Find your next home in a calm, professional flow.</h1>
        <p className="mt-3 max-w-2xl text-xs text-ink/75 md:text-base">Search verified sale and rent properties with role-based support for buyers, owners, agents, and admins.</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {Object.entries(intentMeta).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
            <button
              key={key}
              onClick={() => setSearch((p) => ({ ...p, intent: key }))}
              className={`uiverse-btn inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${search.intent === key ? "bg-ink text-stone" : "neo-btn text-ink"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
            );
          })}
        </div>

        <div className="neo-panel mt-6 grid bg-white/40 gap-2 rounded-2xl p-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <input className="soft-input rounded-lg px-3 py-2 text-sm w-full" placeholder="Locality / Project" value={search.search} onChange={(e) => setSearch((p) => ({ ...p, search: e.target.value }))} />
          <input className="soft-input rounded-lg px-3 py-2 text-sm w-full" placeholder="City" value={search.city} onChange={(e) => setSearch((p) => ({ ...p, city: e.target.value }))} />
          <select className="soft-input rounded-lg px-3 py-2 text-sm w-full" value={search.propertyType} onChange={(e) => setSearch((p) => ({ ...p, propertyType: e.target.value }))}>
            <option value="">Property Type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Independent House</option>
            <option>Plot</option>
            <option>Commercial</option>
          </select>
          <input className="soft-input rounded-lg px-3 py-2 text-sm w-full" type="number" placeholder="Budget upto" value={search.maxPrice} onChange={(e) => setSearch((p) => ({ ...p, maxPrice: e.target.value }))} />
          <button
            onClick={() => (search.intent === "sell" ? navigate("/post-property") : navigate(`/listings?${queryString}`))}
            className="uiverse-btn inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-stone sm:col-span-2 lg:col-span-1 w-full"
          >
            <SparklesIcon className="h-4 w-4" />
            {search.intent === "sell" ? "Post Property" : "Search"}
          </button>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Listings</h2>
          <Link to="/listings" className="text-sm font-semibold text-sage">View all</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => <PropertyCard key={item._id} item={item} />)}
        </div>
      </section>

      <section className="glass-panel mt-10 rounded-3xl border border-white/70 bg-[#f1f4f8]/90 p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5eef8] text-[#2d5b88]">
            <ChartBarSquareIcon className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight text-[#1f2937] md:text-4xl">Property Platform Workflow</h2>
        </div>
        <p className="mt-2 text-sm text-ink/70 md:text-base">A simple, transparent path from discovery to lead closure.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.id} className="content-card group rounded-2xl bg-white/85 px-4 py-4 transition hover:-translate-y-0.5">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-slate-700">{step.id}</span>
                  <Icon className="h-4 w-4 text-[#2d5b88]" />
                  Workflow Step
                </div>
                <h3 className="mt-3 text-lg font-bold leading-snug text-[#222b3a] md:text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-[#5a6777]">Structured action to keep discovery and conversion clear.</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Explore Homes, Villas & Plots</h2>
          <span className="content-chip">Curated Visual Picks</span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {showcaseItems.map((item) => (
            <article key={item.title} className="glass-panel uiverse-card overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-soft">
              <div className="h-52 overflow-hidden">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel mt-10 rounded-3xl border border-white/70 bg-white/85 p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Why Users Choose MyHosurProperty</h2>
          <span className="content-chip">Professional Experience</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="content-card rounded-2xl p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/30 text-[#2d5b88]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-ink">{feature.title}</h3>
                <p className="mt-1 text-sm text-ink/70">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Active Search Users</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">25K+</p>
        </article>
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Verified Listings</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">8K+</p>
        </article>
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Monthly Lead Requests</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">12K+</p>
        </article>
      </section>
    </main>
  );
};

export default HomePage;
