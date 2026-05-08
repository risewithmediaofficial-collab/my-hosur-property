import PropertyPostingForm from "../components/PropertyPostingForm";

const PostPropertyPage = () => {
  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-5 md:py-12 lg:px-6">
      <section className="site-section p-8 md:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Property posting</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Create a professional property listing</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Add pricing, maps, images, and property details in one structured workflow.
        </p>
      </section>
      <PropertyPostingForm heading="Post Property With Plan, Maps & Uploads" />
    </main>
  );
};

export default PostPropertyPage;
