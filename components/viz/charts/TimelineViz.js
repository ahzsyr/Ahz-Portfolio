import { motion } from "framer-motion";
import useMotionAllowed from "../../motion/useMotionAllowed";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function TimelineViz({ data = [] }) {
  const motionOk = useMotionAllowed();
  const { inView } = useVizMotion();

  return (
    <ol className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
      {data.map((item, i) => (
        <motion.li
          key={item.title + i}
          className="ml-6"
          initial={motionOk ? { opacity: 0, y: 6 } : false}
          animate={
            !motionOk || inView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 6 }
          }
          transition={{
            duration: 0.4,
            delay: motionOk && inView ? Math.min(i * 0.06, 0.3) : 0,
          }}
        >
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-[var(--viz-series-1,#2563eb)]" />
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {item.label || (item.date ? String(item.date).slice(0, 4) : "")}
          </p>
          <h4 className="font-semibold text-slate-900 mt-1">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
          )}
        </motion.li>
      ))}
    </ol>
  );
}
