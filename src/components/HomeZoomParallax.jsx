import { ZoomParallax } from "./ui/zoom-parallax";
import { HOME_PARALLAX_IMAGES } from "../constants/homeParallaxImages";
import useLowMotionDevice from "../hooks/useLowMotionDevice";

const HomeZoomParallax = () => {
  const lowMotionDevice = useLowMotionDevice();

  return (
    <section className="relative bg-[#0f172a]" aria-label="Property visual showcase">
      <div className="mx-auto max-w-[1440px] px-5 pb-4 pt-14 text-center sm:px-8 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">Property gallery</p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Explore Hosur properties</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/70">
          Scroll — all images zoom in and the centre photo opens to full screen.
        </p>
      </div>

      {lowMotionDevice ? (
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-5 pb-14 sm:grid-cols-3 sm:gap-4 sm:px-8 lg:px-10">
          {HOME_PARALLAX_IMAGES.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10">
              <img src={image.src} alt={image.alt} className="aspect-[4/3] h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <ZoomParallax images={HOME_PARALLAX_IMAGES} />
      )}
    </section>
  );
};

export default HomeZoomParallax;
