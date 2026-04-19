"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart3,
  DollarSign,
  FlaskConical,
  GripVertical,
  Lightbulb,
  Megaphone,
  Plus,
  Rocket,
  Save,
  ShoppingCart,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { projectApi } from "@/features/projects/services/project-api";

interface GTMItem {
  id: string;
  content: string;
}

interface GTMBlockDefinition {
  id: string;
  title: string;
  description: string;
  prompt: string;
  placeholder: string;
  color: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GTMBlock extends GTMBlockDefinition {
  items: GTMItem[];
}

interface GTMProjectContext {
  problemStatement: string;
  targetUser: string;
  marketSummary: string;
  marketNumbers: string[];
  icpSummary: string;
  discoverySummary: string;
  discoveryMetrics: string[];
}

const GTM_BLOCK_DEFINITIONS: GTMBlockDefinition[] = [
  {
    id: "value_proposition_and_message",
    title: "Step 1: Message",
    description: "Turn the existing problem, ICP, and discovery evidence into one simple promise the customer can understand quickly.",
    prompt: "How will you explain the value in plain language to the right customer?",
    placeholder: "Example: 'Stop losing time across scattered tools. Manage validation, decisions, and execution in one founder-friendly workspace.'",
    color: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Lightbulb,
  },
  {
    id: "competitive_alternatives",
    title: "Step 2: Why Switch",
    description: "Use what you learned in discovery to explain what customers do today and why your offer is a better next step.",
    prompt: "What current workaround are you replacing, and why is your offer easier or more valuable?",
    placeholder: "Example: Today they use Notion, WhatsApp, and spreadsheets. We position against tool sprawl with one clearer workflow for founders.",
    color: "bg-violet-50",
    borderColor: "border-violet-200",
    icon: BarChart3,
  },
  {
    id: "pricing_and_profitability",
    title: "Step 3: Offer and Pricing",
    description: "Define the first offer a beginner can actually sell: what is included, who it is for, and what they pay.",
    prompt: "What is the simplest paid offer you can launch first?",
    placeholder: "Example: Starter plan at $29/month for founder-led teams, with onboarding templates included in the first month.",
    color: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: DollarSign,
  },
  {
    id: "distribution_channels",
    title: "Step 4: First Channel",
    description: "Pick the first acquisition channel instead of trying everything at once. The goal is focus, not complexity.",
    prompt: "Where will you find the first people who already feel this problem?",
    placeholder: "Example: Founder communities first, then referrals from interviewees, then ecosystem partnerships once the message is clear.",
    color: "bg-cyan-50",
    borderColor: "border-cyan-200",
    icon: Rocket,
  },
  {
    id: "activation_assets",
    title: "Step 5: Assets to Prepare",
    description: "List the few assets a beginner needs to start: one page, one deck, one demo, one call flow, not a giant campaign machine.",
    prompt: "What material must exist before you ask people to buy or book a demo?",
    placeholder: "Example: One landing page, one short demo, one founder pitch, and one discovery call script.",
    color: "bg-rose-50",
    borderColor: "border-rose-200",
    icon: Megaphone,
  },
  {
    id: "sales_motion",
    title: "Step 6: Founder Sales Flow",
    description: "Describe the exact path from first contact to first payment so the founder knows what to do next.",
    prompt: "How does one person move from hearing about you to becoming a customer?",
    placeholder: "Example: Community post -> discovery call -> short demo -> trial onboarding -> paid conversion within 14 days.",
    color: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: ShoppingCart,
  },
  {
    id: "launch_plan_and_experiments",
    title: "Step 7: 30-Day Launch Plan",
    description: "Turn the GTM into a simple action plan with a small number of tests, clear metrics, and next decisions.",
    prompt: "What will you do in the next 30 days, and how will you know whether it is working?",
    placeholder: "Example: Reach out to 30 qualified leads, run 10 demos, close 2 paid pilots, and review conversion weekly before adding a second channel.",
    color: "bg-lime-50",
    borderColor: "border-lime-200",
    icon: FlaskConical,
  },
];

function createDefaultBlocks(): GTMBlock[] {
  return GTM_BLOCK_DEFINITIONS.map((block) => ({
    ...block,
    items: [],
  }));
}

function isGTMItemArray(value: unknown): value is GTMItem[] {
  return Array.isArray(value);
}

function normalizeIncomingItem(item: unknown, index: number): GTMItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const content = "content" in item && typeof item.content === "string" ? item.content.trim() : "";
  if (!content) {
    return null;
  }

