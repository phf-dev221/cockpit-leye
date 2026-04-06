"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { Bell, Clock3, FolderKanban, Gauge, MessageSquareText, Rocket } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { DEFAULT_PROJECT_ID } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { projects, activeProjectId } = useProjectWorkspace();
  const lazyMode = useUiStore((state) => state.lazyMode);
  const toggleLazyMode = useUiStore((state) => state.toggleLazyMode);
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const projectId = activeProject?.id ?? DEFAULT_PROJECT_ID;
  const navItems = [
    { href: `/projects/${projectId}`, label: "Today", icon: Gauge },
    { href: `/projects/${projectId}/sections`, label: "Workspace", icon: FolderKanban },
    { href: `/projects/${projectId}/sprints`, label: "Sprint", icon: Rocket },
    { href: `/projects/${projectId}/notifications`, label: "Alerts", icon: Bell },
    { href: `/projects/${projectId}`, label: "Notes", icon: MessageSquareText },
    { href: `/projects/${projectId}`, label: "TTM", icon: Clock3 }
  ] satisfies Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>;

  return (
    <div className="soft-grid mx-auto grid min-h-screen max-w-[1720px] gap-5 px-4 py-4 lg:grid-cols-[228px_minmax(0,1fr)] lg:gap-7 lg:px-6 lg:py-6">
      <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
        <Card className="flex h-full flex-col gap-6 bg-ink text-surface">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-surface/55">Teranga Cockpit</p>
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Personal Desk</h1>
                <p className="mt-1 text-sm text-surface/68">
                  Manual-first. Fast enough for lazy days.
                </p>
              </div>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex min-w-fit items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-surface/78 transition hover:bg-white/10 hover:text-surface lg:min-w-0 lg:border-transparent lg:bg-transparent lg:px-4 lg:py-3"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => toggleLazyMode()}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-surface/82 transition hover:bg-white/10"
            >
              <span className="block text-[11px] uppercase tracking-[0.18em] text-surface/52">
                Interface Mode
              </span>
              <span className="mt-1 block font-medium">
                {lazyMode ? "Lazy mode on" : "Lazy mode off"}
              </span>
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-surface/55">Active Project</p>
            <p className="mt-2 text-base font-medium">{activeProject?.name ?? "Founder cockpit"}</p>
            <p className="mt-1 text-sm text-surface/70">{activeProject?.stageLabel ?? "Demo flow"}</p>
            <p className="mt-3 text-sm text-amber-100/90">
              {activeProject?.warning ?? "Create a project and move through the steps."}
            </p>
          </div>
        </Card>
      </aside>

      <main className="min-w-0 pb-4">{children}</main>
    </div>
  );
}
