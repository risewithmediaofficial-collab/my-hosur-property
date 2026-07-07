import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

const positionClasses = [
  "",
  "[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]",
  "[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]",
  "[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]",
  "[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]",
  "[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]",
  "[&>div]:!top-[27.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]",
];

/**
 * Multi-image zoom parallax — centre image scales to fill the viewport on scroll.
 * Scroll track is 200vh (not 300vh) to avoid white gaps before the next section.
 */
export function ZoomParallax({ images }) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const centerScale = useTransform(scrollYProgress, [0, 1], [1, 12]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale7 = useTransform(scrollYProgress, [0, 1], [1, 7]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const outerScales = [scale5, scale6, scale7, scale8, scale9, scale6, scale8];
  const othersOpacity = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [1, 0.85, 0.25, 0]);

  const gallery = images.slice(0, 7);

  return (
    <div ref={container} className="relative h-[200vh] bg-[#0f172a]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0f172a]">
        {gallery.map(({ src, alt }, index) => {
          const isCenter = index === 0;
          const scale = isCenter ? centerScale : outerScales[(index - 1) % outerScales.length];

          return (
            <motion.div
              key={`${src}-${index}`}
              style={{
                scale,
                opacity: isCenter ? 1 : othersOpacity,
              }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${positionClasses[index] || ""} ${isCenter ? "z-20" : "z-10"}`}
            >
              <div
                className={`relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 sm:rounded-2xl ${
                  isCenter ? "h-[28vh] w-[28vw] min-h-[140px] min-w-[160px] sm:h-[32vh] sm:w-[32vw]" : "h-[25vh] w-[25vw] min-h-[120px] min-w-[140px]"
                }`}
              >
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt || `Property showcase ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ZoomParallax;
