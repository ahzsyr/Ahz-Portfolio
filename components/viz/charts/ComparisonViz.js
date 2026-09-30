import { motion } from "framer-motion";
import useMotionAllowed from "../../motion/useMotionAllowed";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function ComparisonViz({ config = {} }) {
  const motionOk = useMotionAllowed();
  const { inView } = useVizMotion();
  const show = !motionOk || inView;

  return (
    <motion.div
      className="grid grid-cols-2 gap-6 py-2"
      initial={motionOk ? { opacity: 0 } : false}
      animate={show ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {config.beforeLabel || "Before"}
        </p>
        <p className="font-display text-2xl font-semibold mt-1 text-slate-800">
          {config.before}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {config.afterLabel || "After"}
        </p>
        <p className="font-display text-2xl font-semibold mt-1 text-[var(--viz-series-1,#2563eb)]">
          {config.after}
        </p>
      </div>
    </motion.div>
  );
}
