import { FeaturedProjectHolder } from "./FeaturedProjectHolder";

/**
 * Featured work grid. Pass `limit` to cap (homepage uses 3).
 * `id` defaults to "work" for homepage anchors; use "featured" if needed.
 */
const FeaturedProjects = ({
  projects = [],
  limit = 6,
  id = "work",
  title = "Featured Work",
  subtitle = "Selected projects — not the full archive.",
}) => {
  const featured = [...projects]
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
    .slice(0, limit);

  const [a, b, c, d, e, f] = featured;

  if (!featured.length) {
    return null;
  }

  const useCompactGrid = limit <= 3;

  return (
    <div id={id} className="home-section py-14 md:py-16">
      <div role="main" className="flex flex-col items-center justify-center">
        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-9 text-center text-[var(--color-ink)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base leading-normal text-center text-[var(--color-muted)] mt-4 lg:w-1/2 md:w-10/12 w-11/12">
            {subtitle}
          </p>
        )}
      </div>

      {useCompactGrid ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:mt-12 mt-8">
          {featured.map((project) => (
            <FeaturedProjectHolder
              key={project.id}
              project={project}
              styles="relative w-full"
            />
          ))}
        </div>
      ) : (
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
              <div className="relative mt-4 lg:mt-6">
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
      )}
    </div>
  );
};

export default FeaturedProjects;
