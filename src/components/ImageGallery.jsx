import { useState } from "react";

const ImageGallery = ({ images = [] }) => {
  const safeImages = images.length
    ? images
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=60"];
  const [active, setActive] = useState(safeImages[0]);

  return (
    <div className="space-y-3">
      <div className="w-full aspect-[4/3] sm:h-96 rounded-2xl overflow-hidden shadow-soft">
        <img src={active} alt="Property" className="h-full w-full object-cover" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
        {safeImages.slice(0, 8).map((img) => (
          <button key={img} className="shrink-0 w-20 h-20 overflow-hidden rounded-xl snap-start border-2 border-transparent hover:border-sage focus:border-sage transition" onClick={() => setActive(img)}>
            <img src={img} alt="Preview" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
