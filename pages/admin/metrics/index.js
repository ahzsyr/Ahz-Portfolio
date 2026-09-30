import { useState } from "react";
import AdminLayout from "../../../components/admin/AdminLayout";
import PageHeader from "../../../components/admin/PageHeader";
import Modal from "../../../components/admin/Modal";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import ImportWizard, {
  downloadExport,
} from "../../../components/admin/ImportWizard";
import { getAdminSession } from "../../../lib/admin";
import { prisma } from "../../../lib/prisma";
import { getSiteSettings } from "../../../lib/content";
import {
  METRIC_TYPES,
  PERIODS,
  TREND_PREFERENCES,
  PERCENT_SCALES,
  buildMetricDomain,
} from "../../../lib/metrics";
import MetricChart from "../../../components/viz/MetricChart";
import { selectMetricVisualization } from "../../../lib/viz";

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const blankGroup = {
  name: "",
  description: "",
  sortOrder: 0,
  visibility: "public",
};

const blankMetric = {
  name: "",
  label: "",
  value: "",
  valueNumeric: "",
  unit: "",
  type: "count",
  prefix: "",
  suffix: "",
  startValue: "",
  endValue: "",
  date: "",
  category: "",
  visibility: "public",
  featured: false,
  sortOrder: 0,
  metricGroupId: "",
  projectId: "",
  experienceId: "",
  achievementId: "",
  period: "",
  trendPreference: "neutral",
  previousNumeric: "",
  targetNumeric: "",
  baselineNumeric: "",
  decimals: "",
  compact: false,
  percentScale: "auto",
  ratingMax: "",
};

const blankPoint = {
  date: "",
  valueNumeric: "",
  value: "",
  label: "",
  metadata: "",
  sortOrder: 0,
};

function toGroupForm(item) {
  return {
    name: item.name || "",
    description: item.description || "",
    sortOrder: item.sortOrder ?? 0,
    visibility: item.visibility || "public",
  };
}

function toMetricForm(item) {
  return {
    name: item.name || "",
    label: item.label || "",
    value: item.value || "",
    valueNumeric: item.valueNumeric ?? "",
    unit: item.unit || "",
    type: item.type || "count",
    prefix: item.prefix || "",
    suffix: item.suffix || "",
    startValue: item.startValue || "",
    endValue: item.endValue || "",
    date: toDateInput(item.date),
    category: item.category || "",
    visibility: item.visibility || "public",
    featured: Boolean(item.featured),
    sortOrder: item.sortOrder ?? 0,
    metricGroupId: item.metricGroupId ?? "",
    projectId: item.projectId ?? "",
    experienceId: item.experienceId ?? "",
    achievementId: item.achievementId ?? "",
    period: item.period || "",
    trendPreference: item.trendPreference || "neutral",
    previousNumeric: item.previousNumeric ?? "",
    targetNumeric: item.targetNumeric ?? "",
    baselineNumeric: item.baselineNumeric ?? "",
    decimals: item.decimals ?? "",
    compact: Boolean(item.compact),
    percentScale: item.percentScale || "auto",
    ratingMax: item.ratingMax ?? "",
  };
}

function toPointForm(item) {
  return {
    date: toDateInput(item.date),
    valueNumeric: item.valueNumeric ?? "",
    value: item.value || "",
    label: item.label || "",
    metadata:
      item.metadata != null
        ? typeof item.metadata === "string"
          ? item.metadata
          : JSON.stringify(item.metadata, null, 2)
        : "",
    sortOrder: item.sortOrder ?? 0,
  };
}

function emptyToNull(v) {
  return v === "" || v === undefined ? null : v;
}

