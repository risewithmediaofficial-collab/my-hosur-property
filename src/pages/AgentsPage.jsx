import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BuildingOffice2Icon, PhoneIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Breadcrumbs from "../components/Breadcrumbs";
import SeoHead from "../components/SeoHead";
import { fetchPublicAgents } from "../services/api/userApi";
import { buildBreadcrumbSchema, buildRealEstateAgentSchema, getAgentPath } from "../utils/seo";

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicAgents()
      .then((response) => setAgents(response.items || []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const breadcrumbs = [
    { label: "Home", to: "/" },
    { label: "Agents", to: "/agents" },
  ];

  return (
    <main className="w-full space-y-6 px-4 py-6 sm:px-5 lg:px-6">
      <SeoHead
        title="Property Agents in Hosur"
        description="Browse public real estate agents, brokers, and builders serving Hosur through My Hosur Property."
        canonicalPath="/agents"
        schema={[buildRealEstateAgentSchema(), buildBreadcrumbSchema(breadcrumbs)]}
      />

      <section className="mx-auto w-full max-w-[1440px] space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,247,245,0.92))] p-6 shadow-[0_16px_38px_rgba(16,95,104,0.08)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Professional network</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Property agents, brokers, and builders in Hosur</h1>
            <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">
              This public directory helps Google and buyers understand the main professional pages on the website while making it easier to move between agents and active listings.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="site-section flex h-48 items-center justify-center">
            <p className="text-sm font-medium text-slate-500">Loading agent directory...</p>
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <article key={agent._id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
                    <BuildingOffice2Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {agent.role}
                  </span>
                </div>

                <h2 className="mt-5 text-2xl font-semibold text-slate-900">{agent.name}</h2>
                <p className="mt-2 text-sm text-slate-600">Serving {agent.areaServed || "Hosur"} with local property guidance and verified listings.</p>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-slate-400" />
                    {agent.propertyCount} active properties
                  </p>
                  {agent.phone ? (
                    <p className="inline-flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      {agent.phone}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to={getAgentPath(agent)} className="site-button-primary px-5 py-3 text-sm">
                    View profile
                  </Link>
                  <Link to="/buy" className="site-button-secondary px-5 py-3 text-sm">
                    Browse properties
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
};

export default AgentsPage;
