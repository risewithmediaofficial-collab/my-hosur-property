import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BuildingOffice2Icon, EnvelopeIcon, PhoneIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import PropertyCard from "../components/PropertyCard";
import SeoHead from "../components/SeoHead";
import { fetchAgentBySlug } from "../services/api/userApi";
import { buildAgentSchema, buildBreadcrumbSchema, buildRealEstateAgentSchema, getAgentPath } from "../utils/seo";

const AgentProfilePage = () => {
  const { slug } = useParams();
  const [data, setData] = useState({ agent: null, properties: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAgentBySlug(slug)
      .then((response) => {
        setData({
          agent: response.agent || null,
          properties: response.properties || [],
        });
        setError("");
      })
      .catch((loadError) => {
        setData({ agent: null, properties: [] });
        setError(loadError.response?.data?.message || "Agent not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const breadcrumbs = useMemo(() => {
    const items = [
      { label: "Home", to: "/" },
      { label: "Agents", to: "/agents" },
    ];

    if (data.agent?.name) {
      items.push({ label: data.agent.name, to: getAgentPath(data.agent) });
    }

    return items;
  }, [data.agent]);

  if (loading) {
    return (
      <main className="w-full px-4 py-10 sm:px-5 lg:px-6">
        <div className="site-section flex h-72 items-center justify-center">
          <p className="text-sm font-medium text-slate-500">Loading agent profile...</p>
        </div>
      </main>
    );
  }

  if (error || !data.agent) {
    return (
      <main className="w-full px-4 py-10 sm:px-5 lg:px-6">
        <SeoHead title="Agent Unavailable" description="The requested agent profile is unavailable." noIndex />
        <div className="site-section flex h-72 flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Agent unavailable</h1>
          <p className="max-w-md text-sm leading-7 text-slate-600">{error || "The agent profile you are looking for does not exist."}</p>
          <Link to="/agents" className="site-button-primary px-5 py-3 text-sm">
            View agents
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 lg:px-6">
      <SeoHead
        title={`${data.agent.name} | Property Agent in Hosur`}
        description={`View ${data.agent.name}'s public property profile, active listings, and contact details on My Hosur Property.`}
        canonicalPath={getAgentPath(data.agent)}
        schema={[buildRealEstateAgentSchema(), buildAgentSchema(data.agent), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <section className="mx-auto w-full max-w-[1440px] space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,247,245,0.92))] p-6 shadow-[0_16px_38px_rgba(16,95,104,0.08)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Agent profile</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{data.agent.name}</h1>
              <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">
                Public real estate profile for buyers searching Hosur properties, local market support, and active agent-managed inventory.
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
                <BuildingOffice2Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{data.agent.role}</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-slate-400" />
                  {data.agent.propertyCount} listed properties
                </p>
                {data.agent.phone ? (
                  <p className="inline-flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-slate-400" />
                    {data.agent.phone}
                  </p>
                ) : null}
                {data.agent.email ? (
                  <p className="inline-flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                    {data.agent.email}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(17,17,17,0.04)] md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Active inventory</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Listings from this agent</h2>
            </div>
            <Link to="/buy" className="site-button-secondary px-5 py-3 text-sm">
              All properties
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.properties.map((property) => (
              <PropertyCard key={property._id} item={property} showOwner={false} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
};

export default AgentProfilePage;
