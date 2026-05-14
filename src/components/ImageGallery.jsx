import { useEffect, useState } from "react";
import { PROPERTY_PLACEHOLDER_IMAGE } from "../constants/propertyMedia";
import { getPropertyImageAlt } from "../utils/seo";

const ImageGallery = ({ images = [], property = {} }) => {
  const safeImages = images.filter(Boolean);
  const primaryImage = safeImages[0] || PROPERTY_PLACEHOLDER_IMAGE;
  const [active, setActive] = useState(primaryImage);

  useEffect(() => {
    setActive(primaryImage);
  }, [primaryImage]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,245,238,0.86))] shadow-[0_24px_56px_rgba(15,23,42,0.1)]">
        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={active}
            alt={safeImages.length ? getPropertyImageAlt(property, safeImages.indexOf(active)) : "No property image uploaded"}
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            decoding="async"
            onError={() => setActive(PROPERTY_PLACEHOLDER_IMAGE)}
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {safeImages.slice(0, 8).map((img) => {
          const isActive = active === img;

          return (
            <button
              key={img}
              type="button"
              onClick={() => setActive(img)}
              className={`shrink-0 overflow-hidden rounded-2xl border transition ${
                isActive
                  ? "border-slate-900 shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
                  : "border-white/70 bg-white/75 hover:border-[#d7b88b]"
              }`}
            >
              <img
                src={img}
                alt={getPropertyImageAlt(property, safeImages.indexOf(img))}
                className="h-20 w-24 object-cover"
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = PROPERTY_PLACEHOLDER_IMAGE;
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;
