"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  FolderOpen,
  Grip,
  Info,
  Inbox,
  Lightbulb,
  MessageSquare,
  MessageSquarePlus,
  Rocket,
  Sparkles,
  TimerReset,
  Trash2,
  Users,
  Wallet
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoreSetupCard } from "@/features/projects/components/core-setup-card";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { LazyDeskCard } from "@/features/projects/components/lazy-desk-card";
import { ProjectSidebar } from "@/features/projects/components/project-sidebar";
import { QuickTasksCard } from "@/features/projects/components/quick-tasks-card";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useUiStore } from "@/store/ui-store";
import type { DemoCanvasKey, DemoProject, DemoStepKey, DemoWorkspaceView } from "@/types";

const tabs = [
  { id: "overview", label: "Pilotage" },
  { id: "today", label: "Today" },
  { id: "capture", label: "Capture" },
  { id: "strategy", label: "Strategy" },
  { id: "records", label: "Records" },
  { id: "planner", label: "Planner" },
  { id: "sprint", label: "Sprint" },
  { id: "desk", label: "Desk" }
] as const satisfies Array<{ id: DemoWorkspaceView; label: string }>;

const sprintColumns = ["To Do", "In Progress", "Done"] as const;

const samples: Record<DemoStepKey, string> = {
  "define-problem": "Founders waste time because notes, conversations and next decisions live in different places.",
  "target-user": "Solo founders and tiny startup teams validating ideas while still shipping.",
  "validate-urgency": "They lose momentum every week, forget what changed after calls, and stay stuck too long.",
  "outline-solution": "A lightweight founder cockpit that guides thinking, captures proof and points to the next action.",
  "business-opportunity": "A subscription product for founders who want faster validation and clearer execution."
};

function getCompletion(project: DemoProject) {
  return Math.round((project.steps.filter((step) => step.value.trim()).length / project.steps.length) * 100);
}

function getCurrentStep(project: DemoProject) {
  return project.steps.find((step) => step.id === project.currentStepId) ?? project.steps[0];
}

function getNextStep(project: DemoProject) {
  return project.steps.find((step) => !step.value.trim()) ?? getCurrentStep(project);
}

