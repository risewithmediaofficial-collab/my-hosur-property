import PropertyPostingForm from "../components/PropertyPostingForm";
import PageSection from "../components/PageSection";

const PostPropertyPage = () => (
  <main className="page-shell w-full">
    <PageSection tone="surface">
      <PropertyPostingForm heading="Post your property" />
    </PageSection>
  </main>
);

export default PostPropertyPage;
