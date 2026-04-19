"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Lightbulb, MessageSquare, Plus, Search, Users, X } from "lucide-react";

import { projectApi } from "@/features/projects/services/project-api";

interface Interview {
  id: number;
  contact_name: string;
  contact_role: string;
  contact_company: string;
  interview_type: string;
  status: string;
  scheduled_at: string;
  notes?: string;
}

interface Conversation {
  id: number;
  person: string;
  context: string;
  painPoints?: string;
  learned?: string;
}

type RecordValue = Record<string, unknown>;

const starterQuestions = [
  "What are you trying to get done today?",
  "What is hard or frustrating about that?",
  "What do you do today instead?",
  "How often does this happen?",
  "What does this problem cost in time, money, or missed opportunities?",
];

const researchSteps = [
  {
    title: "Talk to the right people",
    description: "Start with people who match your target customer, not friends who are only being nice.",
  },
  {
    title: "Learn the current reality",
    description: "Focus on what they do now, what hurts, and what alternatives they already use.",
  },
  {
    title: "Collect evidence",
    description: "Write down direct quotes, repeated pain points, and buying signals from the database-backed interviews and conversations.",
  },
];

function readText(source: unknown, keys: string[]) {
  if (!source || typeof source !== "object") {
    return "";
  }

  const record = source as RecordValue;

  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim()) {
      return record[key] as string;
    }
  }

  return "";
}

