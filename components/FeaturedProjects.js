import { FeaturedProjectHolder } from "./FeaturedProjectHolder";

const FeaturedProjects = ({ projects = [] }) => {
  const featured = [...projects]
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  const [a, b, c, d, e, f] = featured;

  if (!featured.length) {
    return null;
  }

  return (
    <div id="featured">
      <div role="main" className="flex flex-col items-center justify-center">
        <h1 className="font-display text-4xl font-semibold leading-9 text-center text-[var(--color-ink)] underline-offset-8 underline">
          Featured Projects
        </h1>
        <p className="text-base leading-normal text-center text-[var(--color-muted)] mt-4 lg:w-1/2 md:w-10/12 w-11/12">
          Projects delivered to happy clients.
        </p>
      </div>
      <div className="lg:flex items-stretch md:mt-12 mt-8">
        <div className="lg:w-1/2 flex flex-col">
          <div className="sm:flex items-stretch justify-between xl:gap-x-8 gap-x-6 ">
            {a && (
              <FeaturedProjectHolder
                project={a}
                styles={"sm:w-1/2 relative"}
              />
            )}
            {b && (
              <FeaturedProjectHolder
                project={b}
                styles={"sm:mt-0 mt-4 sm:w-1/2 relative"}
              />
            )}
          </div>
          {c && (
            <div className="relative hidden lg:block md:block">
              <FeaturedProjectHolder
                project={c}
                styles={"relative"}
                large
                margined
              />
            </div>
          )}
        </div>
        <div className="lg:w-1/2 xl:ml-8 lg:ml-4 lg:mt-0 md:mt-6 mt-4 lg:flex flex-col justify-between">
          {d && (
            <div className="relative hidden lg:block md:block">
              <FeaturedProjectHolder project={d} styles={"relative"} large />
            </div>
          )}
          <div className="sm:flex items-stretch justify-between xl:gap-x-8 gap-x-6 md:mt-6 mt-4">
            {e && (
              <FeaturedProjectHolder project={e} styles={"relative w-full"} />
            )}
            {f && (
              <FeaturedProjectHolder
                project={f}
                styles={"relative w-full sm:mt-0 mt-4"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjects;
