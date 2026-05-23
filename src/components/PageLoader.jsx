import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

const rotate = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dashoffset: -125px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(10, 10, 20, 0.88) 0%, rgba(16, 42, 28, 0.92) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: all;

  animation: ${({ $exiting }) =>
    $exiting
      ? css`${fadeOut} 0.3s ease forwards`
      : css`${fadeIn} 0.2s ease forwards`};
`;

const Spinner = styled.svg`
  width: 3.25em;
  height: 3.25em;
  transform-origin: center;
  animation: ${rotate} 2s linear infinite;

  circle {
    fill: none;
    stroke: hsl(214, 97%, 59%);
    stroke-width: 2;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: ${dash} 1.5s ease-in-out infinite;
  }
`;

const Label = styled.p`
  margin-top: 18px;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-family: "Inter", "Outfit", sans-serif;
  font-weight: 500;
  text-align: center;
`;

const SHOW_DURATION = 600;
const FADE_DURATION = 300;

const PageLoader = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const prevPath = useRef(location.pathname);
  const timerRef = useRef(null);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    clearTimeout(timerRef.current);
    setExiting(false);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setExiting(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, FADE_DURATION);
    }, SHOW_DURATION);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <Overlay $exiting={exiting} aria-live="polite" aria-label="Loading page">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Spinner viewBox="25 25 50 50" role="status" aria-label="Loading">
          <circle r={20} cy={50} cx={50} />
        </Spinner>
        <Label>Loading...</Label>
      </div>
    </Overlay>
  );
};

export default PageLoader;
