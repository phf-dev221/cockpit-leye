"use client";

import { useState } from "react";
import { CheckCheck, Clock3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/section-container";
import { EmptyProjectState } from "@/features/projects/components/empty-project-state";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useSyncProjectRoute } from "@/features/projects/hooks/use-sync-project-route";

export function ProjectNotificationsScreen({ projectId }: { projectId: string }) {
  useSyncProjectRoute(projectId);
  const { activeProject, addNotification, toggleNotification, removeNotification } = useProjectWorkspace();
  const [draft, setDraft] = useState({
    title: "",
    detail: "",
    whenLabel: ""
  });

  if (!activeProject) {
    return <EmptyProjectState />;
  }

  const unreadCount = activeProject.notifications.filter((item) => !item.read).length;
  const readCount = activeProject.notifications.length - unreadCount;
  const nextNotification = activeProject.notifications.find((item) => !item.read) ?? activeProject.notifications[0] ?? null;

  return (
    <div className="space-y-5">
      <SectionContainer
        eyebrow="Alerts"
        title="Notifications"
        description="Capture reminders, follow-ups, and signals worth keeping visible for this project."
        className="bg-white"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,#191614_0%,#241b16_48%,#33241c_100%)] p-5 text-white shadow-[0_22px_60px_rgba(15,10,7,0.24)]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Current signal</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {nextNotification?.title ?? "No alert yet"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
              {nextNotification?.detail ?? "Use this page to log the next reminder, deadline, or signal you want to keep in view."}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/78">
              <Clock3 className="h-4 w-4" />
              {nextNotification?.whenLabel ?? "Nothing scheduled"}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Unread</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{unreadCount}</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Read</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{readCount}</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{activeProject.notifications.length}</p>
            </div>
          </div>
        </div>
      </SectionContainer>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <SectionContainer
          eyebrow="New Alert"
          title="Add a notification"
          description="Keep only the alerts that should really influence what happens next."
          className="bg-white"
        >
          <div className="space-y-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              placeholder="Title"
            />
            <input
              value={draft.whenLabel}
              onChange={(event) => setDraft((current) => ({ ...current, whenLabel: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-slate-400"
              placeholder="When"
            />
            <textarea
              value={draft.detail}
              onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
              className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-400"
              placeholder="Why should this alert exist?"
            />
            <Button
              className="w-full justify-between"
              onClick={() => {
                void addNotification(draft.title, draft.detail, draft.whenLabel);
                setDraft({ title: "", detail: "", whenLabel: "" });
              }}
              disabled={!draft.title.trim() || !draft.detail.trim() || !draft.whenLabel.trim()}
            >
              Add notification
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SectionContainer>

        <SectionContainer
          eyebrow="Queue"
          title="All notifications"
          description="Review, mark as read, and remove anything that no longer deserves attention."
          className="bg-white"
        >
          <div className="space-y-3">
            {activeProject.notifications.length ? (
              activeProject.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-[1.25rem] border p-4 transition ${
                    notification.read
                      ? "border-slate-200 bg-slate-50"
                      : "border-[#e6cfb3] bg-[linear-gradient(180deg,#fff7ee_0%,#f9efdf_100%)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                          {notification.kind}
                        </span>
                        <span className="text-xs text-slate-500">{notification.whenLabel}</span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-slate-950">{notification.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{notification.detail}</p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button variant="ghost" onClick={() => void toggleNotification(notification.id)}>
                        <CheckCheck className="h-4 w-4" />
                        {notification.read ? "Unread" : "Read"}
                      </Button>
                      <Button variant="ghost" onClick={() => void removeNotification(notification.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No notifications yet.
              </div>
            )}
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
