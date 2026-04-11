import PropertyPostingForm from "../components/PropertyPostingForm";

const PostPropertyPage = () => {
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-8">
      <h1 className="text-2xl font-bold">Post Property</h1>
      <PropertyPostingForm heading="Post Property With Plan, Maps & Uploads" />
    </main>
  );
};

export default PostPropertyPage;
