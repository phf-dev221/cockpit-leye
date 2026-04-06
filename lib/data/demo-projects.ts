import type {
  DemoBoardCard,
  DemoBusinessSnapshot,
  DemoCanvas,
  DemoCanvasKey,
  DemoCalendarItem,
  DemoConversation,
  DemoFocusItem,
  DemoFileRecord,
  DemoNotification,
  DemoProject,
  DemoReminder,
  DemoSprintRecord,
  DemoStep,
  DemoStepKey,
  DemoTask
} from "@/types";
import { slugifyProjectName } from "@/lib/utils";

const stepBlueprints: Array<Omit<DemoStep, "value" | "status">> = [
  {
    id: "define-problem",
    title: "Define your problem",
    shortLabel: "Problem",
    description: "Name the friction you want to remove.",
    prompt: "What painful job or frustration are you solving?",
    placeholder: "People waste time because...",
    helper: "One sharp sentence is better than a vague paragraph."
  },
  {
    id: "target-user",
    title: "Identify your target user",
    shortLabel: "User",
    description: "Focus on the first user segment that feels the pain most.",
    prompt: "Who feels this pain enough to care now?",
    placeholder: "Solo founders, tiny teams, operators...",
    helper: "Choose one first user, not everyone."
  },
  {
    id: "validate-urgency",
    title: "Validate urgency",
    shortLabel: "Urgency",
    description: "Capture why this matters now and what delay costs them.",
    prompt: "Why is this urgent right now?",
    placeholder: "They lose time, money, momentum, trust...",
    helper: "Urgency turns curiosity into action."
  },
  {
    id: "outline-solution",
    title: "Outline your solution",
    shortLabel: "Solution",
    description: "Describe the simplest path from pain to relief.",
    prompt: "What is the lightest useful version of the solution?",
    placeholder: "A lightweight workspace that helps...",
    helper: "Keep it simple enough to demo fast."
  },
  {
    id: "business-opportunity",
    title: "Map your business opportunity",
    shortLabel: "Opportunity",
    description: "Translate the idea into value, monetization, and upside.",
    prompt: "How could this create value and become a business?",
    placeholder: "Subscription, retained teams, premium analytics...",
    helper: "Turn the insight into a credible business angle."
  }
];

function createSteps(values?: Partial<Record<DemoStepKey, string>>, currentStepId?: DemoStepKey) {
  return stepBlueprints.map((step, index) => {
    const value = values?.[step.id] ?? "";
    const status = value
      ? "done"
      : currentStepId
        ? step.id === currentStepId
          ? "active"
          : index < stepBlueprints.findIndex((item) => item.id === currentStepId)
            ? "done"
            : "todo"
        : index === 0
          ? "active"
          : "todo";

    return {
      ...step,
      value,
      status
    } satisfies DemoStep;
  });
}

export function buildWarning(project: DemoProject) {
  const completedCount = project.steps.filter((step) => step.status === "done").length;

  if (completedCount === 0) {
    return "Start by defining the problem. A crisp problem statement reduces everything else.";
  }

  if (project.currentStepId === "validate-urgency") {
    return "Do not overthink. Find one sign that proves the pain is urgent now.";
  }

  if (completedCount < project.steps.length) {
    return `You are in ${project.steps.find((step) => step.id === project.currentStepId)?.title}. Push one concrete answer forward.`;
  }

  return "The core narrative is ready. Turn this into a decision, a sprint, or a live demo.";
}

export function buildStageLabel(project: DemoProject) {
  const completedCount = project.steps.filter((step) => step.status === "done").length;

  if (completedCount <= 1) {
    return "Idea Framing";
  }

  if (completedCount <= 3) {
    return "Validation Flow";
  }

  if (completedCount < project.steps.length) {
    return "Solution Mapping";
  }

  return "Demo Ready";
}

function defaultTasks(): DemoTask[] {
  return [
    { id: "task-1", title: "Write the problem in one sentence", done: false },
    { id: "task-2", title: "Choose one first target user", done: false },
    { id: "task-3", title: "Capture one urgency proof point", done: false }
  ];
}

