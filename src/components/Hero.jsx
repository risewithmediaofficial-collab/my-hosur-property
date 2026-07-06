import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import backgroundLines from "../assets/background-lines.svg";
import houseImage from "../assets/house.png";

const Hero = () => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // References for mouse interpolation (lerp)
  const animRef = useRef(null);
  const currentPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });

  // 1. Framer Motion Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Calculate different scroll speeds for depth
  const textScrollY = useTransform(scrollYProgress, [0, 1], ["0px", "-60px"]);
  const visualScrollY = useTransform(scrollYProgress, [0, 1], ["0px", "40px"]);
  const bgScrollY = useTransform(scrollYProgress, [0, 1], ["0px", "-20px"]);
  const houseScrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  // 2. Mouse move events
  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    targetPos.current = { x, y };
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    targetPos.current = { x: 0, y: 0 };
  };

  // 3. requestAnimationFrame loop for smooth LERP mouse parallax
  useEffect(() => {
    const updateParallax = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.07;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.07;

      setMousePos({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });

      animRef.current = requestAnimationFrame(updateParallax);
    };

    animRef.current = requestAnimationFrame(updateParallax);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  // 4. Parallax offsets based on interpolated mouse position
  const houseMouseTranslate = {
    x: mousePos.x * 24,
    y: mousePos.y * 24,
  };

  const circleMouseTranslate = {
    x: mousePos.x * 12,
    y: mousePos.y * 12,
  };

  const bgMouseTranslate = {
    x: mousePos.x * -8,
    y: mousePos.y * -8,
  };

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center px-5 py-20 box-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Line Art Layer */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[2]">
        <motion.div
          className="h-full"
          style={{
            x: bgMouseTranslate.x,
            y: bgScrollY,
            width: "calc(100% + 300px)",
            willChange: "transform",
          }}
        >
          <motion.div
            className="h-full w-full bg-repeat-x bg-left-bottom bg-cover"
            style={{
              backgroundImage: `url(${backgroundLines})`,
              opacity: 0.15,
            }}
            animate={{ x: [0, -300] }}
            transition={{ x: { repeat: Infinity, duration: 80, ease: "linear" } }}
          />
        </motion.div>
      </div>

      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0, 66, 162, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 66, 162, 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Main Grid Content */}
      <div className="relative w-full max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 z-[5]">
        
        {/* Left Column: Heading & Text Card */}
        <motion.div 
          className="flex flex-col items-center lg:items-start text-center lg:text-left will-change-transform" 
          style={{ y: textScrollY }}
        >
          {/* Tag */}
          <motion.p
            className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#FF9914] mb-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            Premium Showcase
          </motion.p>

          {/* Luxury Real Estate Heading */}
          <motion.h1
            className="font-philosopher text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight text-[#274F9A] mb-6 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            Experience Space,<br />Redefined.
          </motion.h1>

          {/* Premium Blue Rounded Rectangle Card */}
          <motion.div
            className="bg-[#274F9A] text-white rounded-2xl p-8 max-w-[520px] shadow-[0_20px_40px_rgba(39,79,154,0.15)] flex flex-col gap-4 text-left will-change-transform"
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-white m-0">Luxury Architectural Villa</h2>
            <p className="text-sm leading-relaxed text-white/85 m-0">
              Designed with bespoke glass facades, seamless indoor-outdoor layout, and signature landscaping inside Hosur's high-potential development zone. Built by Gyes Construction.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Column: Blue Circle & Villa Image */}
        <motion.div 
          className="relative flex items-center justify-center h-[380px] sm:h-[520px] w-full will-change-transform" 
          style={{ y: visualScrollY }}
        >
          {/* Blue Circle Behind House */}
          <motion.div
            className="absolute w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full z-[1] will-change-transform"
            style={{
              background: "radial-gradient(circle, rgba(39, 79, 154, 0.15) 0%, rgba(39, 79, 154, 0.03) 70%, transparent 100%)",
              x: circleMouseTranslate.x,
              y: circleMouseTranslate.y,
            }}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              y: [-8, 8, -8],
            }}
            transition={{
              scale: { type: "spring", stiffness: 60, damping: 15, delay: 0.8 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.3 },
            }}
          />

          {/* House Villa Image */}
          <motion.div
            className="relative z-[3] w-full max-w-[500px] flex justify-center items-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl p-4 will-change-transform"
            style={{
              x: houseMouseTranslate.x,
              y: houseMouseTranslate.y,
              scale: houseScrollScale,
            }}
            initial={{ opacity: 0, scale: 0.8, x: 120 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 14, delay: 1.0 }}
          >
            <img
              src={houseImage}
              alt="Bespoke luxury villa rendering"
              className="w-full h-auto object-cover rounded-2xl select-none pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </motion.div>

      </div>
    </motion.section>
  );
};

export default Hero;
