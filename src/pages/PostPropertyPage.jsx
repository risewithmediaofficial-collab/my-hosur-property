import PropertyPostingForm from "../components/PropertyPostingForm";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";

const PostPropertyPage = () => (
  <main className="page-shell w-full">
    <PageHero
      tag="Property posting"
      title="Create a professional property listing"
      description="Add pricing, location, images, and property details in one guided workflow built for serious Hosur real estate listings."
    />
    <PageSection tone="surface" className="!pt-0">
      <PropertyPostingForm heading="Post your property" />
    </PageSection>
  </main>
);

export default PostPropertyPage;
