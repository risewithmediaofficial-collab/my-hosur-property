import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="w-full px-4 py-16 sm:px-5 lg:px-6">
    <section className="site-section px-6 py-16 text-center md:px-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">404 error</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">The page you requested could not be found.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        The link may be outdated, or the page may have been moved. Return to the homepage to continue browsing the platform.
      </p>
      <Link to="/" className="site-button-primary mt-8 inline-flex px-5 py-3 text-sm">
        Go to homepage
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
