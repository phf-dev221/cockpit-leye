"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { Bell, CalendarDays, Clock3, FolderKanban, Gauge, MessageSquareText, Rocket, UserCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { getProjectRoute } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { projects, activeProjectId } = useProjectWorkspace();
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];
  const projectId = activeProject?.id ?? null;
  const navItems = [
    { href: getProjectRoute(projectId), label: "Today", icon: Gauge },
    { href: getProjectRoute(projectId, "/sections"), label: "Workspace", icon: FolderKanban },
    { href: getProjectRoute(projectId, "/calendar"), label: "Calendar", icon: CalendarDays },
    { href: getProjectRoute(projectId, "/sprints"), label: "Sprint", icon: Rocket },
    { href: getProjectRoute(projectId, "/notifications"), label: "Alerts", icon: Bell },
    { href: getProjectRoute(projectId), label: "Notes", icon: MessageSquareText },
    { href: getProjectRoute(projectId), label: "TTM", icon: Clock3 },
    { href: "/account", label: "Account", icon: UserCircle2 }
  ] satisfies Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>;

  return (
    <div className="soft-grid mx-auto min-h-screen max-w-[1720px] px-4 py-4 lg:px-6 lg:py-6">
      <aside className="lg:fixed lg:left-6 lg:top-4 lg:w-[228px] lg:z-20">
        <Card className="flex flex-col gap-6 bg-ink text-surface">
          <div className="flex-1 space-y-5">
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

          </div>
        </Card>
      </aside>

      <main className="min-w-0 pb-4 lg:ml-[255px]">{children}</main>
    </div>
  );
}
