/**
 * Shared layoutId for project cover morph (grid → detail).
 */
export function projectHeroLayoutId(project) {
  if (!project) return null;
  const id = project.id ?? project.slug;
  if (id == null || id === "") return null;
  return `project-hero-${id}`;
}
