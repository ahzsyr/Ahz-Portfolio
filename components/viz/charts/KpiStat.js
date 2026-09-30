/**
 * KPI statistic card — rendering only, with optional in-view count-up.
 */

import { formatMetricValue } from "../../../lib/metrics/format";
import useCountUp from "../../motion/useCountUp";
import useMotionAllowed from "../../motion/useMotionAllowed";
import { useVizMotion } from "../../motion/VizMotionContext";

function resolveCountTarget(data, config) {
  const candidates = [
    data?.valueNumeric,
    data?.formatted?.valueNumeric,
    config?.valueNumeric,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export default function KpiStat({ data, config = {} }) {
  const motionOk = useMotionAllowed();
  const { inView } = useVizMotion();
  const finalDisplay =
    config.display || data?.formatted?.display || data?.value || "—";
  const target = resolveCountTarget(data, config);
  const canCount =
    motionOk && target != null && Number.isFinite(target);

  const { current, done } = useCountUp({
    to: target ?? 0,
    from: 0,
    duration: 700,
    enabled: canCount && inView,
  });

  let display = finalDisplay;
  if (canCount && inView && !done) {
    const metricLike = {
      ...(data || {}),
      type: data?.type || config.type || "number",
      prefix: data?.prefix ?? config.prefix,
      suffix: data?.suffix ?? config.suffix,
      unit: data?.unit ?? config.unit,
      decimals: data?.decimals ?? config.decimals,
      compact: data?.compact ?? config.compact,
      percentScale: data?.percentScale ?? config.percentScale,
      ratingMax: data?.ratingMax ?? config.ratingMax,
    };
    display = formatMetricValue(metricLike, {
      valueNumeric: current,
      forceNumericFormat: true,
      preferDisplayString: false,
    }).display;
  } else if (canCount && done) {
    display = finalDisplay;
  }

  const tone = config.tone || "neutral";
  const change = config.changePercent;
  const direction = config.changeDirection;

  const toneClass =
    tone === "positive"
      ? "text-[var(--viz-positive,#15803d)]"
      : tone === "negative"
        ? "text-[var(--viz-negative,#b91c1c)]"
        : "text-slate-600";

  const arrow =
    direction === "up" ? "↑" : direction === "down" ? "↓" : direction === "flat" ? "→" : "";

  return (
    <div className="py-2">
      <p
        className="font-display text-3xl md:text-4xl font-semibold text-[var(--viz-fg,#0f172a)] tracking-tight"
        aria-label={finalDisplay}
      >
        <span aria-hidden={canCount && inView && !done ? "true" : undefined}>
          {display}
        </span>
      </p>
      {change != null && direction && (
        <p className={`mt-2 text-sm font-medium ${toneClass}`}>
          <span aria-hidden="true">
            {arrow} {Math.abs(change)}%
          </span>
          <span className="sr-only">
            {tone === "positive"
              ? "Favorable change"
              : tone === "negative"
                ? "Unfavorable change"
                : "Neutral change"}
            : {direction} {Math.abs(change)} percent
          </span>
          <span className="text-slate-400 font-normal"> vs previous</span>
        </p>
      )}
    </div>
  );
}
