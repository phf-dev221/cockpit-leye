"use client";

import type { ComponentType } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, FolderKanban, Gauge, PlusCircle, Rocket, Settings2, UserCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { cn, getProjectRoute } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { projects, activeProjectId, activeProject, setActiveProject } = useProjectWorkspace();
  const projectId = activeProject?.id ?? activeProjectId ?? projects[0]?.id ?? null;
  const navItems = [
    { href: "/today", label: "Today", icon: Gauge },
    { href: getProjectRoute(projectId, "/sections"), label: "Workspace", icon: FolderKanban },
    { href: getProjectRoute(projectId, "/calendar"), label: "Calendar", icon: CalendarDays },
    { href: getProjectRoute(projectId, "/notifications"), label: "Alerts", icon: Bell },
    { href: getProjectRoute(projectId, "/sprints"), label: "Sprint", icon: Rocket },
    { href: getProjectRoute(projectId, "/manage"), label: "Manage", icon: Settings2 },
    { href: "/account", label: "Account", icon: UserCircle2 }
  ] satisfies Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>;

  return (
    <div className="soft-grid mx-auto min-h-screen max-w-[1720px] px-4 py-4 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-6 lg:py-6">
      <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start">
        <Card className="flex flex-col h-full border-slate-200 bg-[#0f1720] text-slate-50 lg:max-h-[calc(100vh-3rem)]">
          <div className="flex flex-col gap-4 p-4 min-h-0 flex-1">
            <div className="flex-shrink-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-surface/55">Teranga Cockpit</p>
              <h1 className="mt-2 text-xl font-semibold sm:text-2xl">Personal Desk</h1>
            </div>

            <div className="flex-shrink-0 rounded-[1.35rem] border border-white/10 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300/80">Project</p>
              <p className="mt-2 truncate text-sm font-semibold text-surface">
                {activeProject?.name ?? "No project yet"}
              </p>

              {projects.length ? (
                <select
                  value={projectId ?? ""}
                  onChange={(event) => setActiveProject(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#111927] px-3 py-2 text-sm text-white outline-none"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <Link
                href="/projects/new"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f6f8fb] px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
              >
                <PlusCircle className="h-4 w-4" />
                Add project
              </Link>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto min-h-0">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
                      isActive
                        ? "border-[#b7d6d0] bg-white text-slate-950 shadow-sm"
                        : "border-transparent bg-transparent text-slate-200/88 hover:border-white/10 hover:bg-white/6 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </Card>
      </aside>

      <main className="mt-5 min-w-0 pb-4 lg:mt-0">{children}</main>
    </div>
  );
}
