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
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl bg-slate-100 shadow-card">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={active}
            alt={safeImages.length ? getPropertyImageAlt(property, safeImages.indexOf(active)) : "No property image uploaded"}
            className="h-full w-full object-cover transition duration-500"
            decoding="async"
            onError={() => setActive(PROPERTY_PLACEHOLDER_IMAGE)}
          />
        </div>
      </div>

      {safeImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {safeImages.slice(0, 8).map((img) => {
            const isActive = active === img;

            return (
              <button
                key={img}
                type="button"
                onClick={() => setActive(img)}
                className={`shrink-0 overflow-hidden rounded-lg transition ${
                  isActive ? "ring-2 ring-orange ring-offset-2" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={getPropertyImageAlt(property, safeImages.indexOf(img))}
                  className="h-16 w-20 object-cover sm:h-20 sm:w-24"
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
      ) : null}
    </div>
  );
};

export default ImageGallery;
