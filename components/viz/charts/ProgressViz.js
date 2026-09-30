import useMotionAllowed from "../../motion/useMotionAllowed";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function ProgressViz({ config = {} }) {
  const percent = config.percent ?? 0;
  const motionOk = useMotionAllowed();
  const { inView } = useVizMotion();
  const width = motionOk && !inView ? 0 : percent;
  const transition =
    motionOk && inView
      ? "width 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
      : undefined;

  return (
    <div className="py-2">
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>{config.currentDisplay}</span>
        <span>Target {config.targetDisplay}</span>
      </div>
      <div
        className="h-3 rounded-full bg-slate-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--viz-series-1,#2563eb)]"
          style={{
            width: `${width}%`,
            transition,
          }}
        />
      </div>
      <p className="mt-2 text-sm font-medium text-slate-800">{percent}%</p>
    </div>
  );
}
