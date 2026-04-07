"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Wand2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProjectPayload } from "@/features/projects/services/project-service";

export interface CreateProjectDraft {
  name: string;
  vision: string;
  problem: string;
  currentAlternative: string;
  urgency: string;
  targetUser: string;
  triggerMoment: string;
  solution: string;
  valueProposition: string;
  wedge: string;
  marketSize: string;
  customerSegments: string;
  channels: string;
  revenueStreams: string;
  costStructure: string;
  unfairAdvantage: string;
  goToMarket: string;
}

type DraftKey = keyof CreateProjectDraft;

interface StepDefinition {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  helper: string;
  mode: "core" | "advanced";
  required: DraftKey[];
  fields: Array<{
    key: DraftKey;
    label: string;
    placeholder: string;
    tall?: boolean;
  }>;
}

export interface ProjectCreationWizardProps {
  value: CreateProjectDraft;
  onChange: (value: CreateProjectDraft) => void;
  onSubmit: (seed: CreateProjectPayload) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const guidedSteps: StepDefinition[] = [
  {
    id: "identity",
    eyebrow: "Step 1",
    title: "Name the project and the ambition",
    description: "Start with the minimum identity of the project before going into strategy.",
    helper: "You only need a clear name and one-line ambition to anchor the rest.",
    mode: "core",
    required: ["name"],
    fields: [
      { key: "name", label: "Project name", placeholder: "Teranga Cockpit" },
      { key: "vision", label: "One-line vision", placeholder: "What do you want this project to become?" }
    ]
  },
  {
    id: "problem",
    eyebrow: "Step 2",
    title: "Clarify the pain",
    description: "Do not start from features. Start from the friction that keeps repeating.",
    helper: "A strong problem is concrete, recurring, and expensive in time, money, or clarity.",
    mode: "core",
    required: ["problem", "currentAlternative", "urgency"],
    fields: [
      { key: "problem", label: "Problem statement", placeholder: "What keeps happening that feels broken?", tall: true },
      { key: "currentAlternative", label: "Current workaround", placeholder: "How are people handling it today?", tall: true },
      { key: "urgency", label: "Why now", placeholder: "Why does this matter now instead of later?", tall: true }
    ]
  },
  {
    id: "icp",
    eyebrow: "Step 3",
    title: "Lock the first user",
    description: "Pick the narrow first segment you can understand and reach.",
    helper: "The first user should be sharp enough that you can picture a real person.",
    mode: "core",
    required: ["targetUser", "triggerMoment", "wedge"],
    fields: [
      { key: "targetUser", label: "Target user", placeholder: "Role, company stage, context, team size...", tall: true },
      { key: "triggerMoment", label: "Buying trigger", placeholder: "What event pushes them to look for a solution?", tall: true },
      { key: "wedge", label: "Starting wedge", placeholder: "What first narrow segment can you realistically win?", tall: true }
    ]
  },
  {
    id: "solution",
    eyebrow: "Step 4",
    title: "State the product and the value",
    description: "Now explain how the product changes the situation for that user.",
    helper: "Your value proposition should connect directly to the current workaround.",
    mode: "core",
    required: ["solution", "valueProposition"],
    fields: [
      { key: "solution", label: "Solution outline", placeholder: "What does the product actually do?", tall: true },
      { key: "valueProposition", label: "Value proposition", placeholder: "Why is this clearly better than what they do now?", tall: true }
    ]
  },
  {
    id: "market",
    eyebrow: "Step 5",
    title: "Frame the opportunity",
    description: "You do not need a huge market essay. You need a believable starting market.",
    helper: "Keep TAM, SAM, SOM practical and tied to the wedge.",
    mode: "advanced",
    required: ["marketSize"],
    fields: [
      { key: "marketSize", label: "TAM / SAM / SOM notes", placeholder: "Market size assumptions and starting niche.", tall: true }
    ]
  },
  {
    id: "business-model",
    eyebrow: "Step 6",
    title: "Build the business model blocks",
    description: "Not one blob field. The actual pieces that explain how this business can work.",
    helper: "Write the version that is true today, not a fantasy version for later.",
    mode: "advanced",
    required: ["customerSegments", "channels", "revenueStreams"],
    fields: [
      { key: "customerSegments", label: "Customer segments", placeholder: "Who pays, who uses, who influences?", tall: true },
      { key: "channels", label: "Channels", placeholder: "How will they discover and buy the product?", tall: true },
      { key: "revenueStreams", label: "Revenue streams", placeholder: "Subscription, setup, usage, annual...", tall: true },
      { key: "costStructure", label: "Cost structure", placeholder: "Main costs to deliver and support the product.", tall: true },
      { key: "unfairAdvantage", label: "Advantage / moat", placeholder: "Why you can win or move faster than others?", tall: true }
    ]
  },
  {
    id: "gtm",
    eyebrow: "Step 7",
    title: "Plan the first momentum loop",
    description: "Keep GTM manual and concrete. First users before scale.",
    helper: "Think first outreach, proof asset, channel, and conversion step.",
    mode: "advanced",
    required: ["goToMarket"],
    fields: [
      { key: "goToMarket", label: "Go-to-market plan", placeholder: "How will you get your first users and proof?", tall: true }
    ]
  }
];

const starterRoutes = [
  {
    id: "startup",
    label: "Validate idea",
    title: "Start with the problem and first user",
    description: "Best when you want to move fast from idea to first project structure."
  },
  {
    id: "discovery",
    label: "Discovery",
    title: "Turn conversations into a sharper direction",
    description: "Useful when the project exists but the customer signal still feels blurry."
  },
  {
    id: "pitch",
    label: "Pitch",
    title: "Shape a cleaner project story",
    description: "Good when you want a more investor or partner ready structure."
  }
] as const;

export function getEmptyCreateProjectDraft(): CreateProjectDraft {
  return {
    name: "",
    vision: "",
    problem: "",
    currentAlternative: "",
    urgency: "",
    targetUser: "",
    triggerMoment: "",
    solution: "",
    valueProposition: "",
    wedge: "",
    marketSize: "",
    customerSegments: "",
    channels: "",
    revenueStreams: "",
    costStructure: "",
    unfairAdvantage: "",
    goToMarket: ""
  };
}

function updateField(value: CreateProjectDraft, key: DraftKey, nextValue: string): CreateProjectDraft {
  return {
    ...value,
    [key]: nextValue
  };
}

function compactLines(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean).join("\n");
}

