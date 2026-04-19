"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Link,
  Lightbulb,
  MessageCircle,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import { projectApi } from "@/features/projects/services/project-api";

interface ProblemEvidence {
  id: string;
  type: "quote" | "data" | "observation" | "link";
  content: string;
  source?: string;
  severity: "high" | "medium" | "low";
}

interface ProblemSnapshot {
  problemStatement: string;
  who: string;
  when: string;
  howOften: string;
  currentWorkaround: string;
  cost: string;
}

interface ProblemValidationData {
  evidence: ProblemEvidence[];
  status: "validated" | "in_progress" | "not_validated";
}

const defaultSnapshot: ProblemSnapshot = {
  problemStatement: "",
  who: "",
  when: "",
  howOften: "",
  currentWorkaround: "",
  cost: "",
};

const defaultValidation: ProblemValidationData = {
  evidence: [],
  status: "in_progress",
};

export default function ProblemValidationPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [problem, setProblem] = useState<ProblemSnapshot>(defaultSnapshot);
  const [validation, setValidation] = useState<ProblemValidationData>(defaultValidation);
  const [loading, setLoading] = useState(true);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    type: "quote" as ProblemEvidence["type"],
    content: "",
    source: "",
    severity: "medium" as ProblemEvidence["severity"],
  });

  useEffect(() => {
    if (!projectUuid) return;
    void loadData();
  }, [projectUuid]);

  async function loadData() {
    try {
      const [problemResult, validationResult] = await Promise.all([
        projectApi.getProblemWorkspace(projectUuid),
        projectApi.getProblemValidation(projectUuid),
      ]);

      if (problemResult && typeof problemResult === "object") {
        const apiData = problemResult as Record<string, unknown>;
        const problemData =
          apiData.problem && typeof apiData.problem === "object"
            ? (apiData.problem as Record<string, unknown>)
            : {};

        setProblem({
          problemStatement: typeof problemData.problemStatement === "string" ? problemData.problemStatement : "",
          who: typeof problemData.who === "string" ? problemData.who : "",
          when: typeof problemData.when === "string" ? problemData.when : "",
          howOften: typeof problemData.howOften === "string" ? problemData.howOften : "",
          currentWorkaround: typeof problemData.currentWorkaround === "string" ? problemData.currentWorkaround : "",
          cost: typeof problemData.cost === "string" ? problemData.cost : "",
        });
      }

      if (validationResult && typeof validationResult === "object") {
        const apiData = validationResult as Record<string, unknown>;
        setValidation({
          evidence: Array.isArray(apiData.evidence) ? (apiData.evidence as ProblemEvidence[]) : [],
          status:
            apiData.status === "validated" || apiData.status === "not_validated"
              ? (apiData.status as ProblemValidationData["status"])
              : "in_progress",
        });
      }
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveData() {
    try {
      await projectApi.saveProblemValidation(projectUuid, validation as unknown as Record<string, unknown>);
      alert("Saved!");
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
      }
    }
  }

  function addEvidence() {
    if (!newEvidence.content.trim()) return;

    const evidence: ProblemEvidence = {
      id: Date.now().toString(),
      ...newEvidence,
    };

    setValidation((prev) => ({ ...prev, evidence: [...prev.evidence, evidence] }));
    setNewEvidence({ type: "quote", content: "", source: "", severity: "medium" });
    setShowEvidenceModal(false);
  }

  function removeEvidence(id: string) {
    setValidation((prev) => ({ ...prev, evidence: prev.evidence.filter((item) => item.id !== id) }));
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "quote":
        return MessageCircle;
      case "data":
        return TrendingUp;
      case "observation":
        return Lightbulb;
      case "link":
        return Link;
      default:
        return FileText;
    }
  }

  const stats = {
    total: validation.evidence.length,
    highSeverity: validation.evidence.filter((item) => item.severity === "high").length,
    quotes: validation.evidence.filter((item) => item.type === "quote").length,
  };

  const checklist = [
    { key: "problem", label: "Problem statement already defined", done: !!problem.problemStatement.trim() },
    { key: "evidence", label: "At least 3 pieces of evidence", done: validation.evidence.length >= 3 },
    {
      key: "high_severity",
      label: "At least 1 strong signal",
      done: validation.evidence.some((item) => item.severity === "high"),
    },
    {
      key: "status",
      label: "Validation status selected",
      done: validation.status === "validated" || validation.status === "not_validated",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Problem Validation</h1>
          <p className="mt-1 text-sm text-slate-500">
            This page validates the existing problem. The problem itself stays owned by the Problem Statement page.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={validation.status}
            onChange={(event) =>
              setValidation((prev) => ({
                ...prev,
                status: event.target.value as ProblemValidationData["status"],
              }))
            }
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
              validation.status === "validated"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : validation.status === "in_progress"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            <option value="in_progress">In Progress</option>
            <option value="validated">Validated</option>
            <option value="not_validated">Not Validated</option>
          </select>
          <button
            onClick={saveData}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Current Problem Statement
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Problem</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {problem.problemStatement || "No problem statement saved yet."}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Who</p>
            <p className="mt-2 text-sm text-slate-900">{problem.who || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">When</p>
            <p className="mt-2 text-sm text-slate-900">{problem.when || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">How Often</p>
            <p className="mt-2 text-sm text-slate-900">{problem.howOften || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Cost</p>
            <p className="mt-2 text-sm text-slate-900">{problem.cost || "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current Workaround</p>
            <p className="mt-2 text-sm text-slate-900">{problem.currentWorkaround || "—"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Search className="h-5 w-5 text-blue-600" />
            Evidence and Proof
          </h2>
          <button
            onClick={() => setShowEvidenceModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Add Evidence
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Total evidence</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xl font-bold text-red-700">{stats.highSeverity}</p>
            <p className="text-xs text-red-600">High severity</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xl font-bold text-blue-700">{stats.quotes}</p>
            <p className="text-xs text-blue-600">Quotes</p>
          </div>
        </div>

        {validation.evidence.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-slate-500">No evidence added yet</p>
            <p className="text-sm text-slate-400">Use interviews, notes, links, and data points as proof.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {validation.evidence.map((evidence) => {
              const Icon = getTypeIcon(evidence.type);
              return (
                <div key={evidence.id} className="group flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">{evidence.content}</p>
                    {evidence.source ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <ExternalLink className="h-3 w-3" />
                        {evidence.source}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getSeverityColor(evidence.severity)}`}>
                      {evidence.severity}
                    </span>
                    <button
                      onClick={() => removeEvidence(evidence.id)}
                      className="rounded p-1 text-red-500 opacity-0 hover:bg-red-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Validation Checklist
        </h2>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
              )}
              <span className={item.done ? "text-sm text-slate-900" : "text-sm text-slate-500"}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {showEvidenceModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add Evidence</h3>
              <button onClick={() => setShowEvidenceModal(false)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                <select
                  value={newEvidence.type}
                  onChange={(event) =>
                    setNewEvidence((prev) => ({ ...prev, type: event.target.value as ProblemEvidence["type"] }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="quote">Quote</option>
                  <option value="data">Data</option>
                  <option value="observation">Observation</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
                <textarea
                  value={newEvidence.content}
                  onChange={(event) => setNewEvidence((prev) => ({ ...prev, content: event.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Describe the proof..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Source</label>
                <input
                  type="text"
                  value={newEvidence.source}
                  onChange={(event) => setNewEvidence((prev) => ({ ...prev, source: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Interview, report, article, call note..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Severity</label>
                <select
                  value={newEvidence.severity}
                  onChange={(event) =>
                    setNewEvidence((prev) => ({
                      ...prev,
                      severity: event.target.value as ProblemEvidence["severity"],
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={addEvidence} className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white">
                Add
              </button>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="rounded-lg px-4 py-2.5 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
