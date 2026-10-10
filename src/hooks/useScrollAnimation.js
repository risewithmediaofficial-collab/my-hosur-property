import { useEffect } from "react";
import useLowMotionDevice from "./useLowMotionDevice";

// Load the animation engine only on devices that use these effects.
export const useScrollAnimation = (rootRef = null, refreshKey = 0, prefix = "gsap") => {
  const lowMotion = useLowMotionDevice();

  useEffect(() => {
    if (lowMotion) return;
    let cancelled = false;
    let context;
    let timer;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const root = rootRef?.current || document.querySelector("main") || document;
      const panel = root.querySelector(".listing-results-scroll");
      context = gsap.context(() => {
        const heroItems = root.querySelectorAll(`.${prefix}-hero-item`);
        if (heroItems.length) gsap.fromTo(heroItems, { opacity: 0, y: 16 }, {
          opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out", overwrite: "auto",
        });

        for (const selector of [`.${prefix}-card, .gsap-card`, `.${prefix}-section`]) {
          const items = Array.from(root.querySelectorAll(selector));
          for (const scroller of [window, ...(panel ? [panel] : [])]) {
            const targets = items.filter(item => panel?.contains(item) ? scroller === panel : scroller === window);
            if (!targets.length) continue;
            ScrollTrigger.batch(targets, {
              scroller, start: "top 94%", once: true, interval: 0.04,
              onEnter: batch => gsap.fromTo(batch, { opacity: 0, y: 16 }, {
                opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out", overwrite: "auto",
              }),
            });
          }
        }
      }, root);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    }).catch(() => {
      // Content remains visible if the optional animation chunk cannot load.
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      context?.revert();
    };
  }, [rootRef, refreshKey, prefix, lowMotion]);
};

export default useScrollAnimation;
