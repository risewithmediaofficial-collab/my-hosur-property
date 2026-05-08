import { Link } from "react-router-dom";
import { currency, formatArea, slugify } from "../utils/format";
import { CheckBadgeIcon, MapPinIcon, RectangleStackIcon, UserIcon } from "@heroicons/react/24/outline";

const PropertyCard = ({ item, onSave, isSaved, showOwner = true }) => {
  const image = item.images?.[0] || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=60";
  const href = `/property/${item._id}/${slugify(item.title)}`;
  const badges = [
    item.verification?.isVerified ? "Verified" : "",
    item.verification?.reraId ? "RERA" : "",
    item.possessionStatus || "",
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] shadow-[0_16px_36px_rgba(37,99,235,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(37,99,235,0.12)]">
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
            {item.propertyType || "Property"}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              {item.listingType || "sale"}
            </p>
            <p className="truncate text-lg font-bold text-white">{item.title}</p>
          </div>
          <p className="rounded-full bg-blue-600/90 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
            {currency(item.price)}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {item.location?.area}, {item.location?.city}
            </span>
          </p>
          {showOwner ? (
            <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <UserIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span className="line-clamp-1">
                Posted by {item.ownerId?.name || "Owner"} ({item.ownerId?.role || item.listingSource || "owner"})
              </span>
            </p>
          ) : null}
        </div>

        {badges.length ? (
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px] font-semibold">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 text-blue-700"
              >
                <CheckBadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600 flex-shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
          <div className="rounded-2xl bg-blue-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 line-clamp-1">
            {item.furnishingStatus || "Unfurnished"}
          </div>
          <div className="rounded-2xl bg-blue-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 capitalize line-clamp-1">
            {item.listingSource || "owner"}
          </div>
          <div className="rounded-2xl bg-blue-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 capitalize line-clamp-1">
            {item.listingType || "sale"}
          </div>
          <div className="rounded-2xl bg-blue-50/70 px-2.5 py-1.5 sm:px-3 sm:py-2 line-clamp-1">
            {item.bhk || "Studio"} BHK
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-blue-100 pt-3 sm:flex-row sm:gap-3 sm:pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 min-w-0">
            <RectangleStackIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{item.carpetArea ? formatArea(item.carpetArea, item.areaUnit) : "Area on request"}</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSave?.(item._id)}
              className={`flex-1 sm:flex-none rounded-full px-2 sm:px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                isSaved
                  ? "border border-blue-600 bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <Link
              to={href}
              className="flex-1 sm:flex-none rounded-full bg-blue-600 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 text-center"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
