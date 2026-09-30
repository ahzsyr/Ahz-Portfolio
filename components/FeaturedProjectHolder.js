import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { projectHeroLayoutId } from "../lib/motion";
import useMotionAllowed from "./motion/useMotionAllowed";

export const FeaturedProjectHolder = ({ project, styles, large, margined }) => {
  const motionOk = useMotionAllowed();
  const layoutId = projectHeroLayoutId(project);

  const st = styles
    ? `${styles} bg-blue-500 overflow-hidden group relative `
    : "bg-blue-500 overflow-hidden group relative ";

  const margin = margined ? "mt-8" : "";

  const holderHeight = large
    ? "w-full h-64 md:h-[38rem] relative bg-no-repeat bg-cover"
    : "w-full h-64 relative bg-no-repeat bg-cover";

  return (
    <div className={st + " " + margin}>
      <div className="absolute z-50 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out from-black/80 to-transparent bg-gradient-to-t inset-x-0 -bottom-2 pt-30 text-white flex items-end">
        <div
          className={
            large
              ? "md:p-5 absolute bottom-0 left-0 p-6 text-black group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 pb-10 transform transition duration-300 ease-in-out"
              : "absolute bottom-0 left-0 p-6 text-black group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 pb-10 transform transition duration-300 ease-in-out"
          }
        >
          <h2 className="text-xl font-semibold text-white">{project.title}</h2>
          <p className="text-base leading-4 text-white mt-2">
            {project.category}
          </p>
          <Link
            href={`/projects/${project.slug || project.id}`}
            className="focus:outline-none focus:underline flex items-center mt-4 cursor-pointer text-white hover:text-gray-200 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <p className="pr-2 text-sm font-medium leading-none ">
              Project Details
            </p>
            <svg
              className="fill-stroke"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.75 12.5L10.25 8L5.75 3.5"
                stroke="currentColor"
                strokeWidth={"2"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
      <motion.div
        className={holderHeight}
        layoutId={motionOk ? layoutId : undefined}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={project.image}
          className={
            large
              ? "hidden sm:block h-full object-cover group-hover:transform group-hover:scale-150 transition-all ease-in-out duration-700 aspect-square"
              : "object-cover h-full group-hover:transform group-hover:scale-150 transition-all ease-in-out duration-700 aspect-square"
          }
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
        />

        <div className="absolute top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden opacity-0 transition duration-300 ease-in-out bg-gradient-to-t from-gray-600 via-blue-500 to-blue-800 group-hover:opacity-70" />
      </motion.div>
    </div>
  );
};
