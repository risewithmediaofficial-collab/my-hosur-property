import { CheckCircleIcon, ShieldCheckIcon, SparklesIcon, UsersIcon } from "@heroicons/react/24/outline";

const AboutPage = () => {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <section className="glass-panel uiverse-card rounded-3xl border border-white/70 bg-white/60 p-6 md:p-10">
        <span className="content-chip"><SparklesIcon className="h-3.5 w-3.5" />Who We Are</span>
        <h1 className="text-3xl font-extrabold md:text-4xl">About Us</h1>
        <p className="mt-3 text-sm leading-7 text-ink/75 md:text-base">
          MyHosurProperty helps buyers, sellers, brokers, and builders discover and publish verified real-estate listings through a simple, transparent workflow.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="content-card p-5">
          <h2 className="text-lg font-bold">Our Mission</h2>
          <p className="mt-2 text-sm text-ink/75">Make property search and property posting reliable, fast, and easy for everyone.</p>
          <p className="mt-4 content-chip"><CheckCircleIcon className="h-3.5 w-3.5" />Trust First</p>
        </article>
        <article className="content-card p-5">
          <h2 className="text-lg font-bold">What We Provide</h2>
          <p className="mt-2 text-sm text-ink/75">Advanced filters, listing workflows, lead capture, plans, payments, and admin approval flow.</p>
          <p className="mt-4 content-chip"><CheckCircleIcon className="h-3.5 w-3.5" />Simple Experience</p>
        </article>
        <article className="content-card p-5">
          <h2 className="text-lg font-bold">Location</h2>
          <p className="mt-2 text-sm text-ink/75">Hosur, Krishnagiri District, Tamil Nadu, India</p>
          <p className="mt-1 text-sm text-ink/75">support@myhosurproperty.com</p>
          <p className="mt-4 content-chip"><CheckCircleIcon className="h-3.5 w-3.5" />Local Focus</p>
        </article>
      </section>

      <section className="glass-panel rounded-3xl border border-white/70 bg-white/85 p-6 md:p-8">
        <h2 className="text-2xl font-bold">Why People Trust Us</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="content-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/35 text-[#2d5b88]">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-bold">Verified Moderation</h3>
            <p className="mt-1 text-sm text-ink/70">Every listing is reviewed through admin moderation before going public.</p>
          </article>
          <article className="content-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/35 text-[#2d5b88]">
              <UsersIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-bold">Role-Based Platform</h3>
            <p className="mt-1 text-sm text-ink/70">Built for buyers, owners, brokers, builders, and admins in one workflow.</p>
          </article>
          <article className="content-card p-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/35 text-[#2d5b88]">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-bold">Transparent Lead Flow</h3>
            <p className="mt-1 text-sm text-ink/70">Customer inquiries are tracked and visible to admins for complete oversight.</p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Platform Users</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">25K+</p>
        </article>
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Properties Listed</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">8K+</p>
        </article>
        <article className="content-card p-5 text-center">
          <p className="text-sm font-semibold text-ink/70">Leads Managed</p>
          <p className="mt-1 text-3xl font-extrabold text-ink">12K+</p>
        </article>
      </section>
    </main>
  );
};

export default AboutPage;
