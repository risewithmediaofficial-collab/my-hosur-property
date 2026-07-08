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
  HeartIcon,
  HeartSolidIcon,
} from "./AppIcons";
import { currency, formatArea } from "../utils/format";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt, getPropertyPath } from "../utils/seo";
import useScrollToTop from "../hooks/useScrollToTop";

const PropertyCard = ({ item, onSave, isSaved, showOwner = true }) => {
  const href = getPropertyPath(item);
  const scrollToTop = useScrollToTop();
  const isSold = Boolean(item.isSold);
  
  const ribbonText = isSold
    ? "SOLD"
    : item.verification?.isVerified
    ? "VERIFIED"
    : item.verification?.reraId
    ? "RERA APRVD"
    : "FEATURED";

  const propType = item.propertyType || "Plot";
  const propSize = item.carpetArea ? `${formatArea(item.carpetArea, item.areaUnit)}` : "On Request";
  const propLocation = item.location?.area || "Hosur";

  return (
    <article className={`group relative overflow-hidden rounded-xl border ${isSold ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'} shadow-card transition duration-300 ${isSold ? 'hover:shadow-card' : 'hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(39,79,154,0.12)]'} gsap-card`}>
      
      {/* Corner Diagonal Ribbon */}
      <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-20">
        <div className="bg-gradient-to-r from-orange to-orange-600 text-white text-[8px] font-extrabold tracking-wider text-center uppercase py-1 absolute top-4 -right-10 w-[140px] rotate-45 shadow-md">
          {ribbonText}
        </div>
      </div>

      {/* Image Block */}
      <div className="relative h-56 overflow-hidden bg-slate-100">
        <img
          src={item.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
          alt={getPropertyImageAlt(item)}
          className={`h-full w-full object-cover transition duration-500 ${isSold ? 'grayscale opacity-60' : ''}`}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = PROPERTY_PLACEHOLDER_IMAGE;
          }}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="rounded-lg bg-white px-6 py-3 text-center shadow-lg">
              <p className="text-lg font-bold text-navy">SOLD</p>
              <p className="text-xs text-slate-600">This property has been sold</p>
            </div>
          </div>
        )}
      </div>

      {/* Card Body - Adissia Design Layout */}
      <div className={`p-5 flex flex-col gap-4 ${isSold ? 'opacity-70' : ''}`}>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-navy leading-tight truncate group-hover:text-orange transition-colors duration-200">
          {item.title}
        </h3>

        {/* Location & BHK Details */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPinIcon className="h-4.5 w-4.5 text-orange shrink-0" />
            <span className="text-sm font-semibold text-slate-600 truncate">{propLocation}, {item.location?.city || "Hosur"}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Rooms</p>
            <p className="text-xs font-extrabold text-navy">{item.bhk ? `${item.bhk} BHK` : "Studio"}</p>
          </div>
        </div>

        {/* Property Type, Size details and action circular arrow */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-6 min-w-0">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b-2 border-orange/40 pb-0.5 w-fit">Property Type</p>
              <p className="mt-1 text-sm font-bold text-navy truncate capitalize">{propType}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b-2 border-orange/40 pb-0.5 w-fit">Available Size</p>
              <p className="mt-1 text-sm font-bold text-navy truncate">{propSize}</p>
            </div>
          </div>

          {/* Adissia Style circular arrow button */}
          <Link
            to={href}
            onClick={scrollToTop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-navy text-navy transition-all duration-300 group-hover:bg-navy group-hover:text-white group-hover:border-navy"
            aria-label={`View ${item.title} property`}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Price & Optional Save */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
          <div className="text-xl font-black leading-tight text-navy">{currency(item.price)}</div>
          {onSave && !isSold && (
            <button
              type="button"
              onClick={() => onSave?.(item._id)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                isSaved
                  ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                  : "border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30"
              }`}
              title={isSaved ? "Remove from saved" : "Save property"}
            >
              {isSaved ? <HeartSolidIcon className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
