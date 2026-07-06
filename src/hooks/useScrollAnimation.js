import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (triggerDeps = []) => {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const ctx = gsap.context(() => {
      // 1. Mount animation for hero titles and subtitles
      gsap.from(".gsap-hero-item", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.1,
      });

      // 2. Scroll-triggered reveal for sections (headers, tags)
      gsap.utils.toArray(".gsap-section").forEach((section) => {
        const textElements = section.querySelectorAll(".section-tag, h2, .gsap-copy, h1, h3, p");
        if (textElements.length > 0) {
          gsap.from(textElements, {
            y: 24,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              once: true,
            },
          });
        }
      });

      // 3. Staggered card fade-up on scroll
      gsap.utils.toArray(".gsap-card").forEach((card, index) => {
        gsap.from(card, {
          y: 34,
          opacity: 0,
          scale: 0.97,
          duration: 0.65,
          delay: (index % 6) * 0.04,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            once: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, triggerDeps);
};

export default useScrollAnimation;
