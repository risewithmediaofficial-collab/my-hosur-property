import { useEffect } from "react";

const LOCK_COUNT_KEY = "scrollLockCount";
const SCROLL_Y_KEY = "scrollLockY";

const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return undefined;

    const { body, documentElement } = document;
    const activeLocks = Number(body.dataset[LOCK_COUNT_KEY] || "0");

    if (activeLocks === 0) {
      body.dataset[SCROLL_Y_KEY] = String(window.scrollY);
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${window.scrollY}px`;
      body.style.width = "100%";
      body.style.touchAction = "none";
      documentElement.style.overflow = "hidden";
      documentElement.style.overscrollBehavior = "none";
    }

    body.dataset[LOCK_COUNT_KEY] = String(activeLocks + 1);

    return () => {
      const remainingLocks = Math.max(0, Number(body.dataset[LOCK_COUNT_KEY] || "1") - 1);

      if (remainingLocks === 0) {
        const scrollY = Number(body.dataset[SCROLL_Y_KEY] || "0");

        delete body.dataset[LOCK_COUNT_KEY];
        delete body.dataset[SCROLL_Y_KEY];

        body.style.overflow = "";
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        body.style.touchAction = "";
        documentElement.style.overflow = "";
        documentElement.style.overscrollBehavior = "";

        window.scrollTo(0, scrollY);
      } else {
        body.dataset[LOCK_COUNT_KEY] = String(remainingLocks);
      }
    };
  }, [locked]);
};

export default useBodyScrollLock;
