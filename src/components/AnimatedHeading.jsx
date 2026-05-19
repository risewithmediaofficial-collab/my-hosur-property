import { motion } from "framer-motion";
import useLowMotionDevice from "../hooks/useLowMotionDevice";

const charVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: custom * 0.02,
    },
  }),
};

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

export default function AnimatedHeading({
  text,
  className = "",
  as: Tag = "h1",
  delay = 0,
}) {
  const lowMotionDevice = useLowMotionDevice();
  const words = text.split(" ");

  if (lowMotionDevice) {
    return (
      <Tag className={`site-premium-heading ${className}`}>
        <span className="heading-static">{text}</span>
      </Tag>
    );
  }

  return (
    <Tag className={`site-premium-heading ${className}`}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={containerVariant}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.25em",
          rowGap: "0.08em",
          overflow: "visible",
          paddingBottom: "0.08em",
        }}
      >
        {words.map((word, wordIdx) => (
          <span
            key={wordIdx}
            className="heading-word"
            style={{ display: "inline-flex", gap: "0.05em", alignItems: "flex-end", paddingBottom: "0.06em" }}
          >
            {word.split("").map((char, charIdx) => (
              <motion.span
                key={`${wordIdx}-${charIdx}`}
                custom={delay + wordIdx * 5 + charIdx}
                variants={charVariant}
                className="heading-char"
                style={{ display: "inline-block", overflow: "visible", paddingBottom: "0.04em" }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
