import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (triggerDeps = []) => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Fast hero element entry
      gsap.from(".gsap-hero-item", {
        opacity: 0,
        y: 12,
        duration: 0.3,
        ease: "power2.out",
        clearProps: "all",
      });

      // 2. Ultra-smooth batch scroll trigger for cards (60fps performance)
      ScrollTrigger.batch(".gsap-card", {
        start: "top 98%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.03,
              ease: "power2.out",
              clearProps: "all",
              overwrite: "auto",
            }
          );
        },
      });

      // 3. Fast section reveal on scroll
      ScrollTrigger.batch(".gsap-section", {
        start: "top 98%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.25,
              stagger: 0.04,
              ease: "power2.out",
              clearProps: "all",
              overwrite: "auto",
            }
          );
        },
      });
    });

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, triggerDeps);
};

export default useScrollAnimation;


