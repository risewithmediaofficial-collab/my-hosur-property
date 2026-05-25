import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const tones = {
  white: "bg-white",
  surface: "bg-surface",
  navy: "bg-navy text-white",
};

const PageSection = ({
  tag,
  title,
  description,
  children,
  tone = "white",
  className = "",
  innerClassName = "",
  id,
}) => (
  <motion.section
    id={id}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.12 }}
    variants={reveal}
    className={`px-5 py-12 sm:px-8 sm:py-14 lg:px-10 ${tones[tone] || tones.white} ${className}`}
  >
    <div className={`mx-auto max-w-[1440px] ${innerClassName}`}>
      {(tag || title || description) && (
        <div className={`mb-8 ${tone === "navy" ? "text-center lg:text-left" : "text-center"}`}>
          {tag ? <p className={`section-tag ${tone === "navy" ? "!text-orange" : ""}`}>{tag}</p> : null}
          {title ? (
            <h2 className={`mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl ${tone === "navy" ? "text-white" : "text-navy"}`}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className={`mx-auto mt-3 max-w-2xl text-sm leading-7 sm:text-base ${tone === "navy" ? "text-white" : "text-slate-600"}`}>
              {description}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  </motion.section>
);

export default PageSection;
