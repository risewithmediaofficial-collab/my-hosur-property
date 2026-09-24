import { memo } from "react";
import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const PageHero = ({ tag, title, description, children, className = "" }) => (
  <motion.section
    initial="hidden"
    animate="show"
    variants={reveal}
    className={`marketing-hero px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14 ${className}`}
  >
    <div className="mx-auto max-w-[1440px]">
      {tag ? <p className="section-tag">{tag}</p> : null}
      {title ? <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1> : null}
      {description ? <p className="mt-4 max-w-3xl text-sm leading-7 sm:text-base">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  </motion.section>
);

export default memo(PageHero);
