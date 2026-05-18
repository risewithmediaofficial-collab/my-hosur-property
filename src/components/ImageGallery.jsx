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
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_36px_rgba(17,17,17,0.06)]">
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
                  ? "border-slate-900 shadow-[0_14px_28px_rgba(17,17,17,0.08)]"
                  : "border-slate-200 bg-white hover:border-slate-900"
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
