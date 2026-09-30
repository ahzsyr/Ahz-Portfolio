/**
 * Project cover: careful parallax + optional shared-element layoutId.
 * Title/CTA stay on a non-parallax layer (passed as children).
 */

import { motion } from "framer-motion";
import { ParallaxBanner } from "react-scroll-parallax";
import useMotionAllowed from "./useMotionAllowed";

export default function ProjectHeroMedia({
  image,
  layoutId = null,
  className = "",
  height = "24em",
  children,
}) {
  const motionOk = useMotionAllowed();

  const shellClass =
    `w-full max-w-screen-md mx-auto relative overflow-hidden ${className}`.trim();

  let media;
  if (!image) {
    media = <div className="absolute inset-0 bg-slate-800" />;
  } else if (motionOk) {
    media = (
      <ParallaxBanner
        layers={[{ image, speed: -12 }]}
        className="absolute inset-0 h-full w-full"
        style={{ height: "100%" }}
      />
    );
  } else {
    media = (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
    );
  }

  const mediaLayer =
    layoutId && motionOk ? (
      <motion.div
        layoutId={layoutId}
        className="absolute inset-0"
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {media}
      </motion.div>
    ) : (
      media
    );

  return (
    <div className={shellClass} style={{ height }}>
      {mediaLayer}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(180deg,transparent,rgba(0,0,0,.7))",
        }}
        aria-hidden="true"
      />
      <div className="p-4 absolute bottom-0 left-0 z-20 max-w-full">
        {children}
      </div>
    </div>
  );
}
