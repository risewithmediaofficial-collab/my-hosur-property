import { useEffect, useState, useCallback, memo } from "react";
import { useLocation } from "react-router-dom";
import useMediaQuery from "../hooks/useMediaQuery";
import { KeyboardArrowUpIcon, KeyboardArrowDownIcon } from "./AppIcons";

const getScrollTarget = () => {
  const panels = document.querySelectorAll('.listing-results-scroll, .site-dashboard-app main');
  return Array.from(panels).find((panel) =>
    panel.scrollHeight > panel.clientHeight && /auto|scroll/.test(getComputedStyle(panel).overflowY)
  ) || document.scrollingElement;
};

const ScrollNavigationButtons = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { pathname } = useLocation();
  const [scrollProgress, setScrollProgress] = useState({
    isAtTop: true,
    isAtBottom: false,
  });

  const checkScroll = useCallback(() => {
    const target = getScrollTarget();
    const scrollY = target.scrollTop;
    const clientHeight = target.clientHeight;
    const scrollHeight = target.scrollHeight;

    const isAtTop = scrollY <= 60;
    const isAtBottom = scrollY + clientHeight >= scrollHeight - 60;

    setScrollProgress((prev) => {
      if (
        prev.isAtTop === isAtTop &&
        prev.isAtBottom === isAtBottom
      ) {
        return prev;
      }
      return { isAtTop, isAtBottom };
    });
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    let frame = 0;
    const onScrollOrResize = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          checkScroll();
        });
      }
    };

    onScrollOrResize();
    // Capture scroll events from both the document and desktop results panels.
    document.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const observer = new ResizeObserver(onScrollOrResize);
    observer.observe(document.body);
    const main = document.querySelector("main");
    if (main) observer.observe(main);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
    };
  }, [checkScroll, isDesktop, pathname]);

  const scrollTo = (bottom) => {
    const target = getScrollTarget();
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    target.scrollTo({ top: bottom ? target.scrollHeight : 0, behavior });
  };

  if (!isDesktop) return null;

  return (
    <div
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 hidden md:flex flex-col items-center gap-1 p-1 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 transition-all duration-300 hover:shadow-2xl hover:border-slate-300"
      role="navigation"
      aria-label="Scroll controls"
    >
      {/* Scroll to Top Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => scrollTo(false)}
          className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer ${
            scrollProgress.isAtTop
              ? "text-slate-400 bg-slate-50 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/20"
              : "text-navy bg-slate-100 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/25 active:scale-95"
          }`}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <KeyboardArrowUpIcon className="h-5 w-5 sm:h-6 sm:w-6 transform transition-transform group-hover:-translate-y-0.5" />
        </button>
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-white shadow-md transition-opacity duration-150 group-hover:block whitespace-nowrap z-50">
          Scroll to top
        </span>
      </div>

      {/* Subtle Divider */}
      <div className="w-4 sm:w-5 h-px bg-slate-200/90" aria-hidden="true" />

      {/* Scroll to Down Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => scrollTo(true)}
          className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer ${
            scrollProgress.isAtBottom
              ? "text-slate-400 bg-slate-50 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/20"
              : "text-navy bg-slate-100 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/25 active:scale-95"
          }`}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <KeyboardArrowDownIcon className="h-5 w-5 sm:h-6 sm:w-6 transform transition-transform group-hover:translate-y-0.5" />
        </button>
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-white shadow-md transition-opacity duration-150 group-hover:block whitespace-nowrap z-50">
          Scroll to bottom
        </span>
      </div>
    </div>
  );
};

export default memo(ScrollNavigationButtons);
