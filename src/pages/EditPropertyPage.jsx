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
  if (apiType === "Warehouse" || apiType === "Industrial Shed" || apiType === "Industry") return "Warehouse / Industry";
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
    } else if (trimmed.startsWith("Road Type:")) {
      extracted.roadType = trimmed.replace("Road Type:", "").trim();
    } else if (trimmed.startsWith("Facing:")) {
      extracted.facing = trimmed.replace("Facing:", "").trim();
    } else if (trimmed.startsWith("Corners:")) {
      extracted.corner = trimmed.replace("Corners:", "").trim();
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

        const frontendPropertyType = getFrontendPropertyType(p.propertyType, p.listingType);
        const isRent = frontendPropertyType === "Rent" || frontendPropertyType === "PG";
        const parsedDesc = parseDescription(p.description);

        const initialForm = {
          propertyType: frontendPropertyType || "Apartment",
          title: p.title || "",
          description: parsedDesc.description || p.description || "",
          isSold: Boolean(p.isSold || false),
          contactName: p.listingContact?.name || "",
          contactPhone: p.listingContact?.phone || "",
          contactEmail: p.listingContact?.email || "",
          country: p.location?.country || "India",
          state: p.location?.state || "Tamil Nadu",
          district: p.location?.district || "Krishnagiri",
          taluk: p.location?.taluk || "Hosur",
          village: p.location?.village || "",
          houseAddress: p.location?.address || "",
          city: p.location?.city || "",
          area: p.location?.area || "",
          postedBy: p.listingSource || "owner",
          listingType: p.listingType || "sale",
          price: isRent ? "" : String(p.price || ""),
          monthlyRent: isRent ? String(p.monthlyRent || p.price || "") : "",
          landArea: p.landArea || "",
          flatArea: p.flatArea || "",
          length: p.length || "",
          width: p.width || "",
          plotType: p.plotType || "",
          individualPlot: p.individualPlot || "Yes",
          layoutPlot: p.layoutPlot || "Yes",
          gatedCommunity: p.amenities?.includes("Gated Community") ? "Yes" : "No",
          park: p.amenities?.includes("Park") ? "Yes" : "No",
          cctvCamera: p.amenities?.includes("CCTV Camera") ? "Yes" : "No",
          security: p.amenities?.includes("Security") ? "Yes" : "No",
          dtcp: p.amenities?.includes("DTCP") ? "Yes" : "No",
          hntda: p.amenities?.includes("HNTDA Approved") ? "Yes" : "No",
          rera: p.verification?.reraId ? "Yes" : "No",
          panchayatApproval: p.amenities?.includes("Panchayat Approval") ? "Yes" : "No",
          rocApproval: p.amenities?.includes("ROC Approval") ? "Yes" : "No",
          reraId: p.verification?.reraId || "",
          bhk: String(p.bhk || ""),
          bathrooms: String(p.bathrooms || "1"),
          furnishingStatus: p.furnishingStatus || "Unfurnished",
          floorNumber: String(p.floorNumber || ""),
          totalFloors: String(p.totalFloors || ""),
          carpetArea: String(p.carpetArea || ""),
          builtupArea: String(p.builtupArea || ""),
          areaUnit: p.areaUnit || "sqft",
          possessionStatus: p.possessionStatus || "Ready to Move",
          facing: p.facing || parsedDesc.facing || "",
          monthlyMaintenance: p.monthlyMaintenance ? String(p.monthlyMaintenance) : "",
          maintenanceType: p.maintenanceType || "",
          waterSourceType: p.waterSourceType || "",
          waterSource: p.waterSource || "",
          frontage: p.frontage || "",
          roadWidth: p.roadWidth || parsedDesc.roadWidth || "",
          roadType: p.roadType || parsedDesc.roadType || "",
          corner: p.corner || parsedDesc.corner || "",
          cropSuitable: p.cropSuitable || "",
          soilType: p.soilType || "Red Soil",
          farmhouse: p.farmhouseCount ? "Yes" : "No",
          farmhouseCount: String(p.farmhouseCount || "1"),
          villaType: p.villaType || "Simplex",
          sharingType: p.sharingType || "",
          advance: p.advance || "",
          measurementType: p.measurementType || (frontendPropertyType === "Agri Land" || frontendPropertyType === "Farmland" ? "Cent" : "Square Feet"),
          ratePerUnit: p.ratePerUnit ? String(p.ratePerUnit) : "",
          totalAmount: p.totalAmount ? String(p.totalAmount) : "",
          warehouseDetails: p.warehouseDetails || {},
          // Yes/No fields for features/amenities
          parking: p.amenities?.includes("Parking") ? "Yes" : "No",
          balcony: p.amenities?.includes("Balcony") ? "Yes" : "No",
          lift: p.amenities?.includes("Lift") ? "Yes" : "No",
          powerBackup: p.amenities?.includes("Power Backup") ? "Yes" : "No",
          waterSupply: p.amenities?.includes("Water Supply") ? "Yes" : "No",
          roadAccess: p.amenities?.includes("Road Access") ? "Yes" : "No",
          boundaryWall: p.amenities?.includes("Boundary Wall") ? "Yes" : "No",
          electricity: p.amenities?.includes("Electricity") ? "Yes" : "No",
          foodIncluded: p.amenities?.includes("Food Included") ? "Yes" : "No",
          tv: p.amenities?.includes("TV") ? "Yes" : "No",
          wifi: p.amenities?.includes("WiFi") ? "Yes" : "No",
          gym: p.amenities?.includes("Gym") ? "Yes" : "No",
          washingMachine: p.amenities?.includes("Washing Machine") ? "Yes" : "No",
          hotWater: p.amenities?.includes("Hot Water") ? "Yes" : "No",
          borewell: p.borewell || "No",
          well: p.well || "No",
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
