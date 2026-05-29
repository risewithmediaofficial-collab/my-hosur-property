import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BedIcon,
  CheckBadgeIcon,
  InteriorIcon,
  LandIcon,
  MapPinIcon,
  RectangleStackIcon,
  UserIcon,
} from "./AppIcons";
import { currency, formatArea } from "../utils/format";
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

  const listingLabel = item.listingType === "rent" ? "Rent" : item.listingType === "sale" ? "Sale" : item.listingType || "Property";

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(26,43,78,0.12)]">
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
          <span className="rounded-md bg-navy px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {listingLabel}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="line-clamp-2 text-lg font-bold tracking-tight text-navy">{item.title}</p>
          <p className="inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-orange" />
            <span className="line-clamp-1">
              {item.location?.area}, {item.location?.city}
            </span>
          </p>
          {showOwner ? (
            <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <UserIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">
                Posted by {item.ownerId?.name || "Owner"} ({item.ownerId?.role || item.listingSource || "owner"})
              </span>
            </p>
          ) : null}
        </div>

        {badges.length ? (
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold sm:text-[11px]">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 rounded-md bg-orange/10 px-2.5 py-1 text-navy sm:px-3"
              >
                <CheckBadgeIcon className="h-3 w-3 flex-shrink-0 text-orange sm:h-3.5 sm:w-3.5" />
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <BedIcon className="h-4 w-4 text-slate-400" />
            <span>{item.bhk || "Studio"} BHK</span>
          </div>
          <div className="flex items-center gap-2">
            <InteriorIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate capitalize">{item.furnishingStatus || "Unfurnished"}</span>
          </div>
          <div className="flex items-center gap-2">
            <RectangleStackIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate">{item.carpetArea ? formatArea(item.carpetArea, item.areaUnit) : "Area on request"}</span>
          </div>
          <div className="flex items-center gap-2">
            <LandIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate capitalize">{item.propertyType || "Property"}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xl font-bold leading-tight text-navy">{currency(item.price)}</p>
          <div className="mt-3 flex items-stretch gap-2">
            {onSave ? (
              <button
                type="button"
                onClick={() => onSave?.(item._id)}
                className={`inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${
                  isSaved
                    ? "bg-navy text-white"
                    : "border border-slate-200 bg-white text-navy hover:border-orange hover:text-orange"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            ) : null}
            <Link
              to={href}
              onClick={scrollToTop}
              aria-label={`View ${item.title} property details`}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-orange px-3 text-xs font-bold whitespace-nowrap text-white transition hover:bg-orange-hover sm:text-sm"
            >
              <span>View Property</span>
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
