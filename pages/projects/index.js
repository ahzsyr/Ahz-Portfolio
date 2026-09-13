import { useEffect, useState } from "react";
import CategoryChip from "../../components/CategoryChip";
import PageNameSection from "../../components/PageNameSection";
import ProjectList from "../../components/ProjectList";
import Container from "../../components/Container";

const CATEGORY_CHIPS = [
  "Packages",
  "Business Cards",
  "Logo",
  "Banner",
  "Kelk",
  "Advertising",
];

export default function Projects({ projects = [], settings }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [renderProjects, setRenderProjects] = useState(projects);
  const [isAllCategories, setIsAllCategories] = useState(true);

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setRenderProjects(projects);
      setIsAllCategories(true);
      return;
    }

    setRenderProjects(
      projects.filter((project) =>
        selectedCategories.includes(project.category)
      )
    );
    setIsAllCategories(false);
  }, [selectedCategories, projects]);

  return (
    <Container settings={settings} className="mx-auto px-4 my-auto py-4">
      <div className="mt-10">
        <PageNameSection title={"Discover my work"} />
        <div>
          <div className="flex flex-wrap justify-center gap-2 mx-auto my-6 mt-4">
            <CategoryChip
              onClick={() => {
                setSelectedCategories([]);
                setIsAllCategories(true);
              }}
              category="All Projects"
              key="All Projects"
              allActive={isAllCategories}
            >
              All Projects
            </CategoryChip>
            {CATEGORY_CHIPS.map((cat) => (
              <CategoryChip
                key={cat}
                category={cat}
                onClick={() => {
                  if (!selectedCategories.includes(cat)) {
                    setSelectedCategories((prev) => [...prev, cat]);
                  } else {
                    setSelectedCategories((prev) =>
                      prev.filter((e) => e !== cat)
                    );
                  }
                }}
                active={selectedCategories.includes(cat)}
              >
                {cat}
              </CategoryChip>
            ))}
          </div>
          <ProjectList projects={renderProjects} />
        </div>
      </div>
    </Container>
  );
}

export async function getServerSideProps() {
  const { getPublishedProjects, getSiteSettings } = await import(
    "../../lib/content"
  );
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);
  return { props: { projects, settings } };
}