function getBrief(project: DemoProject) {
  const nextStep = getNextStep(project);
  const nextNotification = project.notifications.find((notification) => !notification.read);
  const nextReminder = project.reminders.find((reminder) => !reminder.done);
  return nextNotification
    ? `Next useful move: ${nextNotification.title} (${nextNotification.whenLabel}).`
    : nextReminder
    ? `Next useful move: ${nextReminder.title} (${nextReminder.dueLabel}).`
    : `Focus ${nextStep.title}. Keep the answer short and concrete.`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function DemoWorkbench({
  initialView
}: {
  initialView?: DemoWorkspaceView;
}) {
  const [isPending, startTransition] = useTransition();
  const [decisionDraft, setDecisionDraft] = useState("");
  const [quickTaskDraft, setQuickTaskDraft] = useState("");
  const [reminderDraft, setReminderDraft] = useState("");
  const [reminderDueDraft, setReminderDueDraft] = useState("");
  const [notificationDraft, setNotificationDraft] = useState({
    title: "",
    detail: "",
    whenLabel: ""
  });
  const [conversationDraft, setConversationDraft] = useState({
    person: "",
    context: "",
    painPoints: "",
    signals: "",
    trustLevel: "Medium" as "Low" | "Medium" | "High",
    learned: ""
  });
  const [fileDraft, setFileDraft] = useState({ name: "", target: "", url: "" });
  const [sprintTaskDraft, setSprintTaskDraft] = useState("");
  const [calendarDraft, setCalendarDraft] = useState({ day: "Fri", time: "09:30", title: "" });
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedSprintTaskId, setDraggedSprintTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activity, setActivity] = useState<string[]>(["Workspace ready."]);

  const {
    projects,
    activeProjectId,
    activeProject,
    error,
    setActiveProject,
    updateFounderNote,
    updateStepValue,
    updateCanvasValue,
    jumpToStep,
    addDecision,
    toggleTask,
    addQuickTask,
    addReminder,
    toggleReminder,
    removeReminder,
    addCalendarItem,
    removeCalendarItem,
    moveBoardCard,
    addNotification,
    toggleNotification,
    removeNotification,
    addConversation,
    removeConversation,
    addFileRecord,
    removeFileRecord,
    updateSprintField,
    addSprintTask,
    moveSprintTask,
    removeSprintTask,
    updateBusinessField,
    advanceDay,
    refreshWorkspace
  } = useProjectWorkspace();

  const lazyMode = useUiStore((state) => state.lazyMode);
  const workspaceView = useUiStore((state) => state.workspaceView);
  const selectedSectionId = useUiStore((state) => state.selectedSectionId);
  const setSelectedSectionId = useUiStore((state) => state.setSelectedSectionId);
  const setWorkspaceView = useUiStore((state) => state.setWorkspaceView);

  if (!activeProject) {
    return (
      <EmptyProjectState
        description={error ?? "The frontend is ready for backend data, but no project has been returned by the API yet."}
      />
    );
  }

  const currentStep = getCurrentStep(activeProject);
  const nextStep = getNextStep(activeProject);
  const completion = getCompletion(activeProject);
  const brief = getBrief(activeProject);
  const doneSteps = activeProject.steps.filter((step) => step.value.trim()).length;
  const openReminders = activeProject.reminders.filter((reminder) => !reminder.done).length;
  const doneTasks = activeProject.quickTasks.filter((task) => task.done).length;
  const unreadNotifications = activeProject.notifications.filter((notification) => !notification.read).length;
  const selectedCanvas =
    activeProject.canvases.find((canvas) => canvas.id === selectedSectionId) ?? activeProject.canvases[0];
  const business = activeProject.business;
  const doneSprintTasks = activeProject.sprint.tasks.filter((task) => task.status === "Done").length;
  const remainingSprintTasks = activeProject.sprint.tasks.length - doneSprintTasks;
  const executionScore = Math.round(
    ((doneSteps / activeProject.steps.length) * 0.6 +
      ((activeProject.sprint.tasks.length ? doneSprintTasks / activeProject.sprint.tasks.length : 0) || 0) * 0.4) *
      100
  );
  const firstClientProgress = Math.min(
    100,
    Math.round((activeProject.dayCount / Math.max(business.goToMarket.firstClientTargetDays, 1)) * 100)
  );
  const grossMargin = business.economics.monthlyPrice - business.economics.productionCost;
  const viabilityStatus =
    grossMargin > 0
      ? grossMargin >= business.economics.productionCost
        ? "Economics look healthy"
        : "Margin is positive but still thin"
      : "Economics need work";
  const hoursRemaining = Math.max(business.build.mvpHoursTarget - business.build.hoursSpent, 0);
  const weeksToBuild = business.build.weeklyHoursAvailable
    ? (hoursRemaining / business.build.weeklyHoursAvailable).toFixed(1)
    : "0";
  const focusView =
    workspaceView === "strategy" || workspaceView === "records" || workspaceView === "sprint";

  useEffect(() => {
    if (initialView) {
      setWorkspaceView(initialView);
    }
  }, [initialView, setWorkspaceView]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function pulse(message: string) {
    setToast(message);
    setActivity((current) => [message, ...current].slice(0, 6));
  }

  function guard(ok: boolean, message: string) {
    if (!ok) setNotice(message);
    return ok;
  }

  function focusNextStep() {
    jumpToStep(nextStep.id);
    setWorkspaceView("capture");
    pulse(`Focused ${nextStep.shortLabel}.`);
  }

  if (initialView === "sprint") {
    return (
      <div className="space-y-5 py-1">
        {notice ? <div className="rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ink">{notice}</div> : null}

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="space-y-5 bg-white text-slate-950">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sprint Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{activeProject.name}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                A lighter sprint page focused on setup, tasks and movement only.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Progress</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {activeProject.sprint.tasks.filter((task) => task.status === "Done").length}/{activeProject.sprint.tasks.length}
                </p>
                <p className="mt-2 text-sm text-slate-600">Tasks completed in this sprint.</p>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current Goal</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeProject.sprint.goal || "No sprint goal yet."}</p>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Duration</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeProject.sprint.duration || "Not set"}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="space-y-5 bg-white text-slate-950">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sprint Setup</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Goal, review and retrospective</h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <Input
                    value={activeProject.sprint.goal}
                    onChange={(event) => updateSprintField("goal", event.target.value)}
                    placeholder="Sprint goal"
                    className="bg-slate-50"
                  />
                  <Input
                    value={activeProject.sprint.duration}
                    onChange={(event) => updateSprintField("duration", event.target.value)}
                    placeholder="Sprint duration"
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-4">
                  <Textarea
                    value={activeProject.sprint.review}
                    onChange={(event) => updateSprintField("review", event.target.value)}
                    placeholder="Sprint review"
                    className="min-h-28 bg-slate-50"
                  />
                  <Textarea
                    value={activeProject.sprint.retrospective}
                    onChange={(event) => updateSprintField("retrospective", event.target.value)}
                    placeholder="Sprint retrospective"
                    className="min-h-28 bg-slate-50"
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-5 bg-white text-slate-950">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Add Task</p>
                  <Input
                    value={sprintTaskDraft}
                    onChange={(event) => setSprintTaskDraft(event.target.value)}
                    placeholder="Task title"
                    className="mt-3 bg-slate-50"
                  />
                </div>
                <Button
                  className="justify-between bg-slate-950 text-white hover:bg-slate-900"
                  onClick={() => {
                    if (!guard(Boolean(sprintTaskDraft.trim()), "Write the sprint task first.")) return;
                    addSprintTask(sprintTaskDraft);
                    setSprintTaskDraft("");
                    pulse(`Added sprint task: ${sprintTaskDraft.trim()}`);
                  }}
                >
                  Add task
                  <Rocket className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {sprintColumns.map((column) => (
                  <div
                    key={column}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedSprintTaskId) return;
                      moveSprintTask(draggedSprintTaskId, column);
                      setDraggedSprintTaskId(null);
                    }}
                    className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{column}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                        {activeProject.sprint.tasks.filter((task) => task.status === column).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeProject.sprint.tasks.filter((task) => task.status === column).map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedSprintTaskId(task.id)}
                          onDragEnd={() => setDraggedSprintTaskId(null)}
                          className="rounded-[1.1rem] border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-slate-900">{task.title}</p>
                            <Grip className="mt-0.5 h-4 w-4 text-slate-400" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sprintColumns.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => moveSprintTask(task.id, status)}
                                className={`rounded-full px-3 py-1 text-xs ${
                                  status === task.status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => removeSprintTask(task.id)}
                              className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                      {activeProject.sprint.tasks.filter((task) => task.status === column).length === 0 ? (
                        <div className="rounded-[1.1rem] border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
                          No tasks in this lane.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      {toast ? <div className="fixed right-4 top-4 z-50 rounded-2xl bg-ink px-4 py-3 text-sm text-surface shadow-panel">{toast}</div> : null}
      {notice ? <div className="rounded-2xl border border-ember/25 bg-ember/10 px-4 py-3 text-sm text-ink">{notice}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ProjectSidebar
          projects={projects}
          activeProjectId={activeProject.id}
          onSelectProject={(projectId) => {
            setActiveProject(projectId);
            const selectedProject = projects.find((project) => project.id === projectId);
            pulse(`Opened ${selectedProject?.name ?? "the project"}.`);
          }}
          onRefreshWorkspace={() => {
            void refreshWorkspace();
            pulse("Refreshed workspace data.");
          }}
          getCompletion={getCompletion}
        />

        <Card className="hero-ribbon overflow-hidden border-none text-surface">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px]">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-amber-100/70">Personal workspace</p>
              <h1 className="mt-2 font-display text-4xl leading-none text-white sm:text-5xl">{activeProject.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-surface/72">
                {lazyMode ? "One clear workspace at a time. Use the dock and tabs instead of scanning a wall." : "Manual-first. Capture fast, plan simply, and always know the next move."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-surface">{activeProject.stageLabel}</span>
                <span className="rounded-full bg-white/90 px-4 py-2 text-sm text-ink/75">Day {activeProject.dayCount}</span>
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm text-ink">{completion}% ready</span>
              </div>
              <div className="mt-6 rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-amber-100">
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Next Best Move</span>
                </div>
                <p className="mt-3 text-lg font-semibold text-white">{nextStep.title}</p>
                <p className="mt-1 text-sm text-surface/72">{brief}</p>
                <Button className="mt-4 bg-white text-ink shadow-none" onClick={focusNextStep}>Focus this step</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => { updateStepValue("validate-urgency", samples["validate-urgency"]); addDecision("A founder call confirmed urgency."); addReminder("Follow up on the founder call", "Tomorrow 10:00"); pulse("Simulated a founder call."); }}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Simulate founder call
                </Button>
                <Button variant="ghost" onClick={() => { activeProject.steps.forEach((step) => updateStepValue(step.id, samples[step.id])); addDecision("The core story is now ready to review."); pulse(`Filled the story for ${activeProject.name}.`); }}>
                  <Flame className="mr-2 h-4 w-4" />
                  Fill suggested answers
                </Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white/10 p-5 text-white backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/65">Current Push</p>
              <p className="mt-3 text-base font-medium leading-6">{activeProject.warning}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xs uppercase tracking-[0.14em] text-white/55">Steps</p><p className="mt-2 text-2xl font-semibold">{doneSteps}</p></div>
                <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xs uppercase tracking-[0.14em] text-white/55">Reminders</p><p className="mt-2 text-2xl font-semibold">{openReminders}</p></div>
                <div className="rounded-2xl bg-white/10 px-4 py-3"><p className="text-xs uppercase tracking-[0.14em] text-white/55">Tasks done</p><p className="mt-2 text-2xl font-semibold">{doneTasks}</p></div>
              </div>
              <Button variant="secondary" className="mt-4 w-full justify-between bg-amber-100 text-ink" onClick={() => startTransition(() => { advanceDay(); pulse("Moved the project forward by one day."); })} disabled={isPending}>
                Simulate one more day
                <TimerReset className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="dock-panel overflow-hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Quick Dock</p>
              <h2 className="mt-2 text-2xl font-semibold">One tap, one move</h2>
              <p className="mt-2 text-sm text-ink/65">Use this strip when you do not want to think about where to click.</p>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <Button className="min-w-[170px] justify-between" onClick={focusNextStep}>Open next<ArrowRight className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("overview"); pulse("Opened pilotage metrics."); }}>Pilotage<BarChart3 className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("strategy"); pulse("Opened the strategy canvases."); }}>Open strategy<Lightbulb className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("records"); pulse("Opened records and notifications."); }}>Open records<Inbox className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("planner"); pulse("Opened reminders and calendar."); }}>Plan now<CalendarDays className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("sprint"); pulse("Opened sprint workspace."); }}>Open sprint<Rocket className="h-4 w-4" /></Button>
              <Button variant="ghost" className="min-w-[170px] justify-between" onClick={() => { setWorkspaceView("desk"); pulse("Opened the lazy desk."); }}>Move cards<Grip className="h-4 w-4" /></Button>
              <Button variant="secondary" className="min-w-[170px] justify-between" onClick={() => startTransition(() => { advanceDay(); pulse("Moved the project forward by one day."); })} disabled={isPending}>Simulate day<TimerReset className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="metric-tile rounded-[1.6rem] p-5"><p className="text-xs uppercase tracking-[0.18em] text-ink/45">Execution</p><p className="mt-3 text-3xl font-semibold text-ink">{executionScore}%</p><p className="mt-2 text-sm text-ink/60">{doneSteps} étapes validées et {doneSprintTasks} tâches sprint terminées.</p></Card>
          <Card className="metric-tile rounded-[1.6rem] p-5"><p className="text-xs uppercase tracking-[0.18em] text-ink/45">First Clients</p><p className="mt-3 text-3xl font-semibold text-ink">{business.goToMarket.firstClientTargetDays}j</p><p className="mt-2 text-sm text-ink/60">Objectif pour signer les premiers clients. Jour {activeProject.dayCount} aujourd'hui.</p></Card>
          <Card className="metric-tile rounded-[1.6rem] p-5"><p className="text-xs uppercase tracking-[0.18em] text-ink/45">Acquisition</p><p className="mt-3 text-3xl font-semibold text-ink">{business.goToMarket.acquisitionFrequencyPerMonth}/mois</p><p className="mt-2 text-sm text-ink/60">{business.goToMarket.clientsAcquired} clients acquis et {openReminders} relances encore ouvertes.</p></Card>
        </div>
      </section>

      <Card className="glass-strip sticky top-3 z-20">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => { setWorkspaceView(tab.id); pulse(`Switched to ${tab.label}.`); }} className={`min-w-[140px] rounded-3xl px-4 py-3 text-sm font-medium transition ${workspaceView === tab.id ? "bg-ink text-surface shadow-panel" : "bg-white/55 text-ink hover:-translate-y-0.5 hover:bg-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <section className={`grid gap-6 ${focusView ? "xl:grid-cols-1" : "xl:grid-cols-[minmax(0,1.65fr)_360px]"}`}>
        <div className="space-y-4">
          {workspaceView === "overview" && (
            <Card className="warm-panel space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Project Cockpit</p>
                  <h3 className="mt-2 text-3xl font-semibold">Vision globale sur l'evolution du projet</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
                    Cette vue vous montre ce qui est fait, les deadlines, ce qui reste a faire et les chiffres qui disent si le projet devient viable.
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-xs text-ink/70">
                  {remainingSprintTasks} sujets sprint restants
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="editor-surface rounded-[1.6rem] p-5 shadow-none">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-pine" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">KPI 1</p>
                      <h4 className="mt-1 text-lg font-semibold">Avancement global</h4>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-ink">{executionScore}%</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    Le score mélange l'avancement des étapes produit et la livraison sprint.
                  </p>
                </Card>

                <Card className="editor-surface rounded-[1.6rem] p-5 shadow-none">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-ember" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">KPI 2</p>
                      <h4 className="mt-1 text-lg font-semibold">Temps vers 1ers clients</h4>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-ink">{firstClientProgress}%</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    Jour {activeProject.dayCount} sur un objectif de {business.goToMarket.firstClientTargetDays} jours.
                  </p>
                </Card>

                <Card className="editor-surface rounded-[1.6rem] p-5 shadow-none">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-pine" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">KPI 3</p>
                      <h4 className="mt-1 text-lg font-semibold">Frequence d'acquisition</h4>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-ink">{business.goToMarket.acquisitionFrequencyPerMonth}/mois</p>
                  <p className="mt-2 text-sm leading-6 text-ink/65">
                    {business.goToMarket.clientsAcquired} clients acquis a ce stade via {business.goToMarket.primaryChannel}.
                  </p>
                </Card>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <Card className="editor-surface rounded-[1.8rem] p-6 shadow-none">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Execution & Deadlines</p>
                  <h4 className="mt-2 text-2xl font-semibold text-ink">Ce qui est fait vs ce qui reste</h4>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Deja fait</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{doneSteps + doneSprintTasks + doneTasks}</p>
                      <p className="mt-2 text-sm text-ink/60">Etapes, sprint tasks et quick tasks closes.</p>
                    </div>
                    <div className="rounded-3xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/45">A faire</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{remainingSprintTasks + openReminders}</p>
                      <p className="mt-2 text-sm text-ink/60">Deadlines et taches encore ouvertes.</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {activeProject.reminders.slice(0, 3).map((reminder) => (
                      <div key={reminder.id} className="rounded-3xl bg-white/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-ink">{reminder.title}</p>
                          <span className={`rounded-full px-3 py-1 text-xs ${reminder.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                            {reminder.done ? "Fait" : reminder.dueLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="editor-surface rounded-[1.8rem] p-6 shadow-none">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Go-To-Market</p>
                  <h4 className="mt-2 text-2xl font-semibold text-ink">Mesurer le chemin vers les premiers clients</h4>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={business.goToMarket.firstClientTargetDays}
                      onChange={(event) =>
                        updateBusinessField("goToMarket", "firstClientTargetDays", Number(event.target.value) || 0)
                      }
                      placeholder="Jours vers 1ers clients"
                    />
                    <Input
                      type="number"
                      value={business.goToMarket.clientsAcquired}
                      onChange={(event) =>
                        updateBusinessField("goToMarket", "clientsAcquired", Number(event.target.value) || 0)
                      }
                      placeholder="Clients acquis"
                    />
                    <Input
                      type="number"
                      value={business.goToMarket.acquisitionFrequencyPerMonth}
                      onChange={(event) =>
                        updateBusinessField("goToMarket", "acquisitionFrequencyPerMonth", Number(event.target.value) || 0)
                      }
                      placeholder="Acquisition par mois"
                    />
                    <Input
                      value={business.goToMarket.primaryChannel}
                      onChange={(event) => updateBusinessField("goToMarket", "primaryChannel", event.target.value)}
                      placeholder="Canal principal"
                    />
                  </div>
                  <div className="mt-5 rounded-3xl bg-white/80 p-4 text-sm leading-7 text-ink/72">
                    A ce rythme, vous construisez un go-to-market capable d'absorber environ{" "}
                    <span className="font-semibold text-ink">
                      {business.goToMarket.acquisitionFrequencyPerMonth * 3}
                    </span>{" "}
                    clients sur 90 jours si la cadence se maintient.
                  </div>
                </Card>

                <Card className="editor-surface rounded-[1.8rem] p-6 shadow-none">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-ember" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Viability</p>
                      <h4 className="mt-1 text-2xl font-semibold text-ink">Verifier la viabilite du projet</h4>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={business.market.tam}
                      onChange={(event) => updateBusinessField("market", "tam", Number(event.target.value) || 0)}
                      placeholder="TAM"
                    />
                    <Input
                      type="number"
                      value={business.market.sam}
                      onChange={(event) => updateBusinessField("market", "sam", Number(event.target.value) || 0)}
                      placeholder="SAM"
                    />
                    <Input
                      type="number"
                      value={business.market.som}
                      onChange={(event) => updateBusinessField("market", "som", Number(event.target.value) || 0)}
                      placeholder="SOM"
                    />
                    <Input
                      type="number"
                      value={business.economics.productionCost}
                      onChange={(event) =>
                        updateBusinessField("economics", "productionCost", Number(event.target.value) || 0)
                      }
                      placeholder="Cout de prod"
                    />
                    <Input
                      type="number"
                      value={business.economics.monthlyPrice}
                      onChange={(event) =>
                        updateBusinessField("economics", "monthlyPrice", Number(event.target.value) || 0)
                      }
                      placeholder="Prix mensuel"
                    />
                    <Input
                      type="number"
                      value={business.economics.runwayMonths}
                      onChange={(event) =>
                        updateBusinessField("economics", "runwayMonths", Number(event.target.value) || 0)
                      }
                      placeholder="Runway (mois)"
                    />
                  </div>
                  <Textarea
                    value={business.market.note}
                    onChange={(event) => updateBusinessField("market", "note", event.target.value)}
                    placeholder="Synthese market size"
                    className="mt-3 min-h-24"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Market Size</p>
                      <p className="mt-2 text-lg font-semibold text-ink">
                        {formatNumber(business.market.tam)} / {formatNumber(business.market.sam)} / {formatNumber(business.market.som)}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Marge brute</p>
                      <p className="mt-2 text-lg font-semibold text-ink">{formatCurrency(grossMargin)}</p>
                    </div>
                    <div className="rounded-3xl bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Lecture</p>
                      <p className="mt-2 text-sm font-medium text-ink">{viabilityStatus}</p>
                    </div>
                  </div>
                </Card>

                <Card className="editor-surface rounded-[1.8rem] p-6 shadow-none">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Time To Build</p>
                  <h4 className="mt-2 text-2xl font-semibold text-ink">Temps alloue au projet</h4>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={business.build.weeklyHoursAvailable}
                      onChange={(event) =>
                        updateBusinessField("build", "weeklyHoursAvailable", Number(event.target.value) || 0)
                      }
                      placeholder="Heures / semaine"
                    />
                    <Input
                      type="number"
                      value={business.build.hoursSpent}
                      onChange={(event) =>
                        updateBusinessField("build", "hoursSpent", Number(event.target.value) || 0)
                      }
                      placeholder="Heures deja investies"
                    />
                    <Input
                      type="number"
                      value={business.build.mvpHoursTarget}
                      onChange={(event) =>
                        updateBusinessField("build", "mvpHoursTarget", Number(event.target.value) || 0)
                      }
                      placeholder="Objectif heures MVP"
                    />
                    <Input
                      value={business.build.calendarConnectionLabel}
                      onChange={(event) => updateBusinessField("build", "calendarConnectionLabel", event.target.value)}
                      placeholder="Etat Google Calendar"
                    />
                  </div>
                  <div className="mt-4 rounded-3xl bg-white/80 p-4">
                    <p className="text-sm leading-7 text-ink/70">
                      Il reste environ <span className="font-semibold text-ink">{hoursRemaining}h</span> pour arriver a votre cible MVP,
                      soit <span className="font-semibold text-ink">{weeksToBuild} semaines</span> au rythme actuel.
                    </p>
                  </div>
                  <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm leading-7 text-ink/72">
                    Calendrier: {business.build.calendarConnectionLabel}. Le bloc calendrier existant peut ensuite etre relie a Google Calendar.
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {(workspaceView === "today" || workspaceView === "capture" || workspaceView === "desk") && (
            <Card className="warm-panel space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Guided Steps</p>
                  <h2 className="accent-line mt-2 font-display text-3xl leading-none">{lazyMode ? "Only what matters now" : "Progress without overload"}</h2>
                </div>
                <div className="h-2 w-full rounded-full bg-surface sm:max-w-48">
                  <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {activeProject.steps.map((step, index) => {
                  const active = step.id === currentStep.id;
                  const done = Boolean(step.value.trim());
                  return (
                    <button key={step.id} type="button" onClick={() => { jumpToStep(step.id); pulse(`Focused ${step.shortLabel}.`); }} className={`min-w-[210px] rounded-3xl border px-4 py-4 text-left transition ${active ? "border-pine bg-pine text-white" : done ? "border-transparent bg-white text-ink" : "border-transparent bg-surface/80 text-ink hover:bg-white"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-xs ${active ? "text-white/75" : "text-ink/45"}`}>Step {index + 1}</span>
                        {done ? <CheckCircle2 className={`h-4 w-4 ${active ? "text-white" : "text-pine"}`} /> : <Circle className={`h-4 w-4 ${active ? "text-white/80" : "text-ink/35"}`} />}
                      </div>
                      <p className="mt-3 text-sm font-semibold">{step.shortLabel}</p>
                      <p className={`mt-1 text-xs leading-5 ${active ? "text-white/78" : "text-ink/58"}`}>{step.description}</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {(workspaceView === "today" || workspaceView === "capture") && (
            <Card className="warm-panel space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Current Workspace</p>
                  <h3 className="mt-2 text-2xl font-semibold">{currentStep.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{currentStep.prompt}</p>
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-xs text-ink/60">Next up: {currentStep.helper}</span>
              </div>
              <Textarea value={currentStep.value} onChange={(event) => updateStepValue(currentStep.id, event.target.value)} placeholder={currentStep.placeholder} className="min-h-40" />
              {!currentStep.value.trim() ? <div className="flex items-center gap-2 rounded-2xl bg-surface/80 px-4 py-3 text-sm text-ink/65"><Info className="h-4 w-4 text-pine" /><span>Write one short answer or use the sample answer to unlock the next step.</span></div> : null}
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => { updateStepValue(currentStep.id, samples[currentStep.id]); pulse(`Filled ${currentStep.shortLabel} with a sample answer.`); }}><Sparkles className="mr-2 h-4 w-4" />Use sample answer</Button>
                <Button variant="ghost" onClick={() => { jumpToStep(nextStep.id); pulse(`Jumped to ${nextStep.shortLabel}.`); }}><ArrowRight className="mr-2 h-4 w-4" />Go next</Button>
              </div>
            </Card>
          )}

          {workspaceView === "capture" && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Founder Note</p>
                <h3 className="mt-2 text-xl font-semibold">One place for your thinking</h3>
              </div>
              <Textarea value={activeProject.founderNote} onChange={(event) => updateFounderNote(event.target.value)} placeholder="Write the note you want to keep in sight while building." className="min-h-28" />
            </Card>
          )}

          {workspaceView === "strategy" && (
            <Card className="warm-panel space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Strategy Workspace</p>
                  <h3 className="mt-2 text-3xl font-semibold">ICP, TAM, BMC and the real thinking blocks</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">
                    This is the long-form part of your cockpit. Open one block, write freely, then move to the next one.
                  </p>
                </div>
                <span className="rounded-full bg-surface px-4 py-2 text-xs text-ink/60">
                  Bigger canvases. Less cramped.
                </span>
              </div>

              <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-2">
                  {activeProject.canvases.map((canvas) => {
                    const active = canvas.id === selectedCanvas.id;
                    const filled = Boolean(canvas.value.trim());
                    return (
                      <button
                        key={canvas.id}
                        type="button"
                        onClick={() => {
                          setSelectedSectionId(canvas.id);
                          pulse(`Opened ${canvas.title}.`);
                        }}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                          active
                            ? "border-pine bg-pine text-white"
                            : filled
                              ? "border-transparent bg-white text-ink"
                              : "border-transparent bg-surface/80 text-ink hover:bg-white"
                        }`}
                      >
                        <p className="text-sm font-semibold">{canvas.title}</p>
                        <p className={`mt-2 text-xs leading-5 ${active ? "text-white/75" : "text-ink/55"}`}>
                          {canvas.helper}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="editor-surface rounded-[2rem] p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{selectedCanvas.title}</p>
                  <h4 className="mt-3 text-2xl font-semibold text-ink">{selectedCanvas.prompt}</h4>
                  <p className="mt-3 text-sm leading-7 text-ink/65">{selectedCanvas.helper}</p>
                  <Textarea
                    value={selectedCanvas.value}
                    onChange={(event) =>
                      updateCanvasValue(selectedCanvas.id as DemoCanvasKey, event.target.value)
                    }
                    placeholder={`Write your ${selectedCanvas.title} thinking here...`}
                    className="mt-6 min-h-[420px]"
                  />
                </div>
              </div>
            </Card>
          )}

          {workspaceView === "records" && (
            <Card className="warm-panel space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Records Workspace</p>
                <h3 className="mt-2 text-3xl font-semibold">Notifications, conversations, files and everything to log</h3>
                <p className="mt-3 text-sm leading-7 text-ink/68">
                  Every core object now has a place to create, review and remove it before we wire the backend.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-4 editor-surface rounded-[2rem] p-6">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-pine" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Notifications</p>
                      <h4 className="mt-1 text-xl font-semibold">Add a system alert</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input value={notificationDraft.title} onChange={(event) => setNotificationDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
                    <Input value={notificationDraft.whenLabel} onChange={(event) => setNotificationDraft((current) => ({ ...current, whenLabel: event.target.value }))} placeholder="When" />
                    <Textarea value={notificationDraft.detail} onChange={(event) => setNotificationDraft((current) => ({ ...current, detail: event.target.value }))} placeholder="Why should this notification exist?" className="min-h-24" />
                    <Button className="w-full justify-between" onClick={() => { if (!guard(Boolean(notificationDraft.title.trim() && notificationDraft.detail.trim() && notificationDraft.whenLabel.trim()), "Fill title, detail, and when before adding a notification.")) return; addNotification(notificationDraft.title, notificationDraft.detail, notificationDraft.whenLabel); pulse(`Added notification: ${notificationDraft.title.trim()}`); setNotificationDraft({ title: "", detail: "", whenLabel: "" }); }}>
                      Add notification
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {activeProject.notifications.map((notification) => (
                      <div key={notification.id} className="rounded-3xl bg-surface/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <button type="button" onClick={() => toggleNotification(notification.id)} className="text-left">
                            <p className={`text-sm font-medium ${notification.read ? "text-ink/55" : "text-ink"}`}>{notification.title}</p>
                            <p className="mt-1 text-xs text-ink/55">{notification.whenLabel}</p>
                            <p className="mt-2 text-sm text-ink/72">{notification.detail}</p>
                          </button>
                          <button type="button" onClick={() => { removeNotification(notification.id); pulse(`Removed notification: ${notification.title}`); }} className="text-ink/45 transition hover:text-ember">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 editor-surface rounded-[2rem] p-6">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-pine" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Conversations</p>
                      <h4 className="mt-1 text-xl font-semibold">Log a real conversation</h4>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={conversationDraft.person} onChange={(event) => setConversationDraft((current) => ({ ...current, person: event.target.value }))} placeholder="Person" />
                    <Input value={conversationDraft.context} onChange={(event) => setConversationDraft((current) => ({ ...current, context: event.target.value }))} placeholder="Context" />
                    <Input value={conversationDraft.trustLevel} onChange={(event) => setConversationDraft((current) => ({ ...current, trustLevel: event.target.value as "Low" | "Medium" | "High" }))} placeholder="Trust level" />
                    <Input value={conversationDraft.signals} onChange={(event) => setConversationDraft((current) => ({ ...current, signals: event.target.value }))} placeholder="Signals" />
                    <Textarea value={conversationDraft.painPoints} onChange={(event) => setConversationDraft((current) => ({ ...current, painPoints: event.target.value }))} placeholder="Pain points" className="sm:col-span-2 min-h-20" />
                    <Textarea value={conversationDraft.learned} onChange={(event) => setConversationDraft((current) => ({ ...current, learned: event.target.value }))} placeholder="What changed or what did you learn?" className="sm:col-span-2 min-h-20" />
                  </div>
                  <Button className="w-full justify-between" onClick={() => { if (!guard(Boolean(conversationDraft.person.trim() && conversationDraft.context.trim()), "Add at least the person and context before saving the conversation.")) return; addConversation(conversationDraft.person, conversationDraft.context, conversationDraft.painPoints, conversationDraft.signals, conversationDraft.trustLevel, conversationDraft.learned); pulse(`Added conversation with ${conversationDraft.person.trim()}.`); setConversationDraft({ person: "", context: "", painPoints: "", signals: "", trustLevel: "Medium", learned: "" }); }}>
                    Add conversation
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                  <div className="space-y-2">
                    {activeProject.conversations.map((conversation) => (
                      <div key={conversation.id} className="rounded-3xl bg-surface/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-ink">{conversation.person}</p>
                            <p className="mt-1 text-xs text-ink/55">{conversation.context} • Trust {conversation.trustLevel}</p>
                            <p className="mt-2 text-sm text-ink/75">{conversation.learned}</p>
                          </div>
                          <button type="button" onClick={() => { removeConversation(conversation.id); pulse(`Removed conversation with ${conversation.person}.`); }} className="text-ink/45 transition hover:text-ember">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="editor-surface rounded-[2rem] p-6">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-pine" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Files</p>
                    <h4 className="mt-1 text-xl font-semibold">Simulate file records</h4>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_1fr_1.2fr_auto]">
                  <Input value={fileDraft.name} onChange={(event) => setFileDraft((current) => ({ ...current, name: event.target.value }))} placeholder="File name" />
                  <Input value={fileDraft.target} onChange={(event) => setFileDraft((current) => ({ ...current, target: event.target.value }))} placeholder="Attach to" />
                  <Input value={fileDraft.url} onChange={(event) => setFileDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL or future Cloudinary path" />
                  <Button onClick={() => { if (!guard(Boolean(fileDraft.name.trim() && fileDraft.target.trim()), "Add a file name and target before saving the record.")) return; addFileRecord(fileDraft.name, fileDraft.target, fileDraft.url); pulse(`Added file record: ${fileDraft.name.trim()}`); setFileDraft({ name: "", target: "", url: "" }); }}>Add file</Button>
                </div>
                <div className="mt-4 space-y-2">
                  {activeProject.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-3 rounded-3xl bg-surface/80 p-4">
                      <div>
                        <p className="text-sm font-medium text-ink">{file.name}</p>
                        <p className="mt-1 text-xs text-ink/55">{file.target}</p>
                      </div>
                      <button type="button" onClick={() => { removeFileRecord(file.id); pulse(`Removed file record: ${file.name}`); }} className="text-ink/45 transition hover:text-ember">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {workspaceView === "sprint" && (
            <Card className="warm-panel space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Sprint Workspace</p>
                <h3 className="mt-2 text-3xl font-semibold">Create, update and track the sprint flow</h3>
                <p className="mt-3 text-sm leading-7 text-ink/68">
                  Goal, duration, tasks, review and retrospective are all editable now so the backend can plug in later.
                </p>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="editor-surface space-y-3 p-6 shadow-none">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Sprint Setup</p>
                  <Input value={activeProject.sprint.goal} onChange={(event) => updateSprintField("goal", event.target.value)} placeholder="Sprint goal" />
                  <Input value={activeProject.sprint.duration} onChange={(event) => updateSprintField("duration", event.target.value)} placeholder="Duration" />
                  <Textarea value={activeProject.sprint.review} onChange={(event) => updateSprintField("review", event.target.value)} placeholder="Sprint review" className="min-h-24" />
                  <Textarea value={activeProject.sprint.retrospective} onChange={(event) => updateSprintField("retrospective", event.target.value)} placeholder="Retrospective" className="min-h-24" />
                </Card>
                <Card className="editor-surface space-y-3 p-6 shadow-none">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Add Sprint Task</p>
                  <Input value={sprintTaskDraft} onChange={(event) => setSprintTaskDraft(event.target.value)} placeholder="Task title" />
                  <Button className="w-full justify-between" onClick={() => { if (!guard(Boolean(sprintTaskDraft.trim()), "Write the sprint task first.")) return; addSprintTask(sprintTaskDraft); pulse(`Added sprint task: ${sprintTaskDraft.trim()}`); setSprintTaskDraft(""); }}>
                    Add task
                    <Rocket className="h-4 w-4" />
                  </Button>
                </Card>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {sprintColumns.map((column) => (
                  <div
                    key={column}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedSprintTaskId) return;
                      moveSprintTask(draggedSprintTaskId, column);
                      pulse(`Moved sprint task to ${column}.`);
                      setDraggedSprintTaskId(null);
                    }}
                    className="rounded-[1.75rem] border border-dashed border-line bg-surface/70 p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-ink">{column}</p>
                    <div className="space-y-3">
                      {activeProject.sprint.tasks.filter((task) => task.status === column).map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedSprintTaskId(task.id)}
                          onDragEnd={() => setDraggedSprintTaskId(null)}
                          className="cursor-grab rounded-[1.3rem] bg-white p-4 active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-medium text-ink">{task.title}</p>
                            <Grip className="mt-0.5 h-4 w-4 text-ink/35" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sprintColumns.map((status) => (
                              <button key={status} type="button" onClick={() => { moveSprintTask(task.id, status); pulse(`Moved sprint task to ${status}.`); }} className={`rounded-full px-3 py-1 text-xs ${status === task.status ? "bg-pine text-white" : "bg-surface text-ink/70"}`}>
                                {status}
                              </button>
                            ))}
                            <button type="button" onClick={() => { removeSprintTask(task.id); pulse(`Removed sprint task: ${task.title}`); }} className="rounded-full bg-ember/12 px-3 py-1 text-xs text-ember">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <CoreSetupCard
            project={activeProject}
            onOpenStrategy={() => {
              setWorkspaceView("strategy");
              pulse("Opened strategy workspace.");
            }}
            onOpenCanvas={(canvasId) => {
              setSelectedSectionId(canvasId);
              setWorkspaceView("strategy");
              pulse(`Opened ${canvasId}.`);
            }}
          />

          <LazyDeskCard
            cards={activeProject.boardCards}
            draggedCardId={draggedCardId}
            onDragStart={setDraggedCardId}
            onDragEnd={() => setDraggedCardId(null)}
            onMoveCard={(cardId, lane) => {
              moveBoardCard(cardId, lane);
              pulse(`Moved a card to ${lane}.`);
              setDraggedCardId(null);
            }}
          />

        </div>

        <div className={`space-y-4 ${focusView ? "" : "xl:sticky xl:top-4 xl:self-start"}`}>
          {workspaceView === "records" && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Records Summary</p>
                <h3 className="mt-2 text-xl font-semibold">Everything has a CRUD surface now</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink/75">
                <p className="rounded-3xl bg-surface/80 p-4">Notifications: <span className="font-medium text-ink">{activeProject.notifications.length}</span></p>
                <p className="rounded-3xl bg-surface/80 p-4">Conversations: <span className="font-medium text-ink">{activeProject.conversations.length}</span></p>
                <p className="rounded-3xl bg-surface/80 p-4">Files: <span className="font-medium text-ink">{activeProject.files.length}</span></p>
              </div>
            </Card>
          )}

          {workspaceView === "sprint" && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Sprint Summary</p>
                <h3 className="mt-2 text-xl font-semibold">Back-ready sprint state</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink/75">
                <p className="rounded-3xl bg-surface/80 p-4">Goal: <span className="font-medium text-ink">{activeProject.sprint.goal || "No goal yet"}</span></p>
                <p className="rounded-3xl bg-surface/80 p-4">Duration: <span className="font-medium text-ink">{activeProject.sprint.duration || "Not set"}</span></p>
                <p className="rounded-3xl bg-amber-50 p-4">Tasks tracked: <span className="font-medium text-ink">{activeProject.sprint.tasks.length}</span></p>
              </div>
            </Card>
          )}

          {workspaceView === "overview" && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Pilotage Summary</p>
                <h3 className="mt-2 text-xl font-semibold">Ou en est le projet ?</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink/75">
                <p className="rounded-3xl bg-surface/80 p-4">
                  Canal prioritaire: <span className="font-medium text-ink">{business.goToMarket.primaryChannel}</span>
                </p>
                <p className="rounded-3xl bg-surface/80 p-4">
                  Cout de prod: <span className="font-medium text-ink">{formatCurrency(business.economics.productionCost)}</span>
                </p>
                <p className="rounded-3xl bg-amber-50 p-4">
                  Time to build restant: <span className="font-medium text-ink">{hoursRemaining}h</span>
                </p>
              </div>
            </Card>
          )}

          {workspaceView === "strategy" && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Current Canvas</p>
                <h3 className="mt-2 text-xl font-semibold">{selectedCanvas.title}</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink/75">
                <p className="rounded-3xl bg-surface/80 p-4">{selectedCanvas.helper}</p>
                <p className="rounded-3xl bg-surface/80 p-4">
                  Status:{" "}
                  <span className="font-medium text-ink">
                    {selectedCanvas.value.trim() ? "Filled enough to refine later" : "Still empty"}
                  </span>
                </p>
                <p className="rounded-3xl bg-amber-50 p-4">
                  Next move: <span className="font-medium text-ink">Write the sharpest version, not the longest one.</span>
                </p>
              </div>
            </Card>
          )}

          <QuickTasksCard
            draft={quickTaskDraft}
            tasks={activeProject.quickTasks}
            onDraftChange={setQuickTaskDraft}
            onAdd={() => {
              if (!guard(Boolean(quickTaskDraft.trim()), "Write the quick task before adding it.")) {
                return;
              }
              addQuickTask(quickTaskDraft);
              pulse(`Added quick task: ${quickTaskDraft.trim()}`);
              setQuickTaskDraft("");
            }}
            onToggle={(taskId) => {
              const task = activeProject.quickTasks.find((item) => item.id === taskId);
              toggleTask(taskId);
              pulse(`${task?.done ? "Reopened" : "Completed"} task: ${task?.title ?? "Task"}`);
            }}
          />

          {(workspaceView === "today" || workspaceView === "planner") && (
            <Card className="warm-panel space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Today</p>
                <h3 className="mt-2 text-xl font-semibold">Your daily brief</h3>
              </div>
              <div className="space-y-3 text-sm leading-6 text-ink/75">
                <p className="rounded-3xl bg-surface/80 p-4">Active step: <span className="font-medium text-ink">{currentStep.title}</span></p>
                <p className="rounded-3xl bg-surface/80 p-4">Brief: <span className="font-medium text-ink">{brief}</span></p>
                <p className="rounded-3xl bg-amber-50 p-4">Next click: <span className="font-medium text-ink">{workspaceView === "today" ? "Open next" : "Write one short answer"}</span></p>
              </div>
            </Card>
          )}

          {(workspaceView === "today" || workspaceView === "planner") && (
            <Card className="warm-panel space-y-4">
              <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-pine" /><div><p className="text-xs uppercase tracking-[0.2em] text-ink/45">Reminders</p><h3 className="mt-1 text-xl font-semibold">Tiny nudges</h3></div></div>
              <div className="space-y-2">
                <Input value={reminderDraft} onChange={(event) => setReminderDraft(event.target.value)} placeholder="Ex: Send follow-up after interview" />
                <Input value={reminderDueDraft} onChange={(event) => setReminderDueDraft(event.target.value)} placeholder="Ex: Today 18:00" />
                <Button disabled={!reminderDraft.trim() || !reminderDueDraft.trim()} className="w-full justify-between" onClick={() => { if (!guard(Boolean(reminderDraft.trim() && reminderDueDraft.trim()), "Fill both the reminder text and the due time.")) return; addReminder(reminderDraft, reminderDueDraft); pulse(`Added reminder: ${reminderDraft.trim()}`); setReminderDraft(""); setReminderDueDraft(""); }}>
                  Add reminder
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {activeProject.reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-start gap-3 rounded-3xl bg-surface/80 px-4 py-3">
                    <button type="button" onClick={() => toggleReminder(reminder.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                      {reminder.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-pine" /> : <Circle className="mt-0.5 h-4 w-4 text-ink/35" />}
                      <div><p className={`text-sm ${reminder.done ? "text-ink/50 line-through" : "text-ink/80"}`}>{reminder.title}</p><p className="mt-1 text-xs text-ink/52">{reminder.dueLabel}</p></div>
                    </button>
                    <button type="button" onClick={() => { removeReminder(reminder.id); pulse(`Removed reminder: ${reminder.title}`); }} className="text-ink/45 transition hover:text-ember">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {workspaceView === "planner" && (
            <Card className="warm-panel space-y-4">
              <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-pine" /><div><p className="text-xs uppercase tracking-[0.2em] text-ink/45">Mini Calendar</p><h3 className="mt-1 text-xl font-semibold">Week at a glance</h3></div></div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input value={calendarDraft.day} onChange={(event) => setCalendarDraft((current) => ({ ...current, day: event.target.value }))} />
                <Input value={calendarDraft.time} onChange={(event) => setCalendarDraft((current) => ({ ...current, time: event.target.value }))} />
                <Input value={calendarDraft.title} onChange={(event) => setCalendarDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Focus review" className="sm:col-span-3" />
              </div>
              <Button variant="secondary" disabled={!calendarDraft.day.trim() || !calendarDraft.time.trim() || !calendarDraft.title.trim()} className="w-full justify-between" onClick={() => { if (!guard(Boolean(calendarDraft.day.trim() && calendarDraft.time.trim() && calendarDraft.title.trim()), "Fill the day, time, and title before adding a calendar slot.")) return; addCalendarItem(calendarDraft.day, calendarDraft.time, calendarDraft.title); pulse(`Added calendar slot: ${calendarDraft.title.trim()}`); setCalendarDraft((current) => ({ ...current, title: "" })); }}>
                Add calendar slot
                <CalendarDays className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                {activeProject.calendar.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-surface/80 p-4">
                    <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-ink">{item.title}</p><div className="flex items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs text-ink/60">{item.type}</span><button type="button" onClick={() => { removeCalendarItem(item.id); pulse(`Removed calendar slot: ${item.title}`); }} className="text-ink/45 transition hover:text-ember"><Trash2 className="h-4 w-4" /></button></div></div>
                    <p className="mt-1 text-xs text-ink/52">{`${item.dayLabel} - ${item.timeLabel}`}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {workspaceView === "desk" && (
            <Card className="warm-panel space-y-4">
              <div><p className="text-xs uppercase tracking-[0.2em] text-ink/45">Decisions</p><h3 className="mt-2 text-xl font-semibold">What changed</h3></div>
              <div className="space-y-2">
                <Input value={decisionDraft} onChange={(event) => setDecisionDraft(event.target.value)} placeholder="Example: Focus on solo founders first" />
                <Button disabled={!decisionDraft.trim()} className="w-full justify-between" onClick={() => { if (!guard(Boolean(decisionDraft.trim()), "Write the decision first, then save it.")) return; addDecision(decisionDraft); pulse(`Saved decision: ${decisionDraft.trim()}`); setDecisionDraft(""); }}>
                  Add decision
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {activeProject.decisions.length > 0 ? activeProject.decisions.map((decision) => <div key={decision} className="rounded-3xl bg-surface/80 p-4 text-sm leading-6 text-ink/78">{decision}</div>) : <div className="rounded-3xl bg-surface/70 p-4 text-sm text-ink/58">No decisions yet. Add one to keep the project history clear.</div>}
              </div>
            </Card>
          )}

          <Card className="space-y-3 bg-ink text-surface">
            <div className="flex items-center gap-3"><Lightbulb className="h-5 w-5 text-amber-300" /><div><p className="text-xs uppercase tracking-[0.2em] text-surface/55">Lazy mode</p><h3 className="mt-1 text-lg font-semibold">Keep it moving</h3></div></div>
            <p className="text-sm leading-6 text-surface/75">{lazyMode ? "Lazy mode is active. Use the dock and tabs to see one thing at a time and stay focused." : "The workspace stays light on purpose. One active step, one note space, and a clear next move."}</p>
          </Card>

          <Card className="warm-panel space-y-4">
            <div><p className="text-xs uppercase tracking-[0.2em] text-ink/45">Live Activity</p><h3 className="mt-2 text-xl font-semibold">What just happened</h3></div>
            <div className="space-y-2">
              {activity.map((item) => <div key={item} className="rounded-3xl border border-white/70 bg-surface/80 p-4 text-sm leading-6 text-ink/75">{item}</div>)}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
