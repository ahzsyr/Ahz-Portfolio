import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getVizTheme } from "../../../lib/viz/theme";
import useChartAnimation from "../../motion/useChartAnimation";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function HorizontalBarViz({ data = [], config = {} }) {
  const theme = getVizTheme();
  const seriesKey = config.seriesKey || "value";
  const xKey = config.xKey || "name";
  const height = config.height || Math.max(200, data.length * 28);
  const { inView } = useVizMotion();
  const { isAnimationActive, animationDuration } = useChartAnimation(inView);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey={xKey}
            width={100}
            tick={{ fill: theme.muted, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: theme.surface,
              borderColor: theme.grid,
              color: theme.fg,
            }}
          />
          <Bar
            dataKey={seriesKey}
            fill={theme.series1}
            radius={[0, 4, 4, 0]}
            isAnimationActive={isAnimationActive}
            animationDuration={animationDuration}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
