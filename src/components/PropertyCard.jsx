import { Link } from "react-router-dom";
import { currency, formatArea } from "../utils/format";
import { ArrowRightIcon, CheckBadgeIcon, MapPinIcon, RectangleStackIcon, UserIcon } from "@heroicons/react/24/outline";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt, getPropertyPath } from "../utils/seo";

const PropertyCard = ({ item, onSave, isSaved, showOwner = true }) => {
  const href = getPropertyPath(item);
  const badges = [
    item.verification?.isVerified ? "Verified" : "",
    item.verification?.reraId ? "RERA" : "",
    item.possessionStatus || "",
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(249,245,238,0.9))] shadow-[0_20px_44px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(15,23,42,0.12)]">
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
          alt={getPropertyImageAlt(item)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = PROPERTY_PLACEHOLDER_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/18 to-transparent" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8b6b3f] backdrop-blur-sm">
            {item.propertyType || "Property"}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f3d8af]">
              {item.listingType || "sale"}
            </p>
            <p className="truncate text-lg font-bold text-white">{item.title}</p>
          </div>
          <p className="rounded-full border border-white/10 bg-white/14 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-md">
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
                className="inline-flex items-center gap-1 rounded-full border border-[#eadbc4] bg-[#fff8ef] px-2 sm:px-2.5 py-0.5 sm:py-1 text-[#8b6b3f]"
              >
                <CheckBadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#b98a53] flex-shrink-0" />
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
          <div className="rounded-2xl border border-white/70 bg-white/80 px-2.5 py-1.5 sm:px-3 sm:py-2 line-clamp-1">
            {item.furnishingStatus || "Unfurnished"}
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-2.5 py-1.5 sm:px-3 sm:py-2 capitalize line-clamp-1">
            {item.listingSource || "owner"}
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-2.5 py-1.5 sm:px-3 sm:py-2 capitalize line-clamp-1">
            {item.listingType || "sale"}
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-2.5 py-1.5 sm:px-3 sm:py-2 line-clamp-1">
            {item.bhk || "Studio"} BHK
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200/70 pt-3 sm:flex-row sm:gap-3 sm:pt-4">
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
                  ? "border border-slate-900 bg-slate-900 text-white"
                  : "border border-slate-200/80 bg-white/80 text-slate-700 hover:border-[#d7b88b] hover:bg-[#fff8ef] hover:text-slate-900"
              }`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <Link
              to={href}
              aria-label={`View ${item.title} property details`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#111827,#334155)] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.22)] text-center"
            >
              View
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