export function buildCreateProjectSeed(value: CreateProjectDraft): CreateProjectPayload {
  const problemValidation = compactLines([
    `Problem: ${value.problem}`,
    `Current workaround: ${value.currentAlternative}`,
    `Urgency signal: ${value.urgency}`
  ]);
  const icp = compactLines([
    `Target user: ${value.targetUser}`,
    `Buying trigger: ${value.triggerMoment}`,
    `Wedge: ${value.wedge}`
  ]);
  const businessModelCanvas = compactLines([
    `Value proposition: ${value.valueProposition}`,
    `Customer segments: ${value.customerSegments}`,
    `Channels: ${value.channels}`,
    `Revenue streams: ${value.revenueStreams}`,
    `Cost structure: ${value.costStructure}`,
    `Advantage: ${value.unfairAdvantage}`
  ]);
  const tam = compactLines([
    `Starting wedge: ${value.wedge}`,
    `Market notes: ${value.marketSize}`
  ]);

  return {
    founderNote: compactLines([value.vision, value.goToMarket]),
    stepValues: {
      "define-problem": compactLines([value.problem, value.currentAlternative]),
      "target-user": compactLines([value.targetUser, value.triggerMoment]),
      "validate-urgency": value.urgency.trim(),
      "outline-solution": compactLines([value.solution, value.valueProposition]),
      "business-opportunity": compactLines([value.wedge, value.marketSize, value.revenueStreams])
    },
    canvasValues: {
      "problem-validation": problemValidation,
      "customer-discovery": compactLines([
        `Current workaround: ${value.currentAlternative}`,
        `Buying trigger: ${value.triggerMoment}`,
        `Urgency signal: ${value.urgency}`
      ]),
      icp,
      tam,
      "business-model-canvas": businessModelCanvas,
      "go-to-market": value.goToMarket.trim()
    }
  };
}

function getStepCompletion(step: StepDefinition, value: CreateProjectDraft) {
  const completed = step.required.filter((field) => value[field].trim()).length;
  return step.required.length === 0 ? 100 : Math.round((completed / step.required.length) * 100);
}

type WizardMode = "simple" | "standard";

function getVisibleSteps(mode: WizardMode) {
  return guidedSteps.filter((step) => mode === "standard" || step.mode === "core");
}

