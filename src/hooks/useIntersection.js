import { useEffect, useRef, useState } from "react";

// Pool of shared IntersectionObservers keyed by "threshold::rootMargin"
// Creates one observer per config instead of one per component instance.
const observerPool = new Map();

function getSharedObserver(threshold, rootMargin) {
  const key = `${threshold}::${rootMargin}`;
  if (observerPool.has(key)) return observerPool.get(key);
  const callbacks = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const cb = callbacks.get(entry.target);
        if (cb) cb(entry);
      });
    },
    { threshold, rootMargin }
  );
  observerPool.set(key, { io, callbacks });
  return { io, callbacks };
}

/**
 * useIntersection - lightweight, pooled IntersectionObserver hook.
 * Uses a single shared observer per threshold/rootMargin pair,
 * dramatically reducing observer count when many cards are on a page.
 *
 * @param {{ threshold?: number, rootMargin?: string, once?: boolean }} options
 * @returns {{ ref: React.RefObject, isIntersecting: boolean }}
 */
export function useIntersection({ threshold = 0.1, rootMargin = "0px", once = true } = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { io, callbacks } = getSharedObserver(threshold, rootMargin);
    callbacks.set(el, (entry) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (once) {
          io.unobserve(el);
          callbacks.delete(el);
        }
      } else if (!once) {
        setIsIntersecting(false);
      }
    });
    io.observe(el);
    return () => {
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, [threshold, rootMargin, once]);

  return { ref, isIntersecting };
}

export default useIntersection;
