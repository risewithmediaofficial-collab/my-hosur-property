import { useEffect, useState, useCallback, memo } from "react";
import { KeyboardArrowUpIcon, KeyboardArrowDownIcon } from "./AppIcons";

const ScrollNavigationButtons = () => {
  const [scrollProgress, setScrollProgress] = useState({
    canScroll: true,
    isAtTop: true,
    isAtBottom: false,
  });

  const checkScroll = useCallback(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY || docEl.scrollTop || body.scrollTop || 0;
    const clientHeight = window.innerHeight || docEl.clientHeight;
    const scrollHeight = Math.max(
      docEl.scrollHeight,
      body.scrollHeight,
      docEl.offsetHeight,
      body.offsetHeight
    );

    const isAtTop = scrollY <= 60;
    const isAtBottom = scrollY + clientHeight >= scrollHeight - 60;
    const canScroll = scrollHeight > clientHeight + 150;

    setScrollProgress((prev) => {
      if (
        prev.canScroll === canScroll &&
        prev.isAtTop === isAtTop &&
        prev.isAtBottom === isAtBottom
      ) {
        return prev;
      }
      return { canScroll, isAtTop, isAtBottom };
    });
  }, []);

  useEffect(() => {
    checkScroll();

    let ticking = false;
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    // Debounced check on DOM subtree changes (e.g. dynamic listings)
    let domTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(domTimer);
      domTimer = setTimeout(checkScroll, 400);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(domTimer);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    // Handle internal scroll panels if present (e.g. Listings or Dashboard)
    const customPanels = document.querySelectorAll(
      '.listing-results-scroll, [data-scroll-panel="properties"], .site-dashboard-app main, .site-dashboard-app'
    );
    customPanels.forEach((panel) => {
      try {
        panel.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        panel.scrollTop = 0;
      }
    });

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    // Handle internal scroll panels if present
    const customPanels = document.querySelectorAll(
      '.listing-results-scroll, [data-scroll-panel="properties"], .site-dashboard-app main, .site-dashboard-app'
    );
    customPanels.forEach((panel) => {
      try {
        panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
      } catch {
        panel.scrollTop = panel.scrollHeight;
      }
    });

    const docEl = document.documentElement;
    const body = document.body;
    const scrollHeight = Math.max(
      docEl.scrollHeight,
      body.scrollHeight,
      docEl.offsetHeight,
      body.offsetHeight,
      10000
    );

    try {
      window.scrollTo({ top: scrollHeight, left: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, scrollHeight);
    }
    document.documentElement.scrollTo({ top: scrollHeight, behavior: "smooth" });
    document.body.scrollTo({ top: scrollHeight, behavior: "smooth" });
  };

  return (
    <div
      className="fixed bottom-6 right-4 sm:right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-center gap-1.5 p-1 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 transition-all duration-300 hover:shadow-2xl hover:border-slate-300"
      role="navigation"
      aria-label="Scroll controls"
    >
      {/* Scroll to Top Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={scrollToTop}
          className={`h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            scrollProgress.isAtTop
              ? "text-slate-400 bg-slate-50 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/20"
              : "text-navy bg-slate-100 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/25 active:scale-95"
          }`}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <KeyboardArrowUpIcon className="h-6 w-6 transform transition-transform group-hover:-translate-y-0.5" />
        </button>
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-white shadow-md transition-opacity duration-150 group-hover:block whitespace-nowrap z-50">
          Scroll to top
        </span>
      </div>

      {/* Subtle Divider */}
      <div className="w-5 h-px bg-slate-200/90" aria-hidden="true" />

      {/* Scroll to Down Button */}
      <div className="relative group">
        <button
          type="button"
          onClick={scrollToBottom}
          className={`h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            scrollProgress.isAtBottom
              ? "text-slate-400 bg-slate-50 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/20"
              : "text-navy bg-slate-100 hover:bg-orange hover:text-white hover:shadow-md hover:shadow-orange/25 active:scale-95"
          }`}
          aria-label="Scroll to down"
          title="Scroll to down"
        >
          <KeyboardArrowDownIcon className="h-6 w-6 transform transition-transform group-hover:translate-y-0.5" />
        </button>
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2.5 hidden rounded-md bg-navy px-2 py-1 text-[11px] font-semibold text-white shadow-md transition-opacity duration-150 group-hover:block whitespace-nowrap z-50">
          Scroll to down
        </span>
      </div>
    </div>
  );
};

export default memo(ScrollNavigationButtons);
