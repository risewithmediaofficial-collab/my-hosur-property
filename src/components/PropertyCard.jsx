import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, MapPinIcon, HeartIcon, HeartSolidIcon } from "./AppIcons";
import { currency, formatArea } from "../utils/format";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt, getPropertyPath } from "../utils/seo";
import useScrollToTop from "../hooks/useScrollToTop";
import { useAppLanguage } from "../hooks/useAppLanguage";
import { localizeCatalogText } from "../utils/i18nCatalog";

const PropertyCard = memo(({ item, onSave, isSaved }) => {
  const { t, currentLanguage } = useAppLanguage();
  const href = getPropertyPath(item);
  const scrollToTop = useScrollToTop();
  const isSold = Boolean(item.isSold);

  const ribbonText = isSold
    ? t("propertyCard.sold") || "SOLD"
    : item.verification?.isVerified
    ? t("propertyCard.verified") || "VERIFIED"
    : item.verification?.reraId
    ? t("propertyCard.reraApproved") || "RERA APRVD"
    : t("propertyCard.featured") || "FEATURED";

  const propType = localizeCatalogText(item.propertyType || "Plot", currentLanguage);
  const propSize = item.carpetArea
    ? `${formatArea(item.carpetArea, item.areaUnit)}`
    : t("propertyCard.onRequest") || "On Request";
  const propLocation = item.location?.area || "Hosur";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${
        isSold ? "border-slate-300 bg-slate-50" : "border-slate-200/90 bg-white"
      } shadow-card transition-all duration-300 ${
        isSold
          ? "hover:shadow-card"
          : "hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(39,79,154,0.12)] hover:border-orange/40"
      } gsap-card font-sans`}
    >
      {/* Corner Diagonal Ribbon */}
      <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-20">
        <div className="bg-gradient-to-r from-orange to-orange-600 text-white text-[8px] font-extrabold tracking-wider text-center uppercase py-1 absolute top-4 -right-10 w-[140px] rotate-45 shadow-md">
          {ribbonText}
        </div>
      </div>

      {/* Image Block */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={item.images?.[0] || PROPERTY_PLACEHOLDER_IMAGE}
          alt={getPropertyImageAlt(item)}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSold ? "grayscale opacity-60" : ""
          }`}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = PROPERTY_PLACEHOLDER_IMAGE;
          }}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="rounded-xl bg-white px-5 py-2.5 text-center shadow-lg">
              <p className="text-base font-bold text-navy">{t("propertyCard.sold") || "SOLD"}</p>
              <p className="text-xs text-slate-500">
                {t("propertyCard.soldMessage") || "This property has been sold"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className={`p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5 ${isSold ? "opacity-70" : ""}`}>
        <div>
          {/* Title */}
          <h3
            className="property-card-title font-heading font-semibold text-navy group-hover:text-orange transition-colors duration-200"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Location & BHK Details */}
          <div className="mt-2.5 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPinIcon className="h-4 w-4 text-orange shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                {propLocation}, {item.location?.city || "Hosur"}
              </span>
            </div>
            {item.bhk ? <div className="text-right shrink-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                {t("propertyCard.totalRooms") || "Total Rooms"}
              </p>
              <p className="text-xs font-extrabold text-navy">
                {item.bhk} BHK
              </p>
            </div> : null}
          </div>
        </div>

        {/* Property Type, Size details and action circular arrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-5 sm:gap-6 min-w-0">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-orange/40 pb-0.5 w-fit">
                {t("propertyCard.propertyType") || "Property Type"}
              </p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-navy truncate capitalize">{propType}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-orange/40 pb-0.5 w-fit">
                {t("propertyCard.availableSize") || "Available Size"}
              </p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-navy truncate">{propSize}</p>
            </div>
          </div>

          {/* Circular arrow button */}
          <Link
            to={href}
            onClick={scrollToTop}
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 border-navy text-navy transition-all duration-300 hover:border-orange hover:bg-orange hover:text-white group-hover:border-orange group-hover:bg-orange group-hover:text-white shadow-2xs"
            aria-label={`View ${item.title} property`}
          >
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>

        {/* Price & Optional Save */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
          <div className="text-xl sm:text-[22px] font-black leading-tight text-navy tracking-tight">
            {currency(item.price)}
          </div>
          {onSave && !isSold && (
            <button
              type="button"
              onClick={() => onSave?.(item._id)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
                isSaved
                  ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                  : "border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30 shadow-2xs"
              }`}
              title={
                isSaved
                  ? t("propertyCard.removeFromSaved") || "Remove from saved"
                  : t("propertyCard.saveProperty") || "Save property"
              }
              aria-label={isSaved ? `Remove ${item.title} from saved properties` : `Save ${item.title}`}
              aria-pressed={Boolean(isSaved)}
            >
              {isSaved ? <HeartSolidIcon className="h-4.5 w-4.5" /> : <HeartIcon className="h-4.5 w-4.5" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

PropertyCard.displayName = "PropertyCard";
export default PropertyCard;
