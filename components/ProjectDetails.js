import ProjectCaseStudy from "./case-study/ProjectCaseStudy";
import StoryRenderer from "./story/StoryRenderer";
import { shouldRenderProjectStory } from "../lib/story";
import {
  getPresentationTheme,
  normalizePresentationMode,
} from "../lib/presentation";

/**
 * Project detail — published Story blocks replace the fixed case study.
 * presentationMode only changes chrome / emphasis, not underlying data.
 */
const ProjectDetails = ({ project, relatedExperience = [] }) => {
  const mode = normalizePresentationMode(project?.presentationMode);
  const theme = getPresentationTheme(mode);

  if (shouldRenderProjectStory(project)) {
    return (
      <div className="py-0">
        <article
          className={`case-study story-case ${theme.className}`}
          data-presentation={mode}
        >
          <StoryRenderer
            story={project.story}
            project={project}
            presentationMode={mode}
            warn
          />
        </article>
      </div>
    );
  }

  return (
    <div className="py-0">
      <div className={theme.className} data-presentation={mode}>
        <ProjectCaseStudy
          project={project}
          relatedExperience={relatedExperience}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