function defaultFocusItems(currentStepTitle: string): DemoFocusItem[] {
  return [
    { id: "focus-1", title: "Next move", value: currentStepTitle },
    { id: "focus-2", title: "Best page for work", value: "Sections" },
    { id: "focus-3", title: "Fastest capture flow", value: "Log conversations in the section workspace" }
  ];
}

function defaultReminders(): DemoReminder[] {
  return [
    { id: "rem-1", title: "Review today's active step", dueLabel: "Today 09:00", done: false },
    { id: "rem-2", title: "Log one real user signal", dueLabel: "Today 16:00", done: false }
  ];
}

function defaultCalendar(): DemoCalendarItem[] {
  return [
    { id: "cal-1", dayLabel: "Mon", timeLabel: "09:00", title: "Focus block", type: "focus" },
    { id: "cal-2", dayLabel: "Tue", timeLabel: "14:00", title: "Discovery call", type: "call" },
    { id: "cal-3", dayLabel: "Thu", timeLabel: "18:00", title: "Weekly review", type: "review" }
  ];
}

function defaultBoardCards(): DemoBoardCard[] {
  return [
    { id: "card-1", title: "Sharpen the problem", detail: "One sentence only", lane: "now", accent: "pine" },
    { id: "card-2", title: "Pick first user", detail: "Do not widen the ICP", lane: "next", accent: "ember" },
    { id: "card-3", title: "Collect urgency proof", detail: "One real signal", lane: "later", accent: "ink" }
  ];
}

function defaultCanvases(): DemoCanvas[] {
  return [
    {
      id: "problem-validation",
      title: "Problem Validation",
      prompt: "What painful job keeps repeating, and what proof tells you it is real?",
      helper: "Write the pain, the current workaround, and one proof signal.",
      value: ""
    },
    {
      id: "customer-discovery",
      title: "Customer Discovery",
      prompt: "What are people doing today, and what words do they use to describe the pain?",
      helper: "Capture concrete quotes and current habits.",
      value: ""
    },
    {
      id: "icp",
      title: "ICP",
      prompt: "Who is the sharpest first customer profile for this product?",
      helper: "Role, context, urgency, team size, and buying trigger.",
      value: ""
    },
    {
      id: "tam",
      title: "TAM / Opportunity",
      prompt: "How large is the market opportunity, and what is the realistic starting wedge?",
      helper: "Keep it practical: TAM, SAM, SOM, and first niche.",
      value: ""
    },
    {
      id: "conversation-framework",
      title: "Conversation Framework",
      prompt: "How will you start discovery calls, build trust, and surface the real problem?",
      helper: "Think opening, trust, probing, and what to listen for.",
      value: ""
    },
    {
      id: "business-model-canvas",
      title: "Business Model Canvas",
      prompt: "How do value, channels, revenue, costs, and partners fit together?",
      helper: "Write only the blocks that matter for the current stage.",
      value: ""
    },
    {
      id: "go-to-market",
      title: "Go-To-Market",
      prompt: "What is the lightest path to get the first users, proof, and momentum?",
      helper: "Channel, message, proof asset, and first conversion step.",
      value: ""
    }
  ];
}

function defaultNotifications(): DemoNotification[] {
  return [
    {
      id: "notif-1",
      title: "Review active step",
      detail: "Make sure the current section still reflects what you learned this week.",
      whenLabel: "Today 09:00",
      read: false,
      kind: "reminder"
    },
    {
      id: "notif-2",
      title: "Momentum check",
      detail: "You have been on the same strategic block for a while. Decide or move.",
      whenLabel: "Today 17:00",
      read: false,
      kind: "signal"
    }
  ];
}

function defaultConversations(): DemoConversation[] {
  return [];
}

function defaultFiles(): DemoFileRecord[] {
  return [];
}

function defaultSprint(): DemoSprintRecord {
  return {
    goal: "Validate the problem and sharpen the first user profile.",
    duration: "5 days",
    review: "Urgency is real. Messaging still needs simplification.",
    retrospective: "Calls happened late in the week. Start them earlier next sprint.",
    tasks: [
      { id: "sprint-task-1", title: "Book 3 founder conversations", status: "Done" },
      { id: "sprint-task-2", title: "Rewrite the ICP in one paragraph", status: "In Progress" },
      { id: "sprint-task-3", title: "Draft the BMC assumptions", status: "To Do" }
    ]
  };
}

