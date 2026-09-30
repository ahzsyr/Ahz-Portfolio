/**
 * Renders composed story card descriptors in order.
 * Descriptors come from lib/story/composeBlocks — no fetching here.
 */

import { composeBlocks } from "../../lib/story";
import {
  getPresentationTheme,
  normalizePresentationMode,
} from "../../lib/presentation";
import MetricCard from "./MetricCard";
import ChartCard from "./ChartCard";
import ComparisonCard from "./ComparisonCard";
import ProgressCard from "./ProgressCard";
import StatGrid from "./StatGrid";
import TimelineCard from "./TimelineCard";
import AchievementCard from "./AchievementCard";
import QuoteCard from "./QuoteCard";
import MediaCard from "./MediaCard";
import ProseBlock from "./ProseBlock";
import HeroCard from "./HeroCard";
import GalleryCard from "./GalleryCard";
import VideoCard from "./VideoCard";
import ToolsListCard from "./ToolsListCard";
import CtaCard from "./CtaCard";

const CARD_MAP = {
  hero: HeroCard,
  metricCard: MetricCard,
  chartCard: ChartCard,
  comparisonCard: ComparisonCard,
  progressCard: ProgressCard,
  statGrid: StatGrid,
  timelineCard: TimelineCard,
  achievementCard: AchievementCard,
  quoteCard: QuoteCard,
  mediaCard: MediaCard,
  gallery: GalleryCard,
  video: VideoCard,
  toolsList: ToolsListCard,
  cta: CtaCard,
  prose: ProseBlock,
};

export default function StoryRenderer({
  story,
  project = null,
  presentationMode,
  milestones = [],
  achievementsById,
  metricsById,
  warn = false,
  className = "",
}) {
  if (!story?.blocks?.length) return null;

  const mode = normalizePresentationMode(
    presentationMode || project?.presentationMode
  );
  const theme = getPresentationTheme(mode);

  const composed = composeBlocks(
    story.blocks,
    {
      milestones,
      achievementsById,
      metricsById,
      project,
      presentationMode: mode,
    },
    { warn }
  );

  if (!composed.length) return null;

  return (
    <div
      className={`${theme.streamClassName} ${className}`.trim()}
      data-presentation={mode}
    >
      {composed.map(({ key, cardType, props }) => {
        const Card = CARD_MAP[cardType];
        if (!Card) return null;
        return <Card key={key} {...props} />;
      })}
    </div>
  );
}
