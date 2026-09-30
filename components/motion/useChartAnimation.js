import useMotionAllowed from "./useMotionAllowed";

const DEFAULT_DURATION = 700;

/**
 * Recharts animation flags gated by in-view + reduced motion.
 * @param {boolean} inView
 * @param {{ duration?: number }} [options]
 */
export default function useChartAnimation(inView, options = {}) {
  const motionOk = useMotionAllowed();
  const duration = options.duration ?? DEFAULT_DURATION;
  const active = Boolean(motionOk && inView);

  return {
    isAnimationActive: active,
    animationDuration: active ? duration : 0,
  };
}
