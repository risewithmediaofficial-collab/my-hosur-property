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
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-12">
      {/* Hero Section */}
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 md:p-16 text-white shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        </div>
        <div className="relative z-10">
          <h1 className="max-w-3xl text-3xl md:text-5xl font-bold leading-tight">
            Find your next home in a calm, professional flow.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Search verified sale and rent properties with role-based support for buyers, owners, agents, and admins.
          </p>
          
          {/* Intent Selection */}
          <div className="mt-8 flex flex-wrap gap-2">
            {Object.entries(intentMeta).map(([key, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSearch((p) => ({ ...p, intent: key }))}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    search.intent === key 
                      ? "bg-white text-blue-700 shadow-lg" 
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <div className="mt-8 grid gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border border-white/20">
            <input 
              className="rounded-lg px-4 py-3 text-sm bg-white/95 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white" 
              placeholder="Locality / Project" 
              value={search.search} 
              onChange={(e) => setSearch((p) => ({ ...p, search: e.target.value }))} 
            />
            <input 
              className="rounded-lg px-4 py-3 text-sm bg-white/95 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white" 
              placeholder="City" 
              value={search.city} 
              onChange={(e) => setSearch((p) => ({ ...p, city: e.target.value }))} 
            />
              <select 
              className="rounded-lg px-4 py-3 text-sm bg-white/95 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white" 
              value={search.propertyType} 
              onChange={(e) => setSearch((p) => ({ ...p, propertyType: e.target.value }))}
            >
              <option value="">Property Type</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Independent House</option>
              <option>Plot</option>
              <option>Commercial</option>
            </select>
            <input 
              className="rounded-lg px-4 py-3 text-sm bg-white/95 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white" 
              type="number" 
              placeholder="Budget upto" 
              value={search.maxPrice} 
              onChange={(e) => setSearch((p) => ({ ...p, maxPrice: e.target.value }))} 
            />
            <button
              onClick={() => (search.intent === "sell" ? navigate("/post-property") : navigate(`/listings?${queryString}`))}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-700 px-4 py-3 text-sm font-bold hover:bg-blue-50 transition sm:col-span-2 lg:col-span-1 w-full shadow-lg"
            >
              <SparklesIcon className="h-4 w-4" />
              {search.intent === "sell" ? "Post Property" : "Search"}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Featured Listings</h2>
          <Link to="/listings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">View all →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => <PropertyCard key={item._id} item={item} />)}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="rounded-2xl bg-slate-50 p-8 md:p-12 border border-slate-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <ChartBarSquareIcon className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Property Platform Workflow</h2>
        </div>
        <p className="text-slate-600 mb-8 text-lg">A simple, transparent path from discovery to lead closure.</p>
        <div className="grid gap-6 md:grid-cols-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="group rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm mb-4">
                  {step.id}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600">Structured action to keep discovery and conversion clear.</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Explore Homes, Villas & Plots</h2>
          <span className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Curated Visual Picks</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {showcaseItems.map((item) => (
            <article key={item.title} className="group overflow-hidden rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition bg-white">
              <div className="h-52 overflow-hidden bg-slate-200">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="rounded-2xl bg-slate-50 p-8 md:p-12 border border-slate-200">
        <div className="mb-8 flex items-center justify-between flex-col sm:flex-row gap-4">
          <h2 className="text-3xl font-bold text-slate-900">Why Users Choose MyHosurProperty</h2>
          <span className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Professional Experience</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg transition">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition">
          <p className="text-sm font-medium text-slate-600">Active Search Users</p>
          <p className="mt-2 text-4xl font-bold text-blue-600">25K+</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition">
          <p className="text-sm font-medium text-slate-600">Verified Listings</p>
          <p className="mt-2 text-4xl font-bold text-blue-600">8K+</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 text-center hover:shadow-lg transition">
          <p className="text-sm font-medium text-slate-600">Monthly Lead Requests</p>
          <p className="mt-2 text-4xl font-bold text-blue-600">12K+</p>
        </div>
      </section>
    </main>
  );
};


export default HomePage;
