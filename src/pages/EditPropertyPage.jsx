import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { fetchPropertyById } from "../services/api/propertyApi";
import PropertyPostingForm from "../components/PropertyPostingForm";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";

const getFrontendPropertyType = (apiType, listingType) => {
  if (apiType === "House" && listingType === "rent") return "Rent";
  return apiType;
};

const parseDescription = (fullDescription) => {
  const lines = (fullDescription || "").split("\n");
  const extracted = {};
  const remainingLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Property Type:")) {
      // Ignore
    } else if (trimmed.startsWith("Location:")) {
      // Ignore
    } else if (trimmed.startsWith("Land Area:")) {
      extracted.landArea = trimmed.replace("Land Area:", "").trim();
    } else if (trimmed.startsWith("Built-up Area:")) {
      extracted.builtupArea = trimmed.replace("Built-up Area:", "").trim();
    } else if (trimmed.startsWith("Rooms:")) {
      extracted.bhk = trimmed.replace("Rooms:", "").trim();
    } else if (trimmed.startsWith("Min Price Range:")) {
      extracted.minPrice = trimmed.replace("Min Price Range:", "").trim();
    } else if (trimmed.startsWith("HNTDA Approved:")) {
      extracted.hntda = trimmed.replace("HNTDA Approved:", "").trim();
    } else if (trimmed.startsWith("Max Price:")) {
      extracted.maxPrice = trimmed.replace("Max Price:", "").trim();
    } else if (trimmed.startsWith("Length:")) {
      extracted.length = trimmed.replace("Length:", "").trim();
    } else if (trimmed.startsWith("Width:")) {
      extracted.width = trimmed.replace("Width:", "").trim();
    } else if (trimmed.startsWith("Road Width:")) {
      extracted.roadWidth = trimmed.replace("Road Width:", "").trim();
    } else if (trimmed.startsWith("Water Source:")) {
      extracted.waterSource = trimmed.replace("Water Source:", "").trim();
    } else if (trimmed.startsWith("Facilities:")) {
      // Ignore
    } else {
      remainingLines.push(line);
    }
  }

  extracted.description = remainingLines.join("\n").trim();
  return extracted;
};

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPropertyById(id, token);
        const p = res.property;
        const ownerId = String(p.ownerId?._id || p.ownerId || "");
        const currentUserId = String(user?._id || "");
        const canEdit = Boolean(user?.role === "admin" || (ownerId && currentUserId && ownerId === currentUserId));

        if (!canEdit) {
          toast.error("Only the person who posted this property can edit it.");
          navigate("/dashboard");
          return;
        }

        const addressParts = (p.location?.address || "").split(",").map(part => part.trim());
        const frontendPropertyType = getFrontendPropertyType(p.propertyType, p.listingType);
        const isRent = frontendPropertyType === "Rent" || frontendPropertyType === "PG";
        const parsedDesc = parseDescription(p.description);

        const initialForm = {
          propertyType: frontendPropertyType || "Apartment",
          title: p.title || "",
          description: parsedDesc.description || "",
          isSold: Boolean(p.isSold || false),
          contactName: p.listingContact?.name || "",
          contactPhone: p.listingContact?.phone || "",
          contactEmail: p.listingContact?.email || "",
          country: addressParts.length >= 1 ? addressParts[addressParts.length - 1] : "India",
          state: addressParts.length >= 2 ? addressParts[addressParts.length - 2] : "Tamil Nadu",
          district: addressParts.length >= 3 ? addressParts[addressParts.length - 3] : "Krishnagiri",
          taluk: addressParts.length >= 4 ? addressParts[addressParts.length - 4] : "Hosur",
          village: addressParts.length >= 5 ? addressParts[addressParts.length - 5] : "Bagalur",
          houseAddress: addressParts.length >= 6 ? addressParts.slice(0, addressParts.length - 5).join(", ") : (p.location?.address || ""),
          city: p.location?.city || "Hosur",
          area: p.location?.area || "",
          postedBy: p.listingSource || "owner",
          listingType: p.listingType || "sale",
          price: isRent ? "" : String(p.price || ""),
          monthlyRent: isRent ? String(p.price || "") : "",
          minPrice: parsedDesc.minPrice || "",
          maxPrice: parsedDesc.maxPrice || "",
          landArea: parsedDesc.landArea || "",
          length: parsedDesc.length || "",
          width: parsedDesc.width || "",
          roadWidth: parsedDesc.roadWidth || "",
          waterSource: parsedDesc.waterSource || "",
          hntda: parsedDesc.hntda || "No",
          bhk: String(p.bhk || ""),
          bathrooms: String(p.bathrooms || "1"),
          furnishingStatus: p.furnishingStatus || "Unfurnished",
          floorNumber: String(p.floorNumber || ""),
          totalFloors: String(p.totalFloors || ""),
          carpetArea: String(p.carpetArea || ""),
          builtupArea: String(p.builtupArea || ""),
          areaUnit: p.areaUnit || "sqft",
          possessionStatus: p.possessionStatus || "Ready to Move",
          facing: p.facing || "",
          rera: p.verification?.reraId ? "Yes" : "No",
          reraId: p.verification?.reraId || "",
          // Yes/No fields for features/amenities
          individualPlot: p.amenities?.includes("Individual Plot") ? "Yes" : "No",
          gatedCommunity: p.amenities?.includes("Gated Community") ? "Yes" : "No",
          cctvCamera: p.amenities?.includes("CCTV Camera") ? "Yes" : "No",
          security: p.amenities?.includes("Security") ? "Yes" : "No",
          dtcp: p.amenities?.includes("DTCP") ? "Yes" : "No",
          hmda: p.amenities?.includes("HMDA") ? "Yes" : "No",
          hntdaApproved: p.amenities?.includes("HNTDA Approved") ? "Yes" : "No",
          parking: p.amenities?.includes("Parking") ? "Yes" : "No",
          balcony: p.amenities?.includes("Balcony") ? "Yes" : "No",
          lift: p.amenities?.includes("Lift") ? "Yes" : "No",
          powerBackup: p.amenities?.includes("Power Backup") ? "Yes" : "No",
          waterSupply: p.amenities?.includes("Water Supply") ? "Yes" : "No",
          roadAccess: p.amenities?.includes("Road Access") ? "Yes" : "No",
          boundaryWall: p.amenities?.includes("Boundary Wall") ? "Yes" : "No",
          electricity: p.amenities?.includes("Electricity") ? "Yes" : "No",
          foodIncluded: p.amenities?.includes("Food Included") ? "Yes" : "No",
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
  }, [id, navigate, token, user?._id, user?.role]);

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
