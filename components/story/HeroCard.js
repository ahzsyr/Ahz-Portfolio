/**
 * Full-bleed project page hero — cover + title.
 */

import { motion } from "framer-motion";
import ProjectHeroMedia from "../motion/ProjectHeroMedia";
import useMotionAllowed from "../motion/useMotionAllowed";
import { projectHeroLayoutId } from "../../lib/motion";

export default function HeroCard({
  title,
  subtitle,
  tags = [],
  image,
  client,
  projectId = null,
  project = null,
}) {
  const motionOk = useMotionAllowed();
  const layoutId = projectHeroLayoutId(
    projectId != null ? { id: projectId } : project
  );

  if (!title && !image) return null;

  const content = (
    <>
      {tags.length > 0 && (
        <p className="text-sm text-gray-300 mb-2">{tags.join(" · ")}</p>
      )}
      {title && (
        <h1 className="font-display text-4xl font-semibold text-gray-100 leading-tight">
          {title}
        </h1>
      )}
      {(client || subtitle) && (
        <p className="text-gray-200 mt-2">
          {[client, subtitle].filter(Boolean).join(" · ")}
        </p>
      )}
    </>
  );

  return (
    <motion.section
      className="story-hero mb-10 md:mb-14"
      initial={motionOk ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <ProjectHeroMedia image={image} layoutId={layoutId}>
        {content}
      </ProjectHeroMedia>
    </motion.section>
  );
}
