/**
 * Shared visualization UX: loading / empty / error, a11y summary, table fallback.
 * Owns in-view signal for chart / KPI motion via VizMotionProvider.
 * Heavy charts mount only after inView.
 */

import { useRef } from "react";
import { resolveVizShellStatus } from "../../lib/viz/shellStatus";
import useInViewOnce from "../motion/useInViewOnce";
import { VizMotionProvider } from "../motion/VizMotionContext";
import { isHeavyChartType } from "./registry";
import ChartErrorBoundary from "./ChartErrorBoundary";

export default function VizShell({
  title,
  subtitle,
  config = {},
  status = "ready",
  chartType = null,
  children,
}) {
  const {
    ariaLabel,
    textSummary,
    tableFallback = false,
    tableOpen = false,
    error,
    columns = [],
  } = config;

  const data = config._tableData || [];
  const resolvedStatus = resolveVizShellStatus(config, status);
  const ref = useRef(null);
  const inView = useInViewOnce(ref, { amount: 0.3 });
  const heavy = isHeavyChartType(chartType);
  const mountChart =
    resolvedStatus === "ready" && (!heavy || inView);

  return (
    <VizMotionProvider inView={inView}>
      <figure
        ref={ref}
        className="viz-shell rounded-lg border border-slate-200 bg-white p-4 md:p-5"
        role="figure"
        aria-label={ariaLabel || title || "Visualization"}
      >
        {(title || config.title) && (
          <figcaption className="mb-3">
            <h3 className="font-display text-lg font-semibold text-[var(--viz-fg,#0f172a)]">
              {title || config.title}
            </h3>
            {(subtitle || config.subtitle) && (
              <p className="text-sm text-[var(--viz-muted,#64748b)] mt-0.5">
                {subtitle || config.subtitle}
              </p>
            )}
          </figcaption>
        )}

        {resolvedStatus === "loading" && (
          <div
            className="h-40 rounded bg-slate-100 animate-pulse"
            aria-busy="true"
            aria-label="Loading visualization"
          />
        )}

        {resolvedStatus === "empty" && (
          <p className="text-sm text-slate-500 py-8 text-center">
            No data for this visualization yet.
          </p>
        )}

        {resolvedStatus === "error" && (
          <p className="text-sm text-red-700 py-8 text-center" role="alert">
            {error || "Unable to render this visualization."}
          </p>
        )}

        {resolvedStatus === "ready" && !mountChart && (
          <div
            className="h-40 rounded bg-slate-100 animate-pulse"
            aria-busy="true"
            aria-label="Loading visualization"
          />
        )}

        {mountChart && (
          <ChartErrorBoundary>{children}</ChartErrorBoundary>
        )}

        {textSummary && (
          <p className="viz-summary mt-3 text-sm text-[var(--viz-muted,#64748b)] leading-relaxed">
            {textSummary}
          </p>
        )}

        {resolvedStatus === "ready" &&
          tableFallback &&
          Array.isArray(data) &&
          data.length > 0 && (
            <details
              className="viz-table-details mt-3"
              open={tableOpen || undefined}
            >
              <summary className="viz-table-summary text-sm font-medium text-slate-700 cursor-pointer select-none">
                View data table
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm text-left border-t border-slate-100 pt-2">
                  <caption className="sr-only">
                    {textSummary || "Data table for chart"}
                  </caption>
                  <thead>
                    <tr className="text-slate-500">
                      {(columns.length
                        ? columns
                        : Object.keys(data[0] || {})
                            .filter((k) => !k.startsWith("_"))
                            .slice(0, 3)
                            .map((k) => ({ key: k, label: k }))
                      ).map((col) => (
                        <th key={col.key} className="py-2 pr-3 font-medium">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr
                        key={row.id ?? row.label ?? i}
                        className="border-t border-slate-50"
                      >
                        {(columns.length
                          ? columns
                          : Object.keys(row)
                              .filter((k) => !k.startsWith("_"))
                              .slice(0, 3)
                              .map((k) => ({ key: k, label: k }))
                        ).map((col) => (
                          <td
                            key={col.key}
                            className="py-1.5 pr-3 text-slate-700"
                          >
                            {String(row[col.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
      </figure>
    </VizMotionProvider>
  );
}
