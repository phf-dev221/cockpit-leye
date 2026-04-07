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
    { href: getProjectRoute(projectId), label: "Today", icon: Gauge },
    { href: getProjectRoute(projectId, "/sections"), label: "Workspace", icon: FolderKanban },
    { href: getProjectRoute(projectId, "/calendar"), label: "Calendar", icon: CalendarDays },
    { href: getProjectRoute(projectId, "/notifications"), label: "Alerts", icon: Bell },
    { href: getProjectRoute(projectId, "/sprints"), label: "Sprint", icon: Rocket },
    { href: getProjectRoute(projectId, "/manage"), label: "Manage", icon: Settings2 },
    { href: "/account", label: "Account", icon: UserCircle2 }
  ] satisfies Array<{ href: string; label: string; icon: ComponentType<{ className?: string }> }>;

  return (
    <div className="soft-grid mx-auto min-h-screen max-w-[1720px] px-4 py-4 lg:px-6 lg:py-6">
      <aside className="lg:fixed lg:left-6 lg:top-4 lg:w-[240px] lg:z-20">
        <Card className="flex flex-col gap-5 bg-ink text-surface">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-surface/55">Teranga Cockpit</p>
              <h1 className="mt-2 text-xl font-semibold sm:text-2xl">Personal Desk</h1>
            </div>

            <div className="rounded-[1.35rem] border border-white/8 bg-white/5 p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-surface/48">Project</p>
              <p className="mt-2 truncate text-sm font-semibold text-surface">
                {activeProject?.name ?? "No project yet"}
              </p>

              {projects.length ? (
                <select
                  value={projectId ?? ""}
                  onChange={(event) => setActiveProject(event.target.value)}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#171311] px-3 py-2 text-sm text-surface outline-none"
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
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface"
              >
                <PlusCircle className="h-4 w-4" />
                New project
              </Link>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;

                return (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "flex min-w-fit items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition lg:min-w-0 lg:px-4 lg:py-3",
                      isActive
                        ? "border-white/12 bg-white text-ink"
                        : "border-white/8 bg-white/5 text-surface/78 hover:bg-white/10 hover:text-surface lg:border-transparent lg:bg-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </Card>
      </aside>

      <main className="min-w-0 pb-4 lg:ml-[267px]">{children}</main>
    </div>
  );
}
