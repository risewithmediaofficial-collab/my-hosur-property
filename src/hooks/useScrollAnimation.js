import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared GSAP scroll-animation hook.
 * Pass a rootRef to scope queries to the component subtree (faster than document-wide querySelectorAll).
 *
 * @param {React.RefObject} [rootRef] - optional root element to scope queries
 * @param {any[]} [triggerDeps] - deps that cause animations to re-initialize
 */
export const useScrollAnimation = (rootRef = null, triggerDeps = []) => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Hero entrance animations
      const heroItems = (rootRef?.current ?? document).querySelectorAll(".gsap-hero-item");
      if (heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.05,
            ease: "power2.out",
            overwrite: "auto",
            force3D: true,
          }
        );
      }

      // 2. Batched card reveal - hardware accelerated
      ScrollTrigger.batch(".gsap-card", {
        start: "top 93%",
        once: true,
        interval: 0.04,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 18, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.04,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });

      // 3. Section reveal
      ScrollTrigger.batch(".gsap-section", {
        start: "top 94%",
        once: true,
        interval: 0.04,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 14, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.38,
              stagger: 0.05,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });
    }, rootRef?.current ?? undefined);

    // Debounced refresh - avoid thrashing layout when images lazy-load
    const timer = setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, triggerDeps);
};

export default useScrollAnimation;