export default function AdminMetrics({
  groups: initialGroups,
  metrics: initialMetrics,
  projects,
  experience,
  achievements,
  settings,
}) {
  const [tab, setTab] = useState("metrics");
  const [groups, setGroups] = useState(initialGroups);
  const [metrics, setMetrics] = useState(initialMetrics);

  const [groupModal, setGroupModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupForm, setGroupForm] = useState(blankGroup);
  const [groupSaving, setGroupSaving] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [deleteGroupId, setDeleteGroupId] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  const [metricModal, setMetricModal] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState(null);
  const [metricForm, setMetricForm] = useState(blankMetric);
  const [metricSaving, setMetricSaving] = useState(false);
  const [metricError, setMetricError] = useState("");
  const [deleteMetricId, setDeleteMetricId] = useState(null);
  const [deletingMetric, setDeletingMetric] = useState(false);

  const [pointsMetric, setPointsMetric] = useState(null);
  const [points, setPoints] = useState([]);
  const [pointModal, setPointModal] = useState(false);
  const [editingPointId, setEditingPointId] = useState(null);
  const [pointForm, setPointForm] = useState(blankPoint);
  const [pointSaving, setPointSaving] = useState(false);
  const [pointError, setPointError] = useState("");
  const [deletePointId, setDeletePointId] = useState(null);
  const [deletingPoint, setDeletingPoint] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const refreshGroups = async () => {
    const res = await fetch("/api/admin/metric-groups");
    setGroups(await res.json());
  };

  const refreshMetrics = async () => {
    const res = await fetch("/api/admin/metrics");
    const data = await res.json();
    setMetrics(Array.isArray(data) ? data : data.metrics || []);
  };

  const openPoints = async (metric) => {
    setPointsMetric(metric);
    const res = await fetch(`/api/admin/metrics/${metric.id}/data-points`);
    setPoints(await res.json());
  };

  const refreshPoints = async () => {
    if (!pointsMetric) return;
    const res = await fetch(
      `/api/admin/metrics/${pointsMetric.id}/data-points`
    );
    setPoints(await res.json());
    refreshMetrics();
  };

  const saveGroup = async (e) => {
    e.preventDefault();
    setGroupSaving(true);
    setGroupError("");
    const payload = {
      ...(editingGroupId ? { id: editingGroupId } : {}),
      ...groupForm,
    };
    const res = await fetch("/api/admin/metric-groups", {
      method: editingGroupId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setGroupSaving(false);
    if (!res.ok) {
      setGroupError("Save failed");
      return;
    }
    setGroupModal(false);
    refreshGroups();
    refreshMetrics();
  };

  const removeGroup = async () => {
    if (!deleteGroupId) return;
    setDeletingGroup(true);
    await fetch("/api/admin/metric-groups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteGroupId }),
    });
    setDeletingGroup(false);
    setDeleteGroupId(null);
    refreshGroups();
    refreshMetrics();
  };

  const saveMetric = async (e) => {
    e.preventDefault();
    setMetricSaving(true);
    setMetricError("");
    const payload = {
      ...(editingMetricId ? { id: editingMetricId } : {}),
      ...metricForm,
      valueNumeric: emptyToNull(metricForm.valueNumeric),
      previousNumeric: emptyToNull(metricForm.previousNumeric),
      targetNumeric: emptyToNull(metricForm.targetNumeric),
      baselineNumeric: emptyToNull(metricForm.baselineNumeric),
      decimals: emptyToNull(metricForm.decimals),
      ratingMax: emptyToNull(metricForm.ratingMax),
      period: emptyToNull(metricForm.period),
      metricGroupId: emptyToNull(metricForm.metricGroupId),
      projectId: emptyToNull(metricForm.projectId),
      experienceId: emptyToNull(metricForm.experienceId),
      achievementId: emptyToNull(metricForm.achievementId),
      date: emptyToNull(metricForm.date),
    };
    const res = await fetch("/api/admin/metrics", {
      method: editingMetricId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMetricSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMetricError(body.error || "Save failed");
      return;
    }
    setMetricModal(false);
    refreshMetrics();
  };

  const removeMetric = async () => {
    if (!deleteMetricId) return;
    setDeletingMetric(true);
    await fetch("/api/admin/metrics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteMetricId }),
    });
    setDeletingMetric(false);
    setDeleteMetricId(null);
    refreshMetrics();
  };

  const savePoint = async (e) => {
    e.preventDefault();
    if (!pointsMetric) return;
    setPointSaving(true);
    setPointError("");
    const payload = {
      ...(editingPointId ? { id: editingPointId } : {}),
      date: pointForm.date,
      valueNumeric: emptyToNull(pointForm.valueNumeric),
      value: emptyToNull(pointForm.value),
      label: emptyToNull(pointForm.label),
      metadata: emptyToNull(pointForm.metadata),
      sortOrder: Number(pointForm.sortOrder) || 0,
      upsert: false,
    };
    const res = await fetch(
      `/api/admin/metrics/${pointsMetric.id}/data-points`,
      {
        method: editingPointId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setPointSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPointError(body.error || "Save failed");
      return;
    }
    setPointModal(false);
    refreshPoints();
  };

  const removePoint = async () => {
    if (!deletePointId || !pointsMetric) return;
    setDeletingPoint(true);
    await fetch(`/api/admin/metrics/${pointsMetric.id}/data-points`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deletePointId }),
    });
    setDeletingPoint(false);
    setDeletePointId(null);
    refreshPoints();
  };

  return (
    <AdminLayout siteName={settings.siteName}>
      <PageHeader
        title="Metrics"
        description="Measures that support storytelling — series, formatting, and comparisons (not a BI dashboard)."
        actions={
          tab === "groups" ? (
            <button
              type="button"
              onClick={() => {
                setEditingGroupId(null);
                setGroupForm({ ...blankGroup, sortOrder: groups.length });
                setGroupError("");
                setGroupModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add group
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => downloadExport("/api/admin/export/metrics?format=csv")}
                className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => downloadExport("/api/admin/export/metrics?format=json")}
                className="px-3 py-2 border border-slate-300 bg-white rounded text-sm"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMetricId(null);
                  setMetricForm({ ...blankMetric, sortOrder: metrics.length });
                  setMetricError("");
                  setMetricModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add metric
              </button>
            </>
          )
        }
      />

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "metrics", label: "Metrics" },
          { id: "groups", label: "Groups" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === t.id
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "groups" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {groups.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-10 text-center">
              No metric groups yet. Create a group to organize related measures.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">Group</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">
                      Visibility
                    </th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">
                      Metrics
                    </th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">
                      Sort
                    </th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 min-w-0">
                        <p className="font-medium text-slate-900">{g.name}</p>
                        {g.description && (
                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                            {g.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="inline-flex text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {g.visibility}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 tabular-nums hidden md:table-cell">
                        {g._count?.metrics ?? 0}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums hidden lg:table-cell">
                        {g.sortOrder}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            setEditingGroupId(g.id);
                            setGroupForm(toGroupForm(g));
                            setGroupError("");
                            setGroupModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 font-medium ml-3"
                          onClick={() => setDeleteGroupId(g.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "metrics" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {metrics.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-10 text-center">
              No metrics yet. Add a measure or import a CSV series.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-medium">Metric</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">
                      Group
                    </th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">
                      Change
                    </th>
                    <th className="px-4 py-3 font-medium hidden xl:table-cell">
                      Points
                    </th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.map((m) => {
                    const domain = buildMetricDomain(m, m.dataPoints || []);
                    const cmp = domain.comparison;
                    const changeTone =
                      cmp?.changeDirection === "up"
                        ? "text-emerald-700 bg-emerald-50"
                        : cmp?.changeDirection === "down"
                          ? "text-red-700 bg-red-50"
                          : "text-slate-600 bg-slate-100";
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 align-top">
                        <td className="px-4 py-3.5 min-w-[12rem]">
                          <p className="font-medium text-slate-900 leading-snug">
                            {m.label || m.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Sort {m.sortOrder}
                            {m.trendPreference &&
                            m.trendPreference !== "neutral"
                              ? ` · ${m.trendPreference.replace(/_/g, " ")}`
                              : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {domain.formatted?.display || m.value}
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {m.type}
                            </span>
                            {m.period && (
                              <span className="inline-flex text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {m.period}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 hidden lg:table-cell">
                          {m.metricGroup?.name || (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          {cmp?.hasComparison && cmp.changePercent != null ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${changeTone}`}
                              title={
                                cmp.comparisonSource?.previous
                                  ? `Source: ${cmp.comparisonSource.previous}`
                                  : undefined
                              }
                            >
                              {cmp.changeDirection === "up"
                                ? "↑"
                                : cmp.changeDirection === "down"
                                  ? "↓"
                                  : "→"}{" "}
                              {Math.abs(cmp.changePercent)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-slate-600 hidden xl:table-cell">
                          {m._count?.dataPoints > 0 ? (
                            <button
                              type="button"
                              className="text-blue-700 hover:underline"
                              onClick={() => openPoints(m)}
                            >
                              {m._count.dataPoints}
                            </button>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            className="text-slate-700 hover:text-slate-900 font-medium"
                            onClick={() => openPoints(m)}
                          >
                            Points
                          </button>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 font-medium ml-3"
                            onClick={() => {
                              setEditingMetricId(m.id);
                              setMetricForm(toMetricForm(m));
                              setMetricError("");
                              setMetricModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 font-medium ml-3"
                            onClick={() => setDeleteMetricId(m.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Group modal */}
      <Modal
        open={groupModal}
        onClose={() => setGroupModal(false)}
        title={editingGroupId ? "Edit group" : "Add group"}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGroupModal(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="group-form"
              disabled={groupSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {groupSaving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="group-form" onSubmit={saveGroup} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Name"
            value={groupForm.name}
            onChange={(e) =>
              setGroupForm({ ...groupForm, name: e.target.value })
            }
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            value={groupForm.description}
            onChange={(e) =>
              setGroupForm({ ...groupForm, description: e.target.value })
            }
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={groupForm.visibility}
              onChange={(e) =>
                setGroupForm({ ...groupForm, visibility: e.target.value })
              }
            >
              <option value="public">public</option>
              <option value="admin">admin</option>
            </select>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="Sort order"
              value={groupForm.sortOrder}
              onChange={(e) =>
                setGroupForm({ ...groupForm, sortOrder: e.target.value })
              }
            />
          </div>
          {groupError && <p className="text-red-600 text-sm">{groupError}</p>}
        </form>
      </Modal>

      {/* Metric modal */}
      <Modal
        open={metricModal}
        onClose={() => setMetricModal(false)}
        title={editingMetricId ? "Edit metric" : "Add metric"}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMetricModal(false)}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="metric-form"
              disabled={metricSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {metricSaving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <form id="metric-form" onSubmit={saveMetric} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Name"
              value={metricForm.name}
              onChange={(e) =>
                setMetricForm({ ...metricForm, name: e.target.value })
              }
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Label"
              value={metricForm.label}
              onChange={(e) =>
                setMetricForm({ ...metricForm, label: e.target.value })
              }
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Prefix"
              value={metricForm.prefix}
              onChange={(e) =>
                setMetricForm({ ...metricForm, prefix: e.target.value })
              }
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Value (display)"
              value={metricForm.value}
              onChange={(e) =>
                setMetricForm({ ...metricForm, value: e.target.value })
              }
              required
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Suffix"
              value={metricForm.suffix}
              onChange={(e) =>
                setMetricForm({ ...metricForm, suffix: e.target.value })
              }
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              step="any"
              placeholder="valueNumeric"
              value={metricForm.valueNumeric}
              onChange={(e) =>
                setMetricForm({ ...metricForm, valueNumeric: e.target.value })
              }
            />
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.type}
              onChange={(e) =>
                setMetricForm({ ...metricForm, type: e.target.value })
              }
            >
              {METRIC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.period}
              onChange={(e) =>
                setMetricForm({ ...metricForm, period: e.target.value })
              }
            >
              <option value="">No period</option>
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.percentScale}
              onChange={(e) =>
                setMetricForm({ ...metricForm, percentScale: e.target.value })
              }
            >
              {PERCENT_SCALES.map((s) => (
                <option key={s} value={s}>
                  percentScale: {s}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.trendPreference}
              onChange={(e) =>
                setMetricForm({
                  ...metricForm,
                  trendPreference: e.target.value,
                })
              }
            >
              {TREND_PREFERENCES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="decimals"
              value={metricForm.decimals}
              onChange={(e) =>
                setMetricForm({ ...metricForm, decimals: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-slate-500">
            percentScale: ratio stores 0.487 → 48.7%; percent stores 48.7 →
            48.7%; auto uses abs≤1 as ratio.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              step="any"
              placeholder="previousNumeric (fallback)"
              value={metricForm.previousNumeric}
              onChange={(e) =>
                setMetricForm({
                  ...metricForm,
                  previousNumeric: e.target.value,
                })
              }
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              step="any"
              placeholder="targetNumeric"
              value={metricForm.targetNumeric}
              onChange={(e) =>
                setMetricForm({ ...metricForm, targetNumeric: e.target.value })
              }
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              step="any"
              placeholder="baselineNumeric"
              value={metricForm.baselineNumeric}
              onChange={(e) =>
                setMetricForm({
                  ...metricForm,
                  baselineNumeric: e.target.value,
                })
              }
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.metricGroupId}
              onChange={(e) =>
                setMetricForm({ ...metricForm, metricGroupId: e.target.value })
              }
            >
              <option value="">No group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.visibility}
              onChange={(e) =>
                setMetricForm({ ...metricForm, visibility: e.target.value })
              }
            >
              <option value="public">public</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.projectId}
              onChange={(e) =>
                setMetricForm({ ...metricForm, projectId: e.target.value })
              }
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.experienceId}
              onChange={(e) =>
                setMetricForm({ ...metricForm, experienceId: e.target.value })
              }
            >
              <option value="">No experience</option>
              {experience.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.position} · {ex.company}
                </option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2"
              value={metricForm.achievementId}
              onChange={(e) =>
                setMetricForm({ ...metricForm, achievementId: e.target.value })
              }
            >
              <option value="">No achievement</option>
              {achievements.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 items-center">
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              placeholder="Sort order"
              value={metricForm.sortOrder}
              onChange={(e) =>
                setMetricForm({ ...metricForm, sortOrder: e.target.value })
              }
            />
            <input
              className="w-full border rounded px-3 py-2"
              type="number"
              step="any"
              placeholder="ratingMax"
              value={metricForm.ratingMax}
              onChange={(e) =>
                setMetricForm({ ...metricForm, ratingMax: e.target.value })
              }
            />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metricForm.featured}
                  onChange={(e) =>
                    setMetricForm({
                      ...metricForm,
                      featured: e.target.checked,
                    })
                  }
                />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={metricForm.compact}
                  onChange={(e) =>
                    setMetricForm({ ...metricForm, compact: e.target.checked })
                  }
                />
                Compact
              </label>
            </div>
          </div>
          {metricError && (
            <p className="text-red-600 text-sm">{metricError}</p>
          )}
        </form>
      </Modal>

      {/* Data points panel */}
      <Modal
        open={Boolean(pointsMetric)}
        onClose={() => {
          setPointsMetric(null);
          setPointModal(false);
        }}
        title={
          pointsMetric
            ? `Data points · ${pointsMetric.label || pointsMetric.name}`
            : "Data points"
        }
        description="One observation per date. Metadata is optional notes or source only."
        size="xl"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => {
                setPointsMetric(null);
                setPointModal(false);
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPointId(null);
                setPointForm({
                  ...blankPoint,
                  sortOrder: points.length,
                  date: new Date().toISOString().slice(0, 10),
                });
                setPointError("");
                setPointModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add point
            </button>
          </div>
        }
      >
        {pointsMetric && (
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
              Live preview
            </p>
            {(() => {
              const dto = buildMetricDomain(pointsMetric, points);
              const viz = selectMetricVisualization(dto);
              return (
                <MetricChart
                  type={viz.type}
                  data={viz.data}
                  config={{
                    ...viz.config,
                    height: Math.min(viz.config.height || 240, 200),
                    tableFallback: false,
                  }}
                />
              );
            })()}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Observations
            <span className="ml-2 font-normal text-slate-400 tabular-nums">
              {points.length}
            </span>
          </h3>
        </div>

        {points.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No data points yet
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Add dated observations to build a series, or rely on the metric’s
              single value and previous/target fields.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingPointId(null);
                setPointForm({
                  ...blankPoint,
                  sortOrder: 0,
                  date: new Date().toISOString().slice(0, 10),
                });
                setPointError("");
                setPointModal(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Add first point
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[42vh] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-50 z-[1]">
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium">Value</th>
                  <th className="px-3 py-2.5 font-medium hidden sm:table-cell">
                    Label
                  </th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {points.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 tabular-nums text-slate-800 whitespace-nowrap">
                      {toDateInput(p.date) || "—"}
                    </td>
                    <td className="px-3 py-2.5 font-medium tabular-nums text-slate-900">
                      {p.valueNumeric ?? p.value ?? "—"}
                      {p.value && p.valueNumeric != null && (
                        <span className="block text-xs font-normal text-slate-400">
                          display: {p.value}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 hidden sm:table-cell">
                      {p.label || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => {
                          setEditingPointId(p.id);
                          setPointForm(toPointForm(p));
                          setPointError("");
                          setPointModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 font-medium ml-3"
                        onClick={() => setDeletePointId(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal
        open={pointModal}
        onClose={() => setPointModal(false)}
        title={editingPointId ? "Edit data point" : "Add data point"}
        description={
          pointsMetric
            ? `Observation for “${pointsMetric.label || pointsMetric.name}”.`
            : undefined
        }
        size="md"
        layer={60}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPointModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="point-form"
              disabled={pointSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {pointSaving ? "Saving…" : editingPointId ? "Save changes" : "Add point"}
            </button>
          </div>
        }
      >
        <form id="point-form" onSubmit={savePoint} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Date
            </span>
            <input
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              type="date"
              value={pointForm.date}
              onChange={(e) =>
                setPointForm({ ...pointForm, date: e.target.value })
              }
              required
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Numeric value
              </span>
              <input
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                type="number"
                step="any"
                placeholder="e.g. 7"
                value={pointForm.valueNumeric}
                onChange={(e) =>
                  setPointForm({ ...pointForm, valueNumeric: e.target.value })
                }
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Label
              </span>
              <input
                className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="e.g. Jan"
                value={pointForm.label}
                onChange={(e) =>
                  setPointForm({ ...pointForm, label: e.target.value })
                }
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Display override
            </span>
            <input
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="Optional, e.g. 7+"
              value={pointForm.value}
              onChange={(e) =>
                setPointForm({ ...pointForm, value: e.target.value })
              }
            />
            <span className="mt-1 block text-xs text-slate-400">
              Use when the shown string differs from the numeric value.
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Metadata (JSON)
            </span>
            <textarea
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder='{"source":"import"}'
              value={pointForm.metadata}
              onChange={(e) =>
                setPointForm({ ...pointForm, metadata: e.target.value })
              }
              rows={3}
            />
          </label>
          {pointError && <p className="text-red-600 text-sm">{pointError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteGroupId)}
        onClose={() => setDeleteGroupId(null)}
        onConfirm={removeGroup}
        title="Delete metric group"
        message="Delete this group? Metrics will be kept and ungrouped."
        confirmLabel="Delete"
        danger
        loading={deletingGroup}
      />
      <ConfirmDialog
        open={Boolean(deleteMetricId)}
        onClose={() => setDeleteMetricId(null)}
        onConfirm={removeMetric}
        title="Delete metric"
        message="Delete this metric and all its data points?"
        confirmLabel="Delete"
        danger
        loading={deletingMetric}
      />
      <ConfirmDialog
        open={Boolean(deletePointId)}
        onClose={() => setDeletePointId(null)}
        onConfirm={removePoint}
        title="Delete data point"
        message="Delete this observation?"
        confirmLabel="Delete"
        danger
        loading={deletingPoint}
      />

      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import metrics"
        endpoint="/api/admin/import/metrics"
        onImported={() => refreshMetrics()}
        sampleHint={`date,metric,value\n2026-01,Revenue,18200\n2026-02,Revenue,21500\n2026-03,Revenue,26200`}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const auth = await getAdminSession(context);
  if (auth.redirect) return auth;

  const [groups, metrics, projects, experience, achievements, settings] =
    await Promise.all([
      prisma.metricGroup.findMany({
        include: { _count: { select: { metrics: true } } },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.metric.findMany({
        include: {
          metricGroup: { select: { id: true, name: true } },
          project: { select: { id: true, title: true } },
          experience: { select: { id: true, position: true, company: true } },
          achievement: { select: { id: true, title: true } },
          dataPoints: { orderBy: [{ date: "asc" }, { sortOrder: "asc" }] },
          _count: { select: { dataPoints: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.project.findMany({
        select: { id: true, title: true },
        orderBy: { title: "asc" },
      }),
      prisma.experience.findMany({
        select: { id: true, position: true, company: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.achievement.findMany({
        select: { id: true, title: true },
        orderBy: { sortOrder: "asc" },
      }),
      getSiteSettings(),
    ]);

  return {
    props: {
      groups: JSON.parse(JSON.stringify(groups)),
      metrics: JSON.parse(JSON.stringify(metrics)),
      projects: JSON.parse(JSON.stringify(projects)),
      experience: JSON.parse(JSON.stringify(experience)),
      achievements: JSON.parse(JSON.stringify(achievements)),
      settings,
    },
  };
}