export function ProjectCreationWizard({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Create project"
}: ProjectCreationWizardProps) {
  const [mode, setMode] = useState<WizardMode>("simple");
  const [expandedStepId, setExpandedStepId] = useState<string | null>(guidedSteps[0].id);
  const [selectedRoute, setSelectedRoute] = useState<(typeof starterRoutes)[number]["id"] | null>(null);

  const visibleSteps = useMemo(() => getVisibleSteps(mode), [mode]);
  const activeIndex = visibleSteps.findIndex((step) => step.id === expandedStepId);
  const activeStep = activeIndex >= 0 ? visibleSteps[activeIndex] : null;
  const requiredFields = useMemo(
    () => Array.from(new Set(guidedSteps.flatMap((step) => step.required))),
    []
  );

  const overallCompletion = useMemo(() => {
    return Math.round(
      (requiredFields.filter((field) => value[field].trim()).length / requiredFields.length) * 100
    );
  }, [requiredFields, value]);

  const essentialsReady =
    Boolean(value.name.trim()) &&
    Boolean(value.problem.trim()) &&
    Boolean(value.targetUser.trim()) &&
    Boolean(value.solution.trim());
  const completedCoreSteps = guidedSteps.filter(
    (step) => step.mode === "core" && getStepCompletion(step, value) === 100
  ).length;
  const activeStepCompletion = activeStep ? getStepCompletion(activeStep, value) : 0;
  const coreStepsCount = guidedSteps.filter((step) => step.mode === "core").length;
  const activeStepEstimate = activeStep ? Math.max(1, Math.ceil(activeStep.fields.length * 0.75)) : 1;

  useEffect(() => {
    if (expandedStepId && !visibleSteps.some((step) => step.id === expandedStepId)) {
      setExpandedStepId(visibleSteps[0].id);
    }
  }, [expandedStepId, visibleSteps]);

  function selectStep(stepId: string) {
    setExpandedStepId((current) => (current === stepId ? null : stepId));
  }

  function moveStep(direction: -1 | 1) {
    const fallbackIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = Math.min(visibleSteps.length - 1, Math.max(0, fallbackIndex + direction));
    setExpandedStepId(visibleSteps[nextIndex].id);
  }

  function fillStarterDraft(kind: "startup" | "discovery" | "pitch") {
    const drafts = {
      startup: {
        vision: "Build a fast founder workspace that turns startup thinking into clear next moves.",
        problem: "Founders lose time because strategy, conversations, and next actions are scattered across too many tools.",
        currentAlternative: "They juggle WhatsApp, spreadsheets, Notes, memory, and slide decks to keep the project moving.",
        urgency: "This creates restart friction after every meeting and slows down validation when speed matters most.",
        targetUser: "Solo founders and small startup teams shaping a new offer with limited time and structure.",
        triggerMoment: "Right after a customer call, investor prep, or a week where progress feels blurry.",
        solution: "A guided project workspace that captures the core narrative, discovery notes, and immediate priorities in one place.",
        valueProposition: "It shortens time to first value by turning scattered input into a usable project structure from day one.",
        wedge: "Founders preparing their first validation sprint or first fundraising-ready narrative."
      },
      discovery: {
        problem: "Teams hear customer pain during calls but fail to convert it into structured project decisions.",
        currentAlternative: "Insights stay in spreadsheets and loose notes, so the same questions come back every week.",
        urgency: "Without a simple framework, teams keep interviewing without learning faster.",
        targetUser: "Early-stage teams running founder-led discovery calls.",
        triggerMoment: "After two or three calls that produced notes but no clear next decision.",
        wedge: "Founders who need a repeatable customer conversation framework before scaling outreach."
      },
      pitch: {
        vision: "Move from raw startup idea to a pitch-ready project story without heavy setup.",
        solution: "A structured workspace aligned with core startup deck standards: problem, user, solution, market, business model, and GTM.",
        valueProposition: "It helps founders produce a cleaner deck story and a more usable execution workspace at the same time.",
        marketSize: "Start with early-stage founders building a first deck, then expand to accelerators and startup studios.",
        customerSegments: "Founders, startup programs, venture studios.",
        channels: "Direct demos, founder communities, accelerator partnerships.",
        revenueStreams: "Subscription, setup support, and team plans.",
        goToMarket: "Lead with pitch readiness, then expand into daily execution support."
      }
    } satisfies Record<string, Partial<CreateProjectDraft>>;

    onChange({
      ...value,
      ...drafts[kind]
    });
    setSelectedRoute(kind);

    if (kind === "pitch") {
      setMode("standard");
    }
  }

  return (
    <div
      className="mx-auto min-h-[78vh] w-full max-w-[1180px] overflow-hidden rounded-[2.25rem] border border-[#d4c6b2] bg-[linear-gradient(180deg,#fbf5ec_0%,#f4ebdf_100%)] text-slate-950 shadow-[0_34px_90px_rgba(69,45,18,0.14)] lg:grid lg:grid-cols-[340px_minmax(0,1fr)]"
    >
      <aside className="flex flex-col bg-[linear-gradient(180deg,#f7efe5_0%,#eadccc_100%)] px-6 py-6 text-[#24170f] sm:px-7">
        <div className="flex-1">
          <div className="space-y-3">
          {visibleSteps.map((step) => {
            const stepCompletion = getStepCompletion(step, value);
            const active = step.id === expandedStepId;

            return (
              <div key={step.id} className="space-y-3">
                <button
                  type="button"
                  onClick={() => selectStep(step.id)}
                  className={`w-full rounded-[1.35rem] border px-5 py-5 text-left transition ${
                    active
                      ? "border-[#f3c590] bg-[linear-gradient(180deg,#fff4e7_0%,#f2ddc6_100%)] text-[#23160e] shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
                      : "border-[#dbcab5] bg-white/76 text-[#24170f] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] uppercase tracking-[0.18em] ${active ? "text-[#7f5a35]" : "text-[#7d6246]"}`}>
                          {step.eyebrow}
                        </span>
                        <span className={`text-xs ${active ? "text-[#7f5a35]" : "text-[#7d6246]"}`}>
                          {stepCompletion}%
                        </span>
                      </div>
                      <p className={`mt-2 pr-8 text-sm font-semibold leading-6 ${active ? "text-[#23160e]" : "text-[#24170f]"}`}>
                        {step.title}
                      </p>
                      <p className={`mt-1 text-xs leading-5 ${active ? "text-[#7f5a35]" : "text-[#7d6246]"}`}>
                        {active ? "Click again to close" : "Open this step"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {stepCompletion === 100 ? (
                        <CheckCircle2 className={`h-4 w-4 ${active ? "text-[#23160e]" : "text-[#f4b35d]"}`} />
                      ) : null}
                      <ChevronDown className={`h-4 w-4 transition ${active ? "rotate-180 text-[#7f5a35]" : "text-[#7d6246]"}`} />
                    </div>
                  </div>
                </button>
                {!active ? <div className="h-px bg-[#dbcab5]" /> : null}
              </div>
            );
          })}
          </div>
        </div>

        <div className="mt-6 border-t border-[#dbcab5] pt-6">
          <div className="flex items-center gap-2 text-[#24170f]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.18em] text-[#7d6246]">Quick Start</span>
          </div>
          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-[#24170f]">
            Use a starter draft inspired by standard startup structure and discovery flow, then adjust only what matters.
          </p>
          <div className="mt-4 space-y-2">
            <Button variant="secondary" className="w-full justify-between bg-white text-[#20140e]" onClick={() => fillStarterDraft("startup")}>
              Startup standard
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between border border-[#dbcab5] bg-white/75 text-[#24170f] hover:bg-white" onClick={() => fillStarterDraft("discovery")}>
              Discovery flow
              <Wand2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between border border-[#dbcab5] bg-white/75 text-[#24170f] hover:bg-white" onClick={() => fillStarterDraft("pitch")}>
              Pitch-ready blocks
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <section className="bg-[linear-gradient(180deg,#fffaf3_0%,#f5ecde_100%)] px-5 py-5 text-[#24170f] sm:px-6 sm:py-6">
        <div className="rounded-[1.8rem] border border-[#e2d3c1] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,248,240,0.94))] p-5 text-[#24170f] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:p-6">
          <div className="rounded-[1.6rem] border border-[#eadccc] bg-[linear-gradient(180deg,#fff8ef_0%,#f7ecdc_100%)] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.22em] text-[#8d6f53]">Start Route</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#24170f]">
                  Pick a route instead of starting from a blank form
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#6b5341]">
                  The strongest onboarding flows get you to a meaningful artifact fast. Choose the route that matches
                  your intent, then refine the project instead of filling every field from zero.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[#e6d6c3] bg-white/80 px-4 py-3 text-sm text-[#6b5341]">
                <span className="font-medium text-[#24170f]">{completedCoreSteps}</span> of {coreStepsCount} core steps ready
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {starterRoutes.map((route) => {
                const selected = selectedRoute === route.id;

                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => fillStarterDraft(route.id)}
                    className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                      selected
                        ? "border-[#24170f] bg-[#ead8c1] text-[#24170f] shadow-[0_16px_36px_rgba(36,23,15,0.12)]"
                        : "border-[#e2d3c1] bg-white/84 text-[#24170f] hover:-translate-y-0.5 hover:bg-white"
                    }`}
                  >
                    <p className={`text-[11px] uppercase tracking-[0.2em] ${selected ? "text-[#8d6f53]" : "text-[#8d6f53]"}`}>
                      {route.label}
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#24170f]">
                      {route.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6b5341]">
                      {route.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e9dccd] pb-5">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8d6f53]">
                {activeStep?.eyebrow ?? "Setup"}
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#24170f]">
                {activeStep?.title ?? "Open a step from the left"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6b5341]">
                {activeStep?.description ?? "Choose the block you want to work on and complete the core logic of the project."}
              </p>
            </div>
            <div className="min-w-[180px] rounded-[1.4rem] border border-[#eadccc] bg-white/72 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8d6f53]">Current Step</p>
              <p className="mt-2 text-2xl font-semibold text-[#24170f]">{activeStepCompletion}%</p>
              <p className="mt-1 text-sm text-[#6b5341]">
                Step {Math.max(activeIndex + 1, 1)} of {visibleSteps.length} • about {activeStepEstimate} min
              </p>
            </div>
          </div>

          {activeStep ? (
            <div className="mt-6">
              <div className="rounded-[1.35rem] border border-[#ebdcc9] bg-[linear-gradient(180deg,#fffefd_0%,#f8f0e6_100%)] px-5 py-4 text-sm leading-7 text-[#5f4937]">
                {activeStep.helper}
              </div>

              <div className="mt-7 grid gap-5">
                {activeStep.fields.map((field) => (
                  <div key={field.key} className="rounded-[1.5rem] border border-[#eadccc] bg-white/76 px-5 py-5 text-[#24170f] shadow-[0_10px_24px_rgba(80,54,29,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-semibold text-[#23160e]">{field.label}</label>
                      {activeStep.required.includes(field.key) ? (
                        <span className="rounded-full bg-[#f7e6d2] px-3 py-1 text-xs text-[#8a5a2e]">required</span>
                      ) : null}
                    </div>
                    {field.tall ? (
                      <Textarea
                        value={value[field.key]}
                        onChange={(event) => onChange(updateField(value, field.key, event.target.value))}
                        placeholder={field.placeholder}
                        className="mt-4 min-h-32 rounded-[1.35rem] border-[#e4d3bf] bg-[#fffdfa] px-5 py-4 text-[#24170f] placeholder:text-[#9a826b]"
                      />
                    ) : (
                      <Input
                        value={value[field.key]}
                        onChange={(event) => onChange(updateField(value, field.key, event.target.value))}
                        placeholder={field.placeholder}
                        className="mt-4 rounded-[1.35rem] border-[#e4d3bf] bg-[#fffdfa] px-5 py-4 text-[#24170f] placeholder:text-[#9a826b]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#eadccc] pt-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="ghost" className="border-[#e0cfbc] bg-white/80 text-[#2b1d12]" onClick={() => moveStep(-1)} disabled={activeIndex <= 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  {activeIndex < visibleSteps.length - 1 ? (
                    <Button className="bg-[#1f1612] text-white hover:bg-[#2a1d17]" onClick={() => moveStep(1)}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button className="bg-[#1f1612] text-white hover:bg-[#2a1d17]" onClick={() => onSubmit(buildCreateProjectSeed(value))} disabled={!essentialsReady}>
                      {submitLabel}
                    </Button>
                  )}
                  {mode === "simple" ? (
                    <Button variant="secondary" className="bg-[#f0dfc8] text-[#2b1d12]" onClick={() => setMode("standard")}>
                      Open advanced blocks
                    </Button>
                  ) : null}
                </div>
                <div className="text-sm text-[#6b5341]">
                  {completedCoreSteps}/{coreStepsCount} core sections ready
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-[#d7c6b0] bg-white/56 px-6 py-12 text-center">
              <p className="text-lg font-medium text-[#2b1d12]">Select a step from the left panel</p>
              <p className="mt-2 text-sm leading-7 text-[#6b5341]">
                The form opens here so you can focus on one decision block at a time.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
