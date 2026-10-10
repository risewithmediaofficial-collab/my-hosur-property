import { useEffect, useRef, useState, memo } from "react";
import useLowMotionDevice from "../hooks/useLowMotionDevice";

const CountUpNumber = ({ value = 0, duration = 1200, suffix = "", prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const lowMotionDevice = useLowMotionDevice();
  const skipAnimation = lowMotionDevice || duration <= 0;

  useEffect(() => {
    const node = ref.current;
    if (!node || started || skipAnimation) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setStarted(true);
        observer.disconnect();
      },
      { threshold: 0.45 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [started, skipAnimation]);

  useEffect(() => {
    if (!started || skipAnimation) return undefined;

    let frameId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [duration, started, value, skipAnimation]);

  return (
    <span ref={ref}>
      {prefix}
      {(skipAnimation ? value : displayValue).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
};

export default memo(CountUpNumber);
