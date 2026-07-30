import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PageLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef(null);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    clearTimeout(timerRef.current);
    setLoading(true);

    timerRef.current = setTimeout(() => {
      setLoading(false);
    }, 280);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-1 bg-gradient-to-r from-orange via-navy to-orange animate-pulse transition-all duration-200 pointer-events-none"
      aria-label="Loading page indicator"
    />
  );
};

export default PageLoader;