  const id =
    "id" in item && typeof item.id === "string" && item.id.trim()
      ? item.id
      : `gtm-item-${Date.now()}-${index}`;

  return { id, content };
}

function buildContextSummary(data: Record<string, unknown> | null | undefined): GTMProjectContext {
  const problem = data?.problem && typeof data.problem === "object" ? (data.problem as Record<string, unknown>) : null;
  const problemStatement =
    typeof problem?.problemStatement === "string" ? problem.problemStatement.trim() : "";
  const targetUser = typeof problem?.who === "string" ? problem.who.trim() : "";

  return {
    problemStatement,
    targetUser,
    marketSummary: "",
    marketNumbers: [],
    icpSummary: "",
    discoverySummary: "",
    discoveryMetrics: [],
  };
}

export default function GTMPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = (params.projectUuid || params.projectId) as string;

  const [blocks, setBlocks] = useState<GTMBlock[]>(createDefaultBlocks());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [newItemContent, setNewItemContent] = useState("");
  const [draggedItem, setDraggedItem] = useState<{ blockId: string; itemId: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState<GTMProjectContext>({
    problemStatement: "",
    targetUser: "",
    marketSummary: "",
    marketNumbers: [],
    icpSummary: "",
    discoverySummary: "",
    discoveryMetrics: [],
  });

  useEffect(() => {
    if (!projectUuid) {
      return;
    }

    void loadGTM();
  }, [projectUuid]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const completion = useMemo(() => {
    const filledBlocks = blocks.filter((block) => block.items.length > 0).length;
    return Math.round((filledBlocks / blocks.length) * 100);
  }, [blocks]);

  const totalItems = useMemo(
    () => blocks.reduce((sum, block) => sum + block.items.length, 0),
    [blocks]
  );

  async function loadGTM() {
    try {
      setLoading(true);
      setError(null);

      const [gtmData, problemData, marketData, icpData, interviews, conversations] = await Promise.all([
        projectApi.getGTM(projectUuid),
        projectApi.getProblemWorkspace(projectUuid).catch(() => null),
        projectApi.getMarketSizing(projectUuid).catch(() => null),
        projectApi.getICP(projectUuid).catch(() => null),
        projectApi.listInterviews(projectUuid).catch(() => []),
        projectApi.listConversations(projectUuid).catch(() => []),
      ]);

      const nextContext = buildContextSummary(problemData);

      if (marketData && typeof marketData === "object") {
        const market = marketData as Record<string, unknown>;
        const marketParts = [
          typeof market.targetSegment === "string" ? market.targetSegment.trim() : "",
          typeof market.geography === "string" ? market.geography.trim() : "",
          typeof market.industry === "string" ? market.industry.trim() : "",
        ].filter(Boolean);

        nextContext.marketSummary = marketParts.join(" • ");
        nextContext.marketNumbers = [
          typeof market.totalCustomers === "string" && market.totalCustomers.trim()
            ? `Customers: ${market.totalCustomers.trim()}`
            : "",
          typeof market.samPercent === "string" && market.samPercent.trim()
            ? `SAM: ${market.samPercent.trim()}%`
            : "",
          typeof market.somPercent === "string" && market.somPercent.trim()
            ? `SOM: ${market.somPercent.trim()}%`
            : "",
        ].filter(Boolean);
      }

      if (icpData && typeof icpData === "object") {
        const icp = icpData as Record<string, unknown>;
        nextContext.icpSummary = [
          typeof icp.icpDescription === "string" ? icp.icpDescription.trim() : "",
          typeof icp.targetMarket === "string" ? icp.targetMarket.trim() : "",
        ]
          .filter(Boolean)
          .join(" • ");
      }

      if (Array.isArray(interviews) || Array.isArray(conversations)) {
        const interviewList = Array.isArray(interviews) ? interviews as Array<Record<string, unknown>> : [];
        const conversationList = Array.isArray(conversations) ? conversations as Array<Record<string, unknown>> : [];
        const completedInterviews = interviewList.filter((item) => item.status === "completed");
        const signalCount = interviewList.filter((item) => {
          const signal = typeof item.result_signal === "string" ? item.result_signal : "";
          return signal === "interest" || signal === "strong_interest";
        }).length;

        const firstUsefulObjective = interviewList.find((item) =>
          typeof item.research_objectives === "string" && item.research_objectives.trim().length > 0
        );
        const firstUsefulLearning = conversationList.find((item) =>
          typeof item.learned === "string" && item.learned.trim().length > 0
        );

        nextContext.discoverySummary =
          (typeof firstUsefulObjective?.research_objectives === "string" && firstUsefulObjective.research_objectives.trim()) ||
          (typeof firstUsefulLearning?.learned === "string" && firstUsefulLearning.learned.trim()) ||
          "";

        nextContext.discoveryMetrics = [
          interviewList.length ? `Interviews: ${interviewList.length}` : "",
          completedInterviews.length ? `Completed: ${completedInterviews.length}` : "",
          signalCount ? `Positive signals: ${signalCount}` : "",
          conversationList.length ? `Conversations: ${conversationList.length}` : "",
        ].filter(Boolean);
      }

      setProjectContext(nextContext);

      setBlocks(
        GTM_BLOCK_DEFINITIONS.map((definition) => {
          const rawItems =
            gtmData && typeof gtmData === "object" ? (gtmData as Record<string, unknown>)[definition.id] : [];
          const items = isGTMItemArray(rawItems)
            ? rawItems
                .map((item, index) => normalizeIncomingItem(item, index))
                .filter((item): item is GTMItem => Boolean(item))
            : [];

          return {
            ...definition,
            items,
          };
        })
      );
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load GTM strategy.";
      if (message.includes("Unauthenticated") || message.includes("401")) {
        router.push("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveGTM() {
    if (!projectUuid) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Record<string, GTMItem[]> = {};
      for (const block of blocks) {
        payload[block.id] = block.items;
      }

      await projectApi.saveGTM(projectUuid, payload);
      setNotice("GTM strategy saved.");
    } catch (caughtError: unknown) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to save GTM strategy.";
      if (message.includes("Unauthenticated") || message.includes("401")) {
        router.push("/login");
        return;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function addItem(blockId: string) {
    const content = newItemContent.trim();
    if (!content) {
      return;
    }

    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              items: [...block.items, { id: `gtm-item-${Date.now()}`, content }],
            }
          : block
      )
    );

    setNewItemContent("");
    setShowAddModal(null);
  }

  function removeItem(blockId: string, itemId: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? { ...block, items: block.items.filter((item) => item.id !== itemId) }
          : block
      )
    );
  }

  function handleDragStart(blockId: string, itemId: string) {
    setDraggedItem({ blockId, itemId });
  }

  function handleDrop(targetBlockId: string) {
    if (!draggedItem || draggedItem.blockId === targetBlockId) {
      return;
    }

    const sourceBlock = blocks.find((block) => block.id === draggedItem.blockId);
    const movedItem = sourceBlock?.items.find((item) => item.id === draggedItem.itemId);

    if (!movedItem) {
      setDraggedItem(null);
      return;
    }

    setBlocks((current) =>
      current.map((block) => {
        if (block.id === draggedItem.blockId) {
          return {
            ...block,
            items: block.items.filter((item) => item.id !== draggedItem.itemId),
          };
        }

        if (block.id === targetBlockId) {
          return {
            ...block,
            items: [...block.items, { ...movedItem, id: `gtm-item-${Date.now()}` }],
          };
        }

        return block;
      })
    );

    setDraggedItem(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="h-7 w-64 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="min-h-[240px] animate-pulse rounded-3xl border border-slate-200 bg-white p-5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900 px-6 py-8 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Go-To-Market</p>
              <h1 className="mt-3 text-3xl font-semibold">Build a beginner-friendly launch plan</h1>
              <p className="mt-3 text-sm leading-7 text-slate-200/88">
                This page does not ask you to rewrite your problem, ICP, market, or discovery work.
                It pulls that project context from the database and guides you through the decisions needed to launch.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Completion</p>
                <p className="mt-2 text-2xl font-semibold">{completion}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Blocks Filled</p>
                <p className="mt-2 text-2xl font-semibold">
                  {blocks.filter((block) => block.items.length > 0).length}/{blocks.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Insights Added</p>
                <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200 bg-slate-50/80 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Read the project context first so your GTM stays connected to real research.",
            "Write one clear message before choosing channels or tactics.",
            "Start with one channel, one offer, and one founder sales flow.",
            "Use a simple 30-day test plan before trying to scale.",
          ].map((question) => (
            <div key={question} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {question}
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <button
          onClick={saveGTM}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Strategy"}
        </button>
      </div>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Problem</p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
            {projectContext.problemStatement || "No problem statement saved for this project yet."}
          </p>
          {projectContext.targetUser ? (
            <p className="mt-3 text-xs text-slate-500">Target user: {projectContext.targetUser}</p>
          ) : null}
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Market Size</p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
            {projectContext.marketSummary || "No market sizing summary saved for this project yet."}
          </p>
          {projectContext.marketNumbers.length ? (
            <p className="mt-3 text-xs text-slate-500">{projectContext.marketNumbers.join(" • ")}</p>
          ) : null}
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ICP</p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
            {projectContext.icpSummary || "No ICP summary saved for this project yet."}
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Customer Discovery</p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
            {projectContext.discoverySummary || "No customer discovery summary saved for this project yet."}
          </p>
          {projectContext.discoveryMetrics.length ? (
            <p className="mt-3 text-xs text-slate-500">{projectContext.discoveryMetrics.join(" • ")}</p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {blocks.map((block) => {
          const Icon = block.icon;

          return (
            <section
              key={block.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(block.id)}
              className={`min-h-[320px] rounded-[1.8rem] border ${block.borderColor} ${block.color} p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-white p-2 shadow-sm">
                      <Icon className="h-4 w-4 text-slate-700" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">{block.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{block.description}</p>
                  <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-xs text-slate-500">{block.prompt}</p>
                </div>

                <button
                  onClick={() => {
                    setShowAddModal(block.id);
                    setNewItemContent("");
                  }}
                  className="rounded-xl bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {block.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(block.id, item.id)}
                    onDragEnd={() => setDraggedItem(null)}
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <GripVertical className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-grab text-slate-300" />
                    <p className="flex-1 text-sm leading-6 text-slate-700">{item.content}</p>
                    <button
                      onClick={() => removeItem(block.id, item.id)}
                      className="rounded-lg p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {block.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-400">
                    No insight added yet.
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-xl rounded-[1.8rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add GTM insight
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {blocks.find((block) => block.id === showAddModal)?.prompt}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={newItemContent}
              onChange={(event) => setNewItemContent(event.target.value)}
              placeholder={
                blocks.find((block) => block.id === showAddModal)?.placeholder ?? "Add your GTM insight..."
              }
              rows={5}
              className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-sky-400"
            />

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(null)}
                className="rounded-xl px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => addItem(showAddModal)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Insight
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
