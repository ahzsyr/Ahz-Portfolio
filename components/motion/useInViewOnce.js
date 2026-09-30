import { useInView } from "framer-motion";

/**
 * Fire once when the element enters the viewport.
 * @param {React.RefObject} ref
 * @param {{ amount?: number|string, margin?: string }} [options]
 */
export default function useInViewOnce(ref, options = {}) {
  const { amount = 0.25, margin = "0px 0px -8% 0px" } = options;
  return useInView(ref, { once: true, amount, margin });
}
