"use client";

import { useState } from "react";
import { CheckCheck, Plus, Trash2 } from "lucide-react";

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

  const notifications = activeProject.notifications;

  return (
    <div className="space-y-5">
      <SectionContainer
        eyebrow="Notifications"
        title="Keep only what matters"
        description="Add a reminder, mark it done, delete the rest."
        className="warm-panel"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
            placeholder="Title"
          />
          <input
            value={draft.whenLabel}
            onChange={(event) => setDraft((current) => ({ ...current, whenLabel: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
            placeholder="When"
          />
          <Button
            className="justify-between"
            onClick={() => {
              void addNotification(draft.title, draft.detail, draft.whenLabel);
              setDraft({ title: "", detail: "", whenLabel: "" });
            }}
            disabled={!draft.title.trim() || !draft.detail.trim() || !draft.whenLabel.trim()}
          >
            Add
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <textarea
          value={draft.detail}
          onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
          className="mt-3 min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/10"
          placeholder="Why should this stay visible?"
        />
      </SectionContainer>

      <SectionContainer
        eyebrow="List"
        title="Notifications"
        description={`${notifications.length} item${notifications.length > 1 ? "s" : ""}`}
        className="warm-panel"
      >
        <div className="space-y-3">
          {notifications.length ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-[1.2rem] border px-4 py-4 ${
                  notification.read ? "border-slate-200 bg-slate-50" : "border-[#d6e7e5] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
                        {notification.whenLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{notification.detail}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghost" className="rounded-full" onClick={() => void toggleNotification(notification.id)}>
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="rounded-full" onClick={() => void removeNotification(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No notification yet.
            </div>
          )}
        </div>
      </SectionContainer>
    </div>
  );
}
