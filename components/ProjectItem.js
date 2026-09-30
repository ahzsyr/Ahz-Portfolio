import Link from "next/link";
import { motion } from "framer-motion";
import ResponsiveImage from "./ResponsiveImage";
import { projectHeroLayoutId } from "../lib/motion";
import useMotionAllowed from "./motion/useMotionAllowed";

const ProjectItem = ({ project }) => {
  const motionOk = useMotionAllowed();
  const layoutId = projectHeroLayoutId(project);

  return (
    <Link
      href={`/projects/${project.slug || project.id}`}
      className="relative flex items-end justify-start w-full text-left cursor-pointer h-96 group bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 overflow-hidden"
    >
      <motion.div
        layoutId={motionOk ? layoutId : undefined}
        className="absolute inset-0"
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        {project.image ? (
          <ResponsiveImage
            src={project.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : null}
      </motion.div>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between mx-5 mt-3 z-10">
        <p className="px-3 py-2 text-xs font-semibold tracking-wider uppercase text-gray-100 bg-blue-500">
          {project.category}
        </p>
        <div className="flex flex-col justify-start text-center text-white">
          <span className="text-sm font-semibold leading-none tracking-wide">
            {project.title}
          </span>
        </div>
      </div>

      <h2 className="z-10 p-5 font-medium text-md group-hover:underline text-white bg-black/40 my-2 mx-2">
        Project Details
      </h2>
    </Link>
  );
};

export default ProjectItem;
