import PropertyPostingForm from "../components/PropertyPostingForm";

const PostPropertyPage = () => {
  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-5 md:py-12 lg:px-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(235,248,247,0.95),rgba(255,255,255,0.92)_48%,rgba(215,238,235,0.72))] px-6 py-8 shadow-[0_24px_60px_rgba(15,76,82,0.12)] sm:px-8 md:py-10 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-700">Property posting</p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">Create a professional property listing</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Add pricing, location, images, and property details in one guided workflow built for serious Hosur real estate listings.
          </p>
        </div>
      </section>
      <PropertyPostingForm heading="Post Property With Plan, Maps & Uploads" />
    </main>
  );
};

export default PostPropertyPage;
