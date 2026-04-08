"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";

const eventTypeLabels = {
  focus: "Focus",
  call: "Call",
  review: "Review",
  milestone: "Milestone"
} as const;

type DraftType = keyof typeof eventTypeLabels;

function toDateInputValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function ProjectCalendarPage({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);
  const { activeProject, scheduleCalendarItem, removeCalendarItem } = useProjectWorkspace();
  const today = useMemo(() => new Date(), []);
  const [draft, setDraft] = useState({
    title: "",
    date: toDateInputValue(today),
    startTime: "09:00",
    endTime: "10:00",
    type: "focus" as DraftType
  });

  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const sortedEvents = [...activeProject.calendar].sort((left, right) => {
    const leftValue = left.startsAt ? new Date(left.startsAt).getTime() : 0;
    const rightValue = right.startsAt ? new Date(right.startsAt).getTime() : 0;
    return leftValue - rightValue;
  });

  const todaysEvents = sortedEvents.filter((item) => item.startsAt && sameDay(new Date(item.startsAt), today));
  const upcomingEvents = sortedEvents.filter((item) => item.startsAt && new Date(item.startsAt).getTime() > today.getTime());

  return (
    <div className="space-y-5">
      <SectionContainer
        eyebrow="Calendar"
        title="Quick calendar"
        description="Check today fast, add one event, move on."
        className="warm-panel"
        action={
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Google Calendar
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.3rem] border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{todaysEvents.length}</p>
          </div>
          <div className="rounded-[1.3rem] border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Upcoming</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{upcomingEvents.length}</p>
          </div>
          <div className="rounded-[1.3rem] border border-slate-200 bg-[#eef7f6] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next step</p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {todaysEvents.length ? "Review today first." : "Add the next important block."}
            </p>
          </div>
        </div>
      </SectionContainer>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SectionContainer
          eyebrow="Add"
          title="Add event"
          description="Simple and fast."
          className="warm-panel"
        >
          <div className="space-y-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="What do you need to do?"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
              />
              <select
                value={draft.type}
                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as DraftType }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
              >
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <input
                type="time"
                value={draft.startTime}
                onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
              />
              <input
                type="time"
                value={draft.endTime}
                onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
              />
            </div>

            <Button
              className="w-full justify-between"
              onClick={() => {
                const startsAt = `${draft.date}T${draft.startTime}:00`;
                const endsAt = draft.endTime ? `${draft.date}T${draft.endTime}:00` : undefined;
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
            title="Today"
            description="Only what matters right now."
            className="warm-panel"
          >
            <div className="space-y-3">
              {todaysEvents.length ? (
                todaysEvents.map((item) => (
                  <div key={item.id} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                          <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {item.startsAt
                            ? new Date(item.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : item.timeLabel}
                          {item.endsAt
                            ? ` - ${new Date(item.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                            : ""}
                        </p>
                      </div>
                      <Button variant="ghost" className="rounded-full" onClick={() => void removeCalendarItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                  Nothing planned for today.
                </div>
              )}
            </div>
          </SectionContainer>

          <SectionContainer
            eyebrow="Upcoming"
            title="Next events"
            description="A clean list for what comes next."
            className="warm-panel"
          >
            <div className="space-y-3">
              {upcomingEvents.slice(0, 8).length ? (
                upcomingEvents.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.startsAt
                          ? new Date(item.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : item.dayLabel}
                        {" • "}
                        {item.startsAt
                          ? new Date(item.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : item.timeLabel}
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
                      {item.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
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
