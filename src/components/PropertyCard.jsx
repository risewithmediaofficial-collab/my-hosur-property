import { Link } from "react-router-dom";
import { currency, formatArea, slugify } from "../utils/format";
import {
  CheckBadgeIcon,
  MapPinIcon,
  RectangleStackIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const PropertyCard = ({ item, onSave, isSaved, showOwner = true }) => {
  const image = item.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=60";
  const href = `/property/${item._id}/${slugify(item.title)}`;
  const badges = [
    item.verification?.isVerified ? "Verified" : "",
    item.verification?.reraId ? "RERA" : "",
    item.possessionStatus || "",
  ].filter(Boolean);

  return (
    <article className="glass-panel uiverse-card animate-fade-up overflow-hidden rounded-2xl border border-white/70 bg-white/60 shadow-soft transition hover:-translate-y-0.5">
      <div className="relative h-52 overflow-hidden">
        <img src={image} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        <span className="absolute left-3 top-3 rounded-full bg-stone/90 px-3 py-1 text-xs font-bold">{item.propertyType}</span>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-1 text-base font-bold text-ink">{item.title}</h3>
          <p className="text-sm font-extrabold text-sage">{currency(item.price)}</p>
        </div>

        <p className="text-sm text-ink/70 inline-flex items-center gap-1.5"><MapPinIcon className="h-4 w-4" />{item.location?.area}, {item.location?.city}</p>
        {showOwner && (
          <p className="text-xs font-semibold text-ink/65 inline-flex items-center gap-1.5">
            <UserIcon className="h-4 w-4" />
            Posted by: {item.ownerId?.name || "Owner"} ({item.ownerId?.role || item.listingSource || "owner"})
          </p>
        )}
        {!!badges.length && (
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-sage/15 px-2 py-1 text-sage inline-flex items-center gap-1">
                <CheckBadgeIcon className="h-3.5 w-3.5" />
                {badge}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-ink/60">
          <span className="rounded-full bg-stone px-2 py-1">{item.furnishingStatus || "Unfurnished"}</span>
          <span className="rounded-full bg-stone px-2 py-1">{item.listingSource || "owner"}</span>
          <span className="rounded-full bg-stone px-2 py-1">{item.listingType || "sale"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-ink/60 inline-flex items-center gap-1.5">
            <RectangleStackIcon className="h-3.5 w-3.5" />
            {item.bhk || "Studio"} BHK{item.carpetArea ? ` | ${formatArea(item.carpetArea, item.areaUnit)}` : ""}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onSave?.(item._id)} className="neo-btn rounded-full px-3 py-1 text-xs font-semibold text-ink/80">
              {isSaved ? "Saved" : "Save"}
            </button>
            <Link to={href} className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-stone">
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
