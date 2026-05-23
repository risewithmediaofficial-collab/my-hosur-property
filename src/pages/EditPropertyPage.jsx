import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchPropertyById } from "../services/api/propertyApi";
import PropertyPostingForm from "../components/PropertyPostingForm";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPropertyById(id, token);
        const p = res.property;

        const initialForm = {
          title: p.title || "",
          description: p.description || "",
          contactName: p.listingContact?.name || "",
          contactPhone: p.listingContact?.phone || "",
          houseAddress: p.location?.address || "",
          city: p.location?.city || "Hosur",
          area: p.location?.area || "",
          postedBy: p.listingSource || "owner",
          listingType: p.listingType || "sale",
          propertyType: p.propertyType || "Apartment",
          price: String(p.price || ""),
          bhk: String(p.bhk || "2"),
          bathrooms: String(p.bathrooms || "2"),
          furnishingStatus: p.furnishingStatus || "Unfurnished",
          carpetArea: String(p.carpetArea || ""),
          builtupArea: String(p.builtupArea || ""),
          areaUnit: p.areaUnit || "sqft",
          possessionStatus: p.possessionStatus || "Ready to Move",
          facing: p.facing || "",
          reraId: p.verification?.reraId || "",
          houseDetails: p.description || "",
        };

        setProperty({
          _id: p._id,
          form: initialForm,
          images: p.images || [],
          documents: p.documents || [],
        });
      } catch {
        toast.error("Failed to load property details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-navy/60">
        Loading property details...
      </div>
    );
  }

  if (!property) return null;

  return (
    <main className="page-shell w-full">
      <PageHero
        tag="Listing management"
        title="Edit your property details"
        description="Update pricing, media, location, and listing information from one professional form."
      />
      <PageSection tone="surface" className="!pt-0">
        <PropertyPostingForm heading="Edit property details" initialData={property} onSuccess={() => navigate("/dashboard")} />
      </PageSection>
    </main>
  );
};

export default EditPropertyPage;
