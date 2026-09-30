import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { getVizTheme } from "../../../lib/viz/theme";
import useChartAnimation from "../../motion/useChartAnimation";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function RadarChartViz({ data = [], config = {} }) {
  const theme = getVizTheme();
  const nameKey = config.nameKey || "name";
  const seriesKey = config.seriesKey || "value";
  const height = config.height || 320;
  const { inView } = useVizMotion();
  const { isAnimationActive, animationDuration } = useChartAnimation(inView);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke={theme.grid} />
          <PolarAngleAxis
            dataKey={nameKey}
            tick={{ fill: theme.muted, fontSize: 12 }}
          />
          <PolarRadiusAxis tick={{ fill: theme.muted, fontSize: 10 }} />
          <Radar
            dataKey={seriesKey}
            stroke={theme.series1}
            fill={theme.series1}
            fillOpacity={0.25}
            isAnimationActive={isAnimationActive}
            animationDuration={animationDuration}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
