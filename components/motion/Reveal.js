import { motion } from "framer-motion";
import useMotionAllowed from "./useMotionAllowed";

const DEFAULT_TRANSITION = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };

/**
 * Scroll-triggered opacity/y reveal. Static markup when reduced motion.
 */
export function Reveal({
  as = "div",
  children,
  className = "",
  amount = 0.2,
  y = 12,
  delay = 0,
  ...rest
}) {
  const motionOk = useMotionAllowed();
  const Component = motion[as] || motion.div;

  if (!motionOk) {
    const Tag = as === "section" ? "section" : as === "li" ? "li" : "div";
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      transition={{ ...DEFAULT_TRANSITION, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default function RevealSection({
  children,
  className = "",
  amount = 0.2,
  y = 10,
  ...rest
}) {
  return (
    <Reveal as="section" className={className} amount={amount} y={y} {...rest}>
      {children}
    </Reveal>
  );
}