export default function InterviewsPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [problem, setProblem] = useState<RecordValue>({});
  const [icp, setIcp] = useState<RecordValue>({});
  const [marketSizing, setMarketSizing] = useState<RecordValue>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_role: "",
    contact_company: "",
    interview_type: "discovery",
    scheduled_at: "",
  });

  useEffect(() => {
    if (!projectUuid) return;
    void loadData();
  }, [projectUuid]);

  async function loadData() {
    try {
      setLoading(true);

      const [interviewsData, conversationsData, problemData, icpData, marketSizingData] = await Promise.all([
        projectApi.listInterviews(projectUuid),
        projectApi.listConversations(projectUuid),
        projectApi.getProblemWorkspace(projectUuid).catch(() => ({})),
        projectApi.getICP(projectUuid).catch(() => ({})),
        projectApi.getMarketSizing(projectUuid).catch(() => ({})),
      ]);

      const problemPayload =
        problemData && typeof problemData === "object" && "problem" in problemData
          ? ((problemData as RecordValue).problem as RecordValue)
          : {};

      setInterviews(interviewsData as Interview[]);
      setConversations(conversationsData as unknown as Conversation[]);
      setProblem(problemPayload ?? {});
      setIcp((icpData as RecordValue) ?? {});
      setMarketSizing((marketSizingData as RecordValue) ?? {});
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitInterview(event: React.FormEvent) {
    event.preventDefault();

    try {
      await projectApi.createInterview(projectUuid, {
        contact_name: formData.contact_name,
        contact_role: formData.contact_role || undefined,
        contact_company: formData.contact_company || undefined,
        interview_type: formData.interview_type,
        scheduled_at: formData.scheduled_at || undefined,
      });

      setShowForm(false);
      setFormData({
        contact_name: "",
        contact_role: "",
        contact_company: "",
        interview_type: "discovery",
        scheduled_at: "",
      });
      await loadData();
    } catch (error: any) {
      if (error.message?.includes("Unauthenticated") || error.message?.includes("401")) {
        router.push("/login");
      }
    }
  }

  const researchBrief = useMemo(
    () => ({
      whoToTalkTo:
        readText(problem, ["who"]) ||
        readText(icp, ["icpDescription", "targetMarket"]) ||
        readText(marketSizing, ["targetSegment"]) ||
        "People who most often face this problem",
      whatToLearn:
        readText(problem, ["problemStatement"]) ||
        "What problem is painful enough that people actively want a better solution",
      currentAlternative:
        readText(problem, ["currentWorkaround"]) || "What people use today instead of your solution",
      whereToStart:
        readText(marketSizing, ["geography", "industry", "targetSegment"]) ||
        readText(icp, ["targetMarket"]) ||
        "Start where your target users are easiest to reach",
    }),
    [icp, marketSizing, problem]
  );

  const evidence = useMemo(() => {
    const items: Array<{ id: string; quote: string; source: string }> = [];

    interviews.forEach((interview) => {
      if (interview.notes?.trim()) {
        items.push({
          id: `interview-${interview.id}`,
          quote: interview.notes.trim(),
          source: interview.contact_name || "Interview",
        });
      }
    });

    conversations.forEach((conversation) => {
      if (conversation.painPoints?.trim()) {
        items.push({
          id: `pain-${conversation.id}`,
          quote: conversation.painPoints.trim(),
          source: `${conversation.person} pain point`,
        });
      }

      if (conversation.learned?.trim()) {
        items.push({
          id: `learning-${conversation.id}`,
          quote: conversation.learned.trim(),
          source: `${conversation.person} learning`,
        });
      }
    });

    return items.slice(0, 8);
  }, [conversations, interviews]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Interviews</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Keep this page simple. Use it to plan interviews, capture what customers say, and confirm whether the
            market problem is real.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Schedule interview
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Start here</h2>
        <p className="mt-1 text-sm text-slate-500">
          Based on SBA-style market research, the goal is to understand customer needs, current alternatives, and signs
          of real demand before you jump to solutions.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {researchSteps.map((step) => (
            <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-medium text-slate-900">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Research brief from your project</h2>
          <p className="mt-1 text-sm text-slate-500">
            This is pulled from the current project so you do not have to rewrite the same context here.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Who to talk to</p>
              <p className="mt-2 text-sm text-slate-800">{researchBrief.whoToTalkTo}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">What to learn</p>
              <p className="mt-2 text-sm text-slate-800">{researchBrief.whatToLearn}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Current alternative</p>
              <p className="mt-2 text-sm text-slate-800">{researchBrief.currentAlternative}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Where to start</p>
              <p className="mt-2 text-sm text-slate-800">{researchBrief.whereToStart}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Question guide</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Ask short, open questions. Avoid pitching your idea too early.
          </p>
          <div className="mt-4 space-y-3">
            {starterQuestions.map((question) => (
              <div key={question} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                {question}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Interview queue</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Keep only the people you actually plan to contact. The objective already comes from your project context.
          </p>

          {interviews.length === 0 ? (
            <div className="mt-5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-medium text-slate-900">No interviews scheduled yet</p>
              <p className="mt-1 text-sm text-slate-500">Start with 5 to 10 people who match your target customer.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {interviews.map((interview) => (
                <div key={interview.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{interview.contact_name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {[interview.contact_role, interview.contact_company].filter(Boolean).join(" / ") || "No role or company yet"}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{interview.interview_type}</p>
                      <p className="mt-1 text-sm text-slate-700">{interview.status.replace("_", " ")}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {interview.scheduled_at ? new Date(interview.scheduled_at).toLocaleString() : "No date yet"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Evidence already captured</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            This section reads directly from saved interviews and conversations in the database.
          </p>

          {evidence.length === 0 ? (
            <div className="mt-5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No evidence captured yet.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {evidence.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-800">{item.quote}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.source}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Schedule interview</h3>
              <button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterview} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Contact name</label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, contact_name: event.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                  <input
                    type="text"
                    value={formData.contact_role}
                    onChange={(event) => setFormData((prev) => ({ ...prev, contact_role: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Company</label>
                  <input
                    type="text"
                    value={formData.contact_company}
                    onChange={(event) => setFormData((prev) => ({ ...prev, contact_company: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Interview type</label>
                  <select
                    value={formData.interview_type}
                    onChange={(event) => setFormData((prev) => ({ ...prev, interview_type: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <option value="discovery">Discovery</option>
                    <option value="validation">Validation</option>
                    <option value="pricing">Pricing</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Scheduled date</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(event) => setFormData((prev) => ({ ...prev, scheduled_at: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                The research goal already comes from your saved problem, ICP, and market pages. You only need to plan
                who to talk to here.
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2.5 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
