import { useEffect, useState } from "react";

const LOW_MOTION_QUERY = "(prefers-reduced-motion: reduce), (max-width: 768px), (pointer: coarse)";

const getLowMotionPreference = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(LOW_MOTION_QUERY).matches;
};

const useLowMotionDevice = () => {
  const [isLowMotionDevice, setIsLowMotionDevice] = useState(getLowMotionPreference);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(LOW_MOTION_QUERY);
    const updatePreference = () => setIsLowMotionDevice(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return isLowMotionDevice;
};

export default useLowMotionDevice;
