import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (triggerDeps = []) => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Smooth hero entrance
      const heroItems = document.querySelectorAll(".gsap-hero-item");
      if (heroItems.length > 0) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            overwrite: "auto",
          }
        );
      }

      // 2. Ultra-smooth batch scroll trigger for cards (hardware accelerated)
      ScrollTrigger.batch(".gsap-card", {
        start: "top 92%",
        once: true,
        interval: 0.05,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 18, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.04,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });

      // 3. Fast & clean section reveal on scroll
      ScrollTrigger.batch(".gsap-section", {
        start: "top 94%",
        once: true,
        interval: 0.05,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 14, force3D: true },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power2.out",
              overwrite: "auto",
            }
          );
        },
      });
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, triggerDeps);
};

export default useScrollAnimation;



