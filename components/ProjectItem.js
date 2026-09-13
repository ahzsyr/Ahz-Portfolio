import Link from "next/link";

const ProjectItem = ({ project }) => {
  return (
    <>
      <Link
        href={`/projects/${project.slug || project.id}`}
        className="relative flex items-end justify-start w-full text-left bg-center bg-cover cursor-pointer h-96 group bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        style={{
          backgroundImage: "url(" + project.image + ")",
        }}
      >
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between mx-5 mt-3">
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
    </>
  );
};

export default ProjectItem;
