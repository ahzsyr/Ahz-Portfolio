import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { getVizTheme } from "../../../lib/viz/theme";
import useChartAnimation from "../../motion/useChartAnimation";
import { useVizMotion } from "../../motion/VizMotionContext";

const PALETTE = [
  "var(--viz-series-1, #2563eb)",
  "var(--viz-series-2, #1e3a8a)",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#64748b",
];

export default function DonutChartViz({ data = [], config = {} }) {
  const theme = getVizTheme();
  const nameKey = config.nameKey || "name";
  const seriesKey = config.seriesKey || "value";
  const height = config.height || 280;
  const { inView } = useVizMotion();
  const { isAnimationActive, animationDuration } = useChartAnimation(inView);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey={seriesKey}
            nameKey={nameKey}
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive={isAnimationActive}
            animationDuration={animationDuration}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: theme.surface,
              borderColor: theme.grid,
              color: theme.fg,
            }}
          />
          {config.showLegend !== false && (
            <Legend wrapperStyle={{ fontSize: 12, color: theme.muted }} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
