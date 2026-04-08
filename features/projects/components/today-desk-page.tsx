"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, FolderPlus, Plus, Rocket, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";
import { getProjectRoute } from "@/lib/utils";

export function TodayDeskPage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);
  const { activeProject, scheduleCalendarItem, removeCalendarItem } = useProjectWorkspace();

  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const unreadNotifications = activeProject.notifications.filter((notification) => !notification.read).length;
  const openReminders = activeProject.reminders.filter((reminder) => !reminder.done).length;
  const doneTasks = activeProject.quickTasks.filter((task) => task.done).length;
  const [calendarDraft, setCalendarDraft] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
    type: "focus" as "focus" | "call" | "review" | "milestone"
  });

  const todaysEvents = activeProject.calendar.filter((item) => {
    if (item.startsAt) {
      const date = new Date(item.startsAt);
      const now = new Date();

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }

    return item.dayLabel === new Date().toLocaleDateString("en-US", { weekday: "short" });
  });

  return (
    <div className="space-y-5">
      <section className="space-y-5">
        <SectionContainer
          eyebrow="Today"
          title={activeProject.name}
          description="Open the right workspace fast and handle only what needs attention now."
          className="bg-white text-slate-950"
          action={
            <Link
              href={getProjectRoute(activeProject.id, "/sections")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-900"
            >
              <Rocket className="h-4 w-4 text-white" />
              <span className="text-white">Open workspace</span>
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Alerts</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{unreadNotifications}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reminders</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{openReminders}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tasks done</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{doneTasks}</p>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="grid gap-5">
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
      </section>

      <SectionContainer
        eyebrow="Calendar"
        title="Plan and review today's events"
        description="Add a manual event now. Synced Google events will also appear here in the project flow."
        className="bg-white text-slate-950"
      >
        <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">New event</p>
            <div className="mt-4 grid gap-3">
              <input
                value={calendarDraft.title}
                onChange={(event) => setCalendarDraft((current) => ({ ...current, title: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                placeholder="Ex: Call investor update"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={calendarDraft.date}
                  onChange={(event) => setCalendarDraft((current) => ({ ...current, date: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                />
                <select
                  value={calendarDraft.type}
                  onChange={(event) =>
                    setCalendarDraft((current) => ({
                      ...current,
                      type: event.target.value as "focus" | "call" | "review" | "milestone"
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                >
                  <option value="focus">Focus</option>
                  <option value="call">Call</option>
                  <option value="review">Review</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="time"
                  value={calendarDraft.startTime}
                  onChange={(event) => setCalendarDraft((current) => ({ ...current, startTime: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                />
                <input
                  type="time"
                  value={calendarDraft.endTime}
                  onChange={(event) => setCalendarDraft((current) => ({ ...current, endTime: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                />
              </div>
              <Button
                onClick={() => {
                  const startsAt = `${calendarDraft.date}T${calendarDraft.startTime}:00`;
                  const endsAt = `${calendarDraft.date}T${calendarDraft.endTime}:00`;
                  void scheduleCalendarItem(calendarDraft.title, startsAt, endsAt, calendarDraft.type);
                  setCalendarDraft((current) => ({ ...current, title: "" }));
                }}
                disabled={!calendarDraft.title.trim() || !calendarDraft.date || !calendarDraft.startTime}
              >
                <Plus className="h-4 w-4" />
                Add event
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {todaysEvents.length ? (
              todaysEvents.map((item) => (
                <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.startsAt
                          ? new Date(item.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : item.timeLabel}
                        {item.endsAt
                          ? ` - ${new Date(item.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {item.type}
                        {item.source ? ` • ${item.source}` : ""}
                      </p>
                    </div>
                    <Button variant="ghost" onClick={() => void removeCalendarItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                No events for today.
              </div>
            )}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
