"use client";

import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { useState } from "react";
import { 
  FolderKanban, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  Bell,
  Clock3,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Plus,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface SectionProps {
  title: string;
  icon: any;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  alert?: boolean;
}

function Section({ title, icon: Icon, count, children, defaultOpen = true, alert = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all ${alert ? "bg-red-50/50" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? "bg-red-100" : "bg-slate-100"}`}>
            <Icon className={`h-5 w-5 ${alert ? "text-red-600" : "text-slate-600"}`} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{count} item{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {isOpen ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
      </button>
      {isOpen && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
}

function QuickItem({ title, subtitle, link, urgent = false }: {
  title: string;
  subtitle?: string;
  link: string;
  urgent?: boolean;
}) {
  return (
    <Link 
      href={link} 
      className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-all group ${urgent ? "bg-red-50/50 hover:bg-red-100" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${urgent ? "bg-red-500" : "bg-slate-300 group-hover:bg-blue-500"}`} />
        <div>
          <p className={`font-medium ${urgent ? "text-red-800" : "text-slate-800"}`}>{title}</p>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-all" />
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center">
      <CheckCircle2 className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
      <p className="text-slate-500">{message}</p>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
  );
}

export default function TodayPage() {
  const { projects } = useProjectWorkspace();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  if (projects.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">No projects yet</h2>
          <p className="text-slate-500 mt-2">Create your first project to get started</p>
          <Link href="/projects/new" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>
    );
  }

  const activeProject = activeProjectId 
    ? projects.find(p => p.id === activeProjectId) 
    : projects[0];

  const urgentNotifications = activeProject?.notifications.filter(n => !n.read && n.kind === "deadline") || [];
  const unreadNotifications = activeProject?.notifications.filter(n => !n.read) || [];
  const pendingReminders = activeProject?.reminders.filter(r => !r.done) || [];
  const inProgressTasks = activeProject?.sprint.tasks.filter(t => t.status === "In Progress") || [];
  const todoTasks = activeProject?.sprint.tasks.filter(t => t.status === "To Do") || [];
  const doneTasks = activeProject?.sprint.tasks.filter(t => t.status === "Done").length || 0;

  const totalTasks = activeProject?.sprint.tasks.length || 0;
  const sprintProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Today</h1>
          <p className="text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-medium text-slate-700 hover:border-slate-300 transition-all"
            value={activeProjectId || projects[0]?.id || ""}
            onChange={(e) => setActiveProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Link href="/projects/new" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Project" 
          value={activeProject?.name || "Select"} 
          subValue={`Day ${activeProject?.dayCount || 0}`}
          icon={FolderKanban}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          label="Sprint" 
          value={activeProject?.sprint.goal ? `${sprintProgress}%` : "None"} 
          subValue={activeProject?.sprint.goal ? `${doneTasks}/${totalTasks} done` : "No active sprint"}
          icon={Rocket}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          label="To Do" 
          value={todoTasks.length} 
          subValue="tasks remaining"
          icon={CheckCircle2}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          label="In Progress" 
          value={inProgressTasks.length} 
          subValue="active tasks"
          icon={Zap}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {urgentNotifications.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Urgent</span>
              </div>
              {urgentNotifications.map(n => (
                <QuickItem key={n.id} title={n.title} subtitle={n.detail} link={`/projects/${activeProject?.id}`} urgent />
              ))}
            </div>
          )}

          <Section title="In Progress" icon={Zap} count={inProgressTasks.length}>
            {inProgressTasks.length === 0 ? (
              <EmptyState message="No tasks in progress" />
            ) : (
              inProgressTasks.map(t => (
                <QuickItem 
                  key={t.id}
                  title={t.title}
                  subtitle={`Sprint in progress`}
                  link={`/projects/${activeProject?.id}/sprints`}
                />
              ))
            )}
          </Section>

          <Section title="To Do" icon={CheckCircle2} count={todoTasks.length} defaultOpen={false}>
            {todoTasks.length === 0 ? (
              <EmptyState message="All done! 🎉" />
            ) : (
              todoTasks.slice(0, 8).map(t => (
                <QuickItem 
                  key={t.id}
                  title={t.title}
                  link={`/projects/${activeProject?.id}/sprints`}
                />
              ))
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Notifications" icon={Bell} count={unreadNotifications.length} defaultOpen={false}>
            {unreadNotifications.length === 0 ? (
              <EmptyState message="No new notifications" />
            ) : (
              unreadNotifications.map(n => (
                <QuickItem 
                  key={n.id}
                  title={n.title}
                  subtitle={n.whenLabel}
                  link={`/projects/${activeProject?.id}`}
                />
              ))
            )}
          </Section>

          <Section title="Reminders" icon={Clock3} count={pendingReminders.length} defaultOpen={false}>
            {pendingReminders.length === 0 ? (
              <EmptyState message="No pending reminders" />
            ) : (
              pendingReminders.map(r => (
                <QuickItem 
                  key={r.id}
                  title={r.title}
                  subtitle={r.dueLabel}
                  link={`/projects/${activeProject?.id}`}
                />
              ))
            )}
          </Section>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-2">
              <Link href={`/projects/${activeProject?.id}/sections`} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <span className="text-sm">Open Project</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/projects/${activeProject?.id}/sprints`} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <span className="text-sm">Manage Sprint</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/projects/${activeProject?.id}/calendar`} className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                <span className="text-sm">View Calendar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}