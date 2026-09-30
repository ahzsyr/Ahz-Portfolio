import { useReducedMotion } from "framer-motion";

/** True when decorative / progressive motion may run. */
export default function useMotionAllowed() {
  const reduce = useReducedMotion();
  return reduce !== true;
}
