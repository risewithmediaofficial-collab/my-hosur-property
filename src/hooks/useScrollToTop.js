import { useCallback } from 'react';

/**
 * Hook to scroll to top of the page with immediate execution
 * Temporarily disables smooth scroll to ensure immediate scroll to top
 * @returns {function} Scroll to top function
 */
const useScrollToTop = () => {
  return useCallback(() => {
    // Temporarily disable smooth scroll for immediate scroll to top
    const htmlElement = document.documentElement;
    const originalScroll = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    
    // Restore smooth scroll after a brief delay
    setTimeout(() => {
      htmlElement.style.scrollBehavior = originalScroll;
    }, 50);
  }, []);
};

export default useScrollToTop;
