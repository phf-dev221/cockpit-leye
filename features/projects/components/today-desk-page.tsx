"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, FolderPlus, Plus, Rocket, TimerReset, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";
import { getProjectRoute } from "@/lib/utils";

function getNextStep(project: NonNullable<ReturnType<typeof useProjectWorkspace>["activeProject"]>) {
  return project.steps.find((step) => !step.value.trim()) ?? project.steps[0];
}

export function TodayDeskPage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);
  const { activeProject, advanceDay, addFocusItem, removeFocusItem, updateFocusItem } = useProjectWorkspace();
  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const nextStep = getNextStep(activeProject);
  const unreadNotifications = activeProject.notifications.filter((notification) => !notification.read).length;
  const openReminders = activeProject.reminders.filter((reminder) => !reminder.done).length;
  const doneTasks = activeProject.quickTasks.filter((task) => task.done).length;
  const [focusDrafts, setFocusDrafts] = useState<Record<string, { title: string; value: string }>>({});
  const [newFocus, setNewFocus] = useState({ title: "", value: "" });

  useEffect(() => {
    setFocusDrafts(
      Object.fromEntries(
        activeProject.focusItems.map((item) => [item.id, { title: item.title, value: item.value }])
      )
    );
  }, [activeProject.focusItems]);

  return (
    <div className="space-y-5">
      <section className="space-y-5">
        <SectionContainer
          eyebrow="Today"
          title={activeProject.name}
          description="Use this page for orientation only. Heavy workflows now live on dedicated pages."
          className="bg-white text-slate-950"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" className="bg-slate-100 text-slate-950" onClick={() => advanceDay()}>
                <TimerReset className="h-4 w-4" />
                Simulate one more day
              </Button>
              <Link
                href={getProjectRoute(activeProject.id, "/sections")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-900"
              >
                <Rocket className="h-4 w-4 text-white" />
                <span className="text-white">Open workspace</span>
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next step</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{nextStep.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{nextStep.helper}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Stage</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{activeProject.stageLabel}</p>
              <p className="mt-2 text-sm text-slate-700">Day {activeProject.dayCount}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current push</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{activeProject.warning}</p>
            </div>
          </div>
        </SectionContainer>

        <div className="flex gap-3">
          <Card className="metric-tile min-w-0 flex-1 rounded-[1.35rem] px-4 py-3 text-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Alerts</p>
              <p className="text-2xl font-semibold text-slate-950">{unreadNotifications}</p>
            </div>
          </Card>
          <Card className="metric-tile min-w-0 flex-1 rounded-[1.35rem] px-4 py-3 text-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Reminders</p>
              <p className="text-2xl font-semibold text-slate-950">{openReminders}</p>
            </div>
          </Card>
          <Card className="metric-tile min-w-0 flex-1 rounded-[1.35rem] px-4 py-3 text-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-600">Tasks done</p>
              <p className="text-2xl font-semibold text-slate-950">{doneTasks}</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionContainer
          eyebrow="Quick Actions"
          title="Jump where the work happens"
          description="The dashboard should orient you, not trap you in dense forms."
          className="bg-white text-slate-950"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Link href="/projects/new" className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition hover:bg-white">
              <div className="flex items-center gap-3">
                <FolderPlus className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Create project</p>
                  <p className="mt-1 text-xs text-slate-700">Use the full wizard outside the cockpit.</p>
                </div>
              </div>
            </Link>
            <Link href={getProjectRoute(activeProject.id, "/sections")} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition hover:bg-white">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Section workspace</p>
                  <p className="mt-1 text-xs text-slate-700">Notes, files, conversations, sprint.</p>
                </div>
              </div>
            </Link>
            <Link href={getProjectRoute(activeProject.id, "/notifications")} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition hover:bg-white">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Alerts</p>
                  <p className="mt-1 text-xs text-slate-700">Reminders, notifications and records.</p>
                </div>
              </div>
            </Link>
            <Link href={getProjectRoute(activeProject.id, "/sprints")} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition hover:bg-white">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sprint board</p>
                  <p className="mt-1 text-xs text-slate-700">Use the dedicated sprint workspace.</p>
                </div>
              </div>
            </Link>
          </div>
        </SectionContainer>

        <SectionContainer
          eyebrow="Today Focus"
          title="Keep only what matters"
          description="Edit these cards directly here instead of keeping static helper text."
          className="bg-white text-slate-950"
        >
          <div className="space-y-3">
            {activeProject.focusItems.map((item) => {
              const draft = focusDrafts[item.id] ?? { title: item.title, value: item.value };

              return (
                <div key={item.id} className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-3">
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setFocusDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, title: event.target.value }
                        }))
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-slate-400"
                      placeholder="Card title"
                    />
                    <textarea
                      value={draft.value}
                      onChange={(event) =>
                        setFocusDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, value: event.target.value }
                        }))
                      }
                      className="min-h-[88px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-400"
                      placeholder="What should this focus card say?"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => updateFocusItem(item.id, draft.title, draft.value)}
                      >
                        Save changes
                      </Button>
                      <Button variant="ghost" onClick={() => removeFocusItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[1rem] border border-dashed border-slate-300 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Add focus card</p>
              <div className="mt-3 grid gap-3">
                <input
                  value={newFocus.title}
                  onChange={(event) => setNewFocus((current) => ({ ...current, title: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-950 outline-none transition focus:border-slate-400"
                  placeholder="Example: Blocker to remove"
                />
                <textarea
                  value={newFocus.value}
                  onChange={(event) => setNewFocus((current) => ({ ...current, value: event.target.value }))}
                  className="min-h-[88px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-400"
                  placeholder="Write the note, next move, or reminder you want to keep in focus."
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      addFocusItem(newFocus.title, newFocus.value);
                      setNewFocus({ title: "", value: "" });
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add card
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setNewFocus({ title: nextStep.title, value: nextStep.helper })}
                  >
                    Use current step
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
