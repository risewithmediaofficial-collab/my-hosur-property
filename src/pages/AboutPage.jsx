import { CheckCircleIcon, ShieldCheckIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/outline";

const principles = [
  {
    title: "Trust-first moderation",
    description: "Property submissions are reviewed before they reach the public catalog.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Multi-role platform",
    description: "Built for buyers, sellers, brokers, builders, and admins in one workflow.",
    icon: UsersIcon,
  },
  {
    title: "Cleaner decision flow",
    description: "Users can compare, shortlist, and follow up without unnecessary friction.",
    icon: CheckCircleIcon,
  },
];

const stats = [
  { label: "Platform users", value: "25K+" },
  { label: "Properties listed", value: "8K+" },
  { label: "Leads managed", value: "12K+" },
];

const AboutPage = () => {
  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-5 md:space-y-10 md:py-10 lg:px-6">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="dashboard-shell p-8 md:p-10">
          <span className="site-kicker">
            <SparklesIcon className="h-4 w-4" />
            About the platform
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            A more reliable way to discover and publish property in Hosur.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            MyHosurProperty helps buyers, sellers, brokers, and builders discover verified real-estate listings through a more structured and professional experience.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-blue-200 bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] p-8 text-white shadow-[0_22px_56px_rgba(37,99,235,0.18)] md:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">What we do</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Real estate search, posting, and lead management in one place.</h2>
          <p className="mt-4 text-sm leading-7 text-blue-50">
            We combine property discovery, listing workflows, plan management, moderation, and lead handling so the experience stays clear for every role on the platform.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
          <article className="dashboard-panel p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Mission</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Keep property search simple and trustworthy.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            We want property search and posting to feel less chaotic and more dependable for every user type.
          </p>
        </article>

          <article className="dashboard-panel p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Platform scope</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Search, filters, leads, plans, and moderation.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The product supports discovery, property posting, admin review, customer requests, and payment-backed plans.
          </p>
        </article>

          <article className="dashboard-panel p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Local focus</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Built around Hosur and surrounding demand.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Based in Hosur, Tamil Nadu, the platform is designed for a local market while remaining flexible for broader growth.
          </p>
        </article>
      </section>

      <section className="dashboard-shell p-8 md:p-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Why users trust us</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">The product is designed around clarity, moderation, and accountability.</h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="dashboard-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
