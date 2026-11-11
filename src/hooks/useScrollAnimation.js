import { useEffect, useRef } from "react";
import useLowMotionDevice from "./useLowMotionDevice";

// Animate only newly added below-the-fold items so visible hero/content never flickers.
export const useScrollAnimation = (rootRef = null, refreshKey = 0, prefix = "gsap") => {
  const lowMotion = useLowMotionDevice();
  const seenNodesRef = useRef(new WeakSet());
  const triggersRef = useRef([]);

  useEffect(() => {
    const seenNodes = seenNodesRef.current;
    const triggers = triggersRef.current;
    return () => {
      triggers.forEach((trigger) => trigger?.kill?.());
      triggersRef.current = [];
      seenNodesRef.current = new WeakSet();
      void seenNodes;
    };
  }, [prefix]);

  useEffect(() => {
    if (lowMotion) return undefined;
    let cancelled = false;
    let timer;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const root = rootRef?.current || document.querySelector("main") || document;
        const viewportThreshold = window.innerHeight * 0.96;

        for (const selector of [`.${prefix}-card, .gsap-card`, `.${prefix}-section`]) {
          const items = Array.from(root.querySelectorAll(selector));
          const pendingBelowFold = [];

          for (const item of items) {
            if (seenNodesRef.current.has(item)) continue;
            seenNodesRef.current.add(item);

            // Never fade elements already visible inside or above the initial viewport.
            if (item.getBoundingClientRect().top >= viewportThreshold) {
              pendingBelowFold.push(item);
            }
          }

          if (pendingBelowFold.length) {
            const batchTriggers = ScrollTrigger.batch(pendingBelowFold, {
              scroller: window,
              start: "top 95%",
              once: true,
              interval: 0.04,
              onEnter: (batch) =>
                gsap.fromTo(
                  batch,
                  { opacity: 0, y: 16 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.04,
                    ease: "power2.out",
                    clearProps: "transform,opacity",
                    overwrite: "auto",
                  }
                ),
            });
            if (Array.isArray(batchTriggers)) {
              triggersRef.current.push(...batchTriggers);
            }
          }
        }

        timer = window.setTimeout(() => {
          if (!cancelled) ScrollTrigger.refresh();
        }, 120);
      })
      .catch(() => {
        // Content remains visible if the optional animation chunk cannot load.
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [rootRef, refreshKey, prefix, lowMotion]);
};

export default useScrollAnimation;
