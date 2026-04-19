"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Save, Sparkles } from "lucide-react";

import { projectApi } from "@/features/projects/services/project-api";

interface ProblemData {
  problemStatement: string;
  who: string;
  when: string;
  howOften: string;
  currentWorkaround: string;
  cost: string;
}

const defaultData: ProblemData = {
  problemStatement: "",
  who: "",
  when: "",
  howOften: "",
  currentWorkaround: "",
  cost: "",
};

export default function ProblemStatementPage() {
  const params = useParams();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [data, setData] = useState<ProblemData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectUuid) return;
    void loadData();
  }, [projectUuid]);

  async function loadData() {
    try {
      setLoading(true);
      const result = await projectApi.getProblemWorkspace(projectUuid);
      if (result && typeof result === "object") {
        const apiData = result as Record<string, unknown>;
        const problem =
          apiData.problem && typeof apiData.problem === "object"
            ? (apiData.problem as Record<string, unknown>)
            : {};

        setData({
          problemStatement: typeof problem.problemStatement === "string" ? problem.problemStatement : "",
          who: typeof problem.who === "string" ? problem.who : "",
          when: typeof problem.when === "string" ? problem.when : "",
          howOften: typeof problem.howOften === "string" ? problem.howOften : "",
          currentWorkaround: typeof problem.currentWorkaround === "string" ? problem.currentWorkaround : "",
          cost: typeof problem.cost === "string" ? problem.cost : "",
        });
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveData() {
    setSaving(true);
    try {
      await projectApi.saveProblemWorkspace(projectUuid, {
        problem: {
          problemStatement: data.problemStatement,
          who: data.who,
          when: data.when,
          howOften: data.howOften,
          currentWorkaround: data.currentWorkaround,
          cost: data.cost,
        },
      });
      alert("Saved!");
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  }

  const checklist = [
    { label: "Problem written clearly", done: !!data.problemStatement.trim() },
    { label: "Target user identified", done: !!data.who.trim() },
    { label: "Moment of pain described", done: !!data.when.trim() },
    { label: "Current workaround documented", done: !!data.currentWorkaround.trim() },
    { label: "Impact or cost estimated", done: !!data.cost.trim() },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Problem Statement
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define the problem once here. Discovery and validation happen on their own dedicated pages.
          </p>
        </div>
        <button
          onClick={saveData}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-amber-900">
          <AlertTriangle className="h-6 w-6" />
          Start simple
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          A beginner should answer six questions only: who has the problem, what hurts, when it happens,
          how often it happens, what they do today, and what this pain costs them.
        </p>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Who has this problem?</label>
          <input
            type="text"
            value={data.who}
            onChange={(event) => setData((prev) => ({ ...prev, who: event.target.value }))}
            placeholder="e.g., solo founders running early-stage startups"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">What is the problem?</label>
          <textarea
            value={data.problemStatement}
            onChange={(event) => setData((prev) => ({ ...prev, problemStatement: event.target.value }))}
            placeholder="Describe the core pain in one sentence."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">When does it happen?</label>
            <input
              type="text"
              value={data.when}
              onChange={(event) => setData((prev) => ({ ...prev, when: event.target.value }))}
              placeholder="e.g., when they are trying to organize customer feedback"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">How often?</label>
            <input
              type="text"
              value={data.howOften}
              onChange={(event) => setData((prev) => ({ ...prev, howOften: event.target.value }))}
              placeholder="e.g., every week"
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Current workaround</label>
          <textarea
            value={data.currentWorkaround}
            onChange={(event) => setData((prev) => ({ ...prev, currentWorkaround: event.target.value }))}
            placeholder="What do they do today instead?"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Cost of the problem</label>
          <input
            type="text"
            value={data.cost}
            onChange={(event) => setData((prev) => ({ ...prev, cost: event.target.value }))}
            placeholder="e.g., wasted hours, lost deals, team confusion"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">Checklist</h3>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
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
    </div>
  );
}
