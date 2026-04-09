"use client";

import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";
import { Card } from "@/components/ui/card";
import { 
  FolderKanban, 
  Rocket, 
  CheckCircle2, 
  Clock3, 
  TrendingUp,
  Calendar,
  AlertCircle,
  Target,
  Lightbulb,
  MessageSquare,
  FileText,
  ChevronRight,
  Activity,
  PlusCircle,
  Bell
} from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  const { projects, activeProject, activeProjectId } = useProjectWorkspace();

  const totalProjects = projects.length;
  const activeSprints = projects.filter(p => p.sprint.goal).length;
  const completedSprintTasks = projects.reduce((acc, p) => 
    acc + p.sprint.tasks.filter(t => t.status === "Done").length, 0
  );
  const totalSprintTasks = projects.reduce((acc, p) => 
    acc + p.sprint.tasks.length, 0
  );
  const completedSteps = projects.reduce((acc, p) => 
    acc + p.steps.filter(s => s.value.trim()).length, 0
  );
  const totalSteps = projects.reduce((acc, p) => acc + p.steps.length, 0);
  const openReminders = projects.reduce((acc, p) => 
    acc + p.reminders.filter(r => !r.done).length, 0
  );
  const unreadNotifications = projects.reduce((acc, p) => 
    acc + p.notifications.filter(n => !n.read).length, 0
  );
  const totalDecisions = projects.reduce((acc, p) => acc + p.decisions.length, 0);
  const totalConversations = projects.reduce((acc, p) => acc + p.conversations.length, 0);
  const totalFiles = projects.reduce((acc, p) => acc + p.files.length, 0);
  const totalCanvases = projects.reduce((acc, p) => 
    acc + p.canvases.filter(c => c.value.trim()).length, 0
  );

  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const sprintProgress = totalSprintTasks > 0 ? Math.round((completedSprintTasks / totalSprintTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your activity</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Activity className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Projects</p>
              <p className="text-2xl font-bold text-slate-950">{totalProjects}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Rocket className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Sprints</p>
              <p className="text-2xl font-bold text-slate-950">{activeSprints}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed Tasks</p>
              <p className="text-2xl font-bold text-slate-950">{completedSprintTasks}/{totalSprintTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 rounded-xl">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Alerts</p>
              <p className="text-2xl font-bold text-slate-950">{unreadNotifications + openReminders}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Decisions</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-semibold text-slate-950">{totalDecisions}</p>
          <p className="text-xs text-slate-400">across all projects</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Conversations</span>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-semibold text-slate-950">{totalConversations}</p>
          <p className="text-xs text-slate-400">recorded</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Files</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-semibold text-slate-950">{totalFiles}</p>
          <p className="text-xs text-slate-400">uploaded</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Canvases</span>
            <Lightbulb className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-semibold text-slate-950">{totalCanvases}</p>
          <p className="text-xs text-slate-400">completed</p>
        </Card>
      </div>

      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-950">Overall Progress</h2>
          <TrendingUp className="h-5 w-5 text-slate-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Steps Completed</span>
              <span className="font-medium text-slate-950">{progressPercent}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500">{completedSteps}/{totalSteps} steps completed</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Sprint Tasks</span>
              <span className="font-medium text-slate-950">{sprintProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${sprintProgress}%` }} />
            </div>
            <p className="text-xs text-slate-500">{completedSprintTasks}/{totalSprintTasks} tasks done</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Projects & Sprints</h2>
          <Link href="/projects/new" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            New Project <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <Card className="p-8 border-slate-200 text-center">
            <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No projects yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first project to get started</p>
            <Link href="/projects/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PlusCircle className="h-4 w-4" />
              Create Project
            </Link>
          </Card>
        ) : (
          projects.map((project) => {
            const projectSprintProgress = project.sprint.tasks.length > 0 
              ? Math.round((project.sprint.tasks.filter(t => t.status === "Done").length / project.sprint.tasks.length) * 100)
              : 0;
            const projectStepProgress = Math.round((project.steps.filter(s => s.value.trim()).length / project.steps.length) * 100);
            
            return (
              <Card key={project.id} className="p-5 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                      <FolderKanban className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{project.name}</h3>
                      <p className="text-sm text-slate-500">{project.stageLabel}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">Day {project.dayCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{projectStepProgress}% steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {project.sprint.goal ? `${projectSprintProgress}% sprint` : "No sprint"}
                      </span>
                    </div>
                  </div>
                </div>

                {project.sprint.goal && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Sprint: {project.sprint.goal}</span>
                      <span className="text-xs text-slate-500">{project.sprint.duration}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${projectSprintProgress}%` }} />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2 flex-wrap">
                        {project.sprint.tasks.filter(t => t.status === "To Do").slice(0, 3).map(task => (
                          <span key={task.id} className="px-2 py-1 bg-slate-100 text-xs text-slate-600 rounded">{task.title}</span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {project.sprint.tasks.filter(t => t.status === "Done").length}/{project.sprint.tasks.length} done
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Step Progress:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {project.steps.map((step, index) => (
                      <div key={step.id} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium ${step.value.trim() ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {index + 1}. {step.shortLabel}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/projects/${project.id}`} className="text-xs text-blue-600 hover:underline">Open Project →</Link>
                  <span className="text-slate-300">|</span>
                  <Link href={`/projects/${project.id}/sprints`} className="text-xs text-blue-600 hover:underline">Manage Sprint →</Link>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {openReminders > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-slate-950">{openReminders} pending reminder{openReminders > 1 ? 's' : ''}</p>
              <p className="text-sm text-slate-600">Don't forget to track your deadlines</p>
            </div>
          </div>
        </Card>
      )}

      {unreadNotifications > 0 && (
        <Card className="p-5 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-slate-950">{unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}</p>
              <p className="text-sm text-slate-600">Check your alerts to stay updated</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}