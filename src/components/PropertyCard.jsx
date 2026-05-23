import { Link } from "react-router-dom";
import { currency, formatArea } from "../utils/format";
import { ArrowRightIcon, CheckBadgeIcon, MapPinIcon, RectangleStackIcon, UserIcon } from "@heroicons/react/24/outline";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt, getPropertyPath } from "../utils/seo";
import useScrollToTop from "../hooks/useScrollToTop";

const PropertyCard = ({ item, onSave, isSaved, showOwner = true }) => {
  const href = getPropertyPath(item);
  const scrollToTop = useScrollToTop();
  const badges = [
    item.verification?.isVerified ? "Verified" : "",
    item.verification?.reraId ? "RERA" : "",
    item.possessionStatus || "",
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden border border-slate-200 bg-white transition duration-300 hover:-translate-y-1">
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
        <div className="absolute left-4 top-4">
          <span className="rounded bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            {item.propertyType || "Property"}
          </span>
        </div>
        <div className="absolute bottom-4 right-4">
          <p className="rounded bg-white px-3 py-1.5 text-sm font-bold text-slate-900">
            {currency(item.price)}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.listingType || "sale"}</p>
          <p className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-900">{item.title}</p>
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
                className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-slate-700 sm:px-2.5 sm:py-1"
              >
                <CheckBadgeIcon className="h-3 w-3 flex-shrink-0 text-slate-900 sm:h-3.5 sm:w-3.5" />
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
          <div className="line-clamp-1 border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2">
            {item.furnishingStatus || "Unfurnished"}
          </div>
          <div className="line-clamp-1 border border-slate-200 bg-white px-2.5 py-1.5 capitalize sm:px-3 sm:py-2">
            {item.listingSource || "owner"}
          </div>
          <div className="line-clamp-1 border border-slate-200 bg-white px-2.5 py-1.5 capitalize sm:px-3 sm:py-2">
            {item.listingType || "sale"}
          </div>
          <div className="line-clamp-1 border border-slate-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2">
            {item.bhk || "Studio"} BHK
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:gap-3 sm:pt-4">
          <span className="min-w-0 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <RectangleStackIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{item.carpetArea ? formatArea(item.carpetArea, item.areaUnit) : "Area on request"}</span>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSave?.(item._id)}
              className={`flex-1 sm:flex-none rounded-full px-2 sm:px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                isSaved
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
            <Link
              to={href}
              onClick={scrollToTop}
              aria-label={`View ${item.title} property details`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-center text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black sm:flex-none sm:px-4"
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
