/**
 * Dynamic MetricChart entry for public pages — defers loading the viz module.
 */

import dynamic from "next/dynamic";

const MetricChartLazy = dynamic(() => import("./MetricChart"), {
  ssr: true,
  loading: () => (
    <div
      className="h-40 rounded bg-slate-100 animate-pulse"
      aria-busy="true"
      aria-label="Loading visualization"
    />
  ),
});

export default MetricChartLazy;