function defaultBusinessSnapshot(): DemoBusinessSnapshot {
  return {
    market: {
      tam: 500000,
      sam: 120000,
      som: 12000,
      note: "Start with solo founders and tiny startup teams before expanding."
    },
    economics: {
      productionCost: 18,
      monthlyPrice: 49,
      runwayMonths: 7
    },
    build: {
      weeklyHoursAvailable: 18,
      hoursSpent: 42,
      mvpHoursTarget: 140,
      calendarConnectionLabel: "Google Calendar sync planned"
    },
    goToMarket: {
      firstClientTargetDays: 45,
      clientsAcquired: 1,
      acquisitionFrequencyPerMonth: 2,
      primaryChannel: "Founder communities and direct outreach"
    }
  };
}

export function normalizeDemoProject(project: Partial<DemoProject> & Pick<DemoProject, "name" | "id">): DemoProject {
  const currentStepId = project.currentStepId ?? "define-problem";
  const incomingCanvasValues = Object.fromEntries(
    (project.canvases ?? []).map((canvas) => [canvas.id, canvas.value])
  ) as Partial<Record<DemoCanvasKey, string>>;
  const projectWithDefaults: DemoProject = {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt ?? new Date().toISOString(),
    dayCount: project.dayCount ?? 1,
    currentStepId,
    stageLabel: project.stageLabel ?? "Idea Framing",
    warning: project.warning ?? "",
    founderNote: project.founderNote ?? "",
    steps: createSteps(
      Object.fromEntries((project.steps ?? []).map((step) => [step.id, step.value])) as Partial<
        Record<DemoStepKey, string>
      >,
      currentStepId
    ),
    focusItems:
      project.focusItems?.length
        ? project.focusItems
        : defaultFocusItems(
            stepBlueprints.find((step) => step.id === currentStepId)?.title ?? "Define your problem"
          ),
    quickTasks: project.quickTasks?.length ? project.quickTasks : defaultTasks(),
    decisions: project.decisions ?? [],
    reminders: project.reminders?.length ? project.reminders : defaultReminders(),
    calendar: project.calendar?.length ? project.calendar : defaultCalendar(),
    boardCards: project.boardCards?.length ? project.boardCards : defaultBoardCards(),
    canvases: defaultCanvases().map((canvas) => ({
      ...canvas,
      value: incomingCanvasValues[canvas.id] ?? canvas.value
    })),
    notifications: project.notifications?.length ? project.notifications : defaultNotifications(),
    conversations: project.conversations?.length ? project.conversations : defaultConversations(),
    files: project.files?.length ? project.files : defaultFiles(),
    sprint: project.sprint ?? defaultSprint(),
    business: {
      market: {
        ...defaultBusinessSnapshot().market,
        ...project.business?.market
      },
      economics: {
        ...defaultBusinessSnapshot().economics,
        ...project.business?.economics
      },
      build: {
        ...defaultBusinessSnapshot().build,
        ...project.business?.build
      },
      goToMarket: {
        ...defaultBusinessSnapshot().goToMarket,
        ...project.business?.goToMarket
      }
    }
  };

  return {
    ...projectWithDefaults,
    stageLabel: buildStageLabel(projectWithDefaults),
    warning: buildWarning(projectWithDefaults)
  };
}

export function createDemoProject(
  name: string,
  seed?: {
    founderNote?: string;
    stepValues?: Partial<Record<DemoStepKey, string>>;
    canvasValues?: Partial<Record<DemoCanvasKey, string>>;
  }
): DemoProject {
  const canvases = defaultCanvases().map((canvas) => ({
    ...canvas,
    value: seed?.canvasValues?.[canvas.id] ?? ""
  }));
  const project = normalizeDemoProject({
    id: slugifyProjectName(name),
    name,
    currentStepId: "define-problem",
    founderNote: seed?.founderNote ?? "",
    steps: createSteps(seed?.stepValues, "define-problem"),
    canvases,
    business: defaultBusinessSnapshot()
  });

  return project;
}

export const seededDemoProjects: DemoProject[] = [
  createDemoProject("Teranga Cockpit")
];

