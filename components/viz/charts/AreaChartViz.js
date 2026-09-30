import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getVizTheme } from "../../../lib/viz/theme";
import useChartAnimation from "../../motion/useChartAnimation";
import { useVizMotion } from "../../motion/VizMotionContext";

export default function AreaChartViz({ data = [], config = {} }) {
  const theme = getVizTheme();
  const seriesKey = config.seriesKey || "valueNumeric";
  const xKey = config.xKey || "label";
  const height = config.height || 280;
  const formatter = config.valueFormatter || ((v) => String(v));
  const { inView } = useVizMotion();
  const { isAnimationActive, animationDuration } = useChartAnimation(inView);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: theme.muted, fontSize: 12 }}
            axisLine={{ stroke: theme.grid }}
          />
          <YAxis
            tick={{ fill: theme.muted, fontSize: 12 }}
            axisLine={{ stroke: theme.grid }}
            tickFormatter={formatter}
            width={64}
          />
          <Tooltip
            formatter={(value) => [formatter(value), config.title || "Value"]}
            contentStyle={{
              background: theme.surface,
              borderColor: theme.grid,
              color: theme.fg,
            }}
          />
          <Area
            type="monotone"
            dataKey={seriesKey}
            stroke={theme.series1}
            fill={theme.series1}
            fillOpacity={0.18}
            strokeWidth={2}
            isAnimationActive={isAnimationActive}
            animationDuration={animationDuration}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
