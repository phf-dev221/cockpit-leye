"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Clock3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";

export function ProjectCalendarPage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);
  const { activeProject, scheduleCalendarItem, removeCalendarItem } = useProjectWorkspace();
  const [draft, setDraft] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
    type: "focus" as "focus" | "call" | "review" | "milestone"
  });

  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const now = new Date();
  const sortedEvents = [...activeProject.calendar].sort((left, right) => {
    const leftValue = left.startsAt ? new Date(left.startsAt).getTime() : 0;
    const rightValue = right.startsAt ? new Date(right.startsAt).getTime() : 0;
    return leftValue - rightValue;
  });

  const todaysEvents = sortedEvents.filter((item) => {
    if (item.startsAt) {
      const date = new Date(item.startsAt);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }

    return item.dayLabel === now.toLocaleDateString("en-US", { weekday: "short" });
  });

  const upcomingEvents = sortedEvents.filter((item) => {
    if (!item.startsAt) {
      return false;
    }

    return new Date(item.startsAt).getTime() > now.getTime();
  });

  return (
    <div className="space-y-5">
      <SectionContainer
        eyebrow="Calendar"
        title="Project calendar"
        description="Program manual events, see what is scheduled today, and prepare the Google Calendar connection."
        className="bg-white"
        action={
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-white"
          >
            Manage Google Calendar
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{todaysEvents.length}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Upcoming</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{upcomingEvents.length}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Source</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">Manual now, Google Calendar sync from Account.</p>
          </div>
        </div>
      </SectionContainer>

      <section className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <SectionContainer
          eyebrow="New Event"
          title="Program an event"
          description="Create a slot manually in the project calendar."
          className="bg-white"
        >
          <div className="space-y-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              placeholder="Event title"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              />
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as "focus" | "call" | "review" | "milestone"
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
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
                value={draft.startTime}
                onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              />
              <input
                type="time"
                value={draft.endTime}
                onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              />
            </div>
            <Button
              className="w-full justify-between"
              onClick={() => {
                const startsAt = `${draft.date}T${draft.startTime}:00`;
                const endsAt = `${draft.date}T${draft.endTime}:00`;
                void scheduleCalendarItem(draft.title, startsAt, endsAt, draft.type);
                setDraft((current) => ({ ...current, title: "" }));
              }}
              disabled={!draft.title.trim() || !draft.date || !draft.startTime}
            >
              Add event
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SectionContainer>

        <div className="space-y-5">
          <SectionContainer
            eyebrow="Today"
            title="Events of the day"
            description="Everything scheduled for today appears here."
            className="bg-white"
          >
            <div className="space-y-3">
              {todaysEvents.length ? (
                todaysEvents.map((item) => (
                  <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">
                          {item.startsAt
                            ? new Date(item.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : item.timeLabel}
                          {item.endsAt
                            ? ` - ${new Date(item.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : ""}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.type}
                          {item.source ? ` | ${item.source}` : ""}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => void removeCalendarItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No event scheduled for today.
                </div>
              )}
            </div>
          </SectionContainer>

          <SectionContainer
            eyebrow="Upcoming"
            title="Next events"
            description="A quick view of the next scheduled slots."
            className="bg-white"
          >
            <div className="space-y-3">
              {upcomingEvents.slice(0, 8).length ? (
                upcomingEvents.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.startsAt
                          ? `${new Date(item.startsAt).toLocaleDateString()} | ${new Date(item.startsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}`
                          : `${item.dayLabel} | ${item.timeLabel}`}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
                      <Clock3 className="h-3.5 w-3.5" />
                      {item.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No upcoming event yet.
                </div>
              )}
            </div>
          </SectionContainer>
        </div>
      </section>
    </div>
  );
}
