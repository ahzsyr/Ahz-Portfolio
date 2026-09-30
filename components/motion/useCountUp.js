import { useEffect, useState } from "react";
import { clamp01, interpolateCount } from "../../lib/motion/ease";

/**
 * Animate a number from `from` to `to` when `enabled`.
 * @returns {{ current: number, done: boolean }}
 */
export default function useCountUp({
  to,
  from = 0,
  duration = 700,
  enabled = true,
}) {
  const target = Number(to);
  const start = Number(from);
  const canRun =
    enabled && Number.isFinite(target) && Number.isFinite(start);

  const [current, setCurrent] = useState(canRun && enabled ? start : target);
  const [done, setDone] = useState(!canRun || !enabled);

  useEffect(() => {
    if (!canRun) {
      setCurrent(Number.isFinite(target) ? target : 0);
      setDone(true);
      return undefined;
    }

    if (!enabled) {
      setCurrent(target);
      setDone(true);
      return undefined;
    }

    let raf = 0;
    const t0 = performance.now();
    setCurrent(start);
    setDone(false);

    const tick = (now) => {
      const progress = clamp01((now - t0) / duration);
      const { value, done: finished } = interpolateCount(progress, start, target);
      setCurrent(value);
      if (finished) {
        setCurrent(target);
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canRun, enabled, target, start, duration]);

  return { current: Number.isFinite(current) ? current : 0, done };
}
