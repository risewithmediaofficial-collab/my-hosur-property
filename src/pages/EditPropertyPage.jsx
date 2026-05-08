import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchPropertyById } from "../services/api/propertyApi";
import PropertyPostingForm from "../components/PropertyPostingForm";

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
        
        // Transform backend property to form format
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-ink/60">
      Loading property details...
    </div>
  );

  if (!property) return null;

  return (
    <main className="w-full space-y-8 px-4 py-8 sm:px-5 md:py-12 lg:px-6">
      <section className="site-section p-8 md:p-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Listing management</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Edit your property details</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Update pricing, media, location, and listing information from one professional form.
        </p>
      </section>
      <PropertyPostingForm 
        heading="Edit Property Details" 
        initialData={property} 
        onSuccess={() => navigate("/dashboard")}
      />
    </main>
  );
};

export default EditPropertyPage;
