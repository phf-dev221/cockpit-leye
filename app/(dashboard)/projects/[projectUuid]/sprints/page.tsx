"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Rocket,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Target,
  Calendar,
  Flag,
  Zap,
  Clock,
  X,
  Save,
  BarChart3,
  Play,
  Users,
  Gauge,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Activity,
  Bug,
  Shield,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SprintTask, Sprint } from "@/types";

const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13];

const ROLES = [
  { id: "product_owner", label: "Product Owner", icon: Flag, description: "Sets priorities, defines sprint goals, acceptance criteria" },
  { id: "developer", label: "Developer", icon: Zap, description: "Estimates tasks, commits to deliverables, technical insights" },
  { id: "scrum_master", label: "Scrum Master", icon: Shield, description: "Facilitates planning, removes roadblocks" }
];

const SPRINT_DURATIONS = [
  { value: 7, label: "1 Week", description: "Feature validation, bug fixes" },
  { value: 14, label: "2 Weeks", description: "Core feature development (standard)" },
  { value: 21, label: "3 Weeks", description: "Complex integration projects" }
];

const taskColumns = [
  { id: "To Do", label: "To Do", color: "border-slate-200 bg-slate-50", icon: Circle },
  { id: "In Progress", label: "In Progress", color: "border-amber-200 bg-amber-50", icon: Clock },
  { id: "Done", label: "Done", color: "border-emerald-200 bg-emerald-50", icon: CheckCircle2 }
];

type TabId = "planning" | "active" | "retrospective";
type SprintState = Sprint & { status?: string };

export default function SprintsPage() {
  const params = useParams();
  const projectUuid = (params.projectUuid || params.projectId) as string;
  const [activeTab, setActiveTab] = useState<TabId>("planning");
  
  const [sprint, setSprint] = useState<SprintState>({
    id: "",
    goal: "",
    duration: "",
    review: "",
    retrospective: "",
    tasks: []
  });
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  
  const [sprintForm, setSprintForm] = useState({
    goal: "",
    duration: 14,
    review: "",
    retrospective: ""
  });
  
  const [selectedRole, setSelectedRole] = useState("");
  const [velocityTarget, setVelocityTarget] = useState(21);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    points: 0,
    priority: "medium" as "low" | "medium" | "high"
  });
  
  const [backlogFilter, setBacklogFilter] = useState("");
  const [standupEntries, setStandupEntries] = useState<{id: string, date: string, yesterday: string, today: string, blockers: string}[]>([]);

  useEffect(() => {
    if (!projectUuid) return;
    loadSprintData();
  }, [projectUuid]);

  const loadSprintData = async () => {
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const data = await projectApi.getProjectSprint(projectUuid);
      if (data) {
        setSprint(data);
        const durationNum = typeof data.duration === 'string' 
          ? parseInt(data.duration) || 14 
          : data.duration || 14;
        setSprintForm({
          goal: data.goal || "",
          duration: durationNum,
          review: data.review || "",
          retrospective: data.retrospective || ""
        });
        setSelectedRole("");
        setVelocityTarget(21);
      }
    } catch {
    }
  };

  const handleSaveSprint = async () => {
    setIsSaving(true);
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const payload = {
        goal: sprintForm.goal,
        duration: `${sprintForm.duration} days`,
        review: sprintForm.review,
        retrospective: sprintForm.retrospective,
        status: "planned"
      };
      
      if (sprint.id && sprint.id !== "null" && sprint.id !== "") {
        await projectApi.updateSprintById(projectUuid, sprint.id, payload);
      } else {
        await projectApi.createSprint(projectUuid, payload);
      }
      
      setSprint({ ...sprint, ...payload });
      loadSprintData();
    } catch (error) {
      console.error("Error saving sprint:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartSprint = async () => {
    setIsSaving(true);
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const payload = {
        goal: sprintForm.goal,
        duration: `${sprintForm.duration} days`,
        review: sprintForm.review,
        retrospective: sprintForm.retrospective,
        status: "active",
        started_at: new Date().toISOString()
      };
      
      if (sprint.id && sprint.id !== "null" && sprint.id !== "") {
        await projectApi.updateSprintById(projectUuid, sprint.id, payload);
      } else {
        await projectApi.createSprint(projectUuid, payload);
      }
      
      setSprint({ ...sprint, ...payload, status: "active" });
      setActiveTab("active");
      loadSprintData();
    } catch (error) {
      console.error("Error starting sprint:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSprint = async () => {
    setIsSaving(true);
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      const payload = {
        goal: sprintForm.goal,
        duration: `${sprintForm.duration} days`,
        review: sprintForm.review,
        retrospective: sprintForm.retrospective,
        status: "closed",
        ended_at: new Date().toISOString()
      };
      
      await projectApi.updateSprintById(projectUuid, sprint.id, payload);
      setSprint({ ...sprint, ...payload, status: "closed" });
    } catch (error) {
      console.error("Error closing sprint:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !sprint.id) return;
    
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      await projectApi.createSprintTask(projectUuid, { 
        title: newTaskTitle, 
        status: "todo" as const,
        description: taskForm.description,
        starts_at: taskForm.starts_at || undefined,
        ends_at: taskForm.ends_at || undefined,
        sprint_id: sprint.id
      });
      setNewTaskTitle("");
      loadSprintData();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    if (!sprint.id) return;

    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      await projectApi.updateSprintTask(projectUuid, taskId, { sprintId: sprint.id, status: newStatus });
      
      setSprint(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          String(t.id) === String(taskId) ? { ...t, status: newStatus as "To Do" | "In Progress" | "Done" } : t
        )
      }));
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?") || !sprint.id) return;
    
    try {
      const { projectApi } = await import("@/features/projects/services/project-api");
      await projectApi.deleteSprintTask(projectUuid, sprint.id, taskId);
      loadSprintData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getColumnStats = (status: string) => {
    return sprint.tasks?.filter(t => t.status === status).length || 0;
  };

  const totalTasks = sprint.tasks?.length || 0;
  const doneTasks = sprint.tasks?.filter((t: any) => t.status === "Done").length || 0;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalStoryPoints = sprint.tasks?.reduce((sum: number, t: any) => sum + ((t as any).points || 0), 0) || 0;
  const completedStoryPoints = sprint.tasks?.filter((t: any) => t.status === "done").reduce((sum: number, t: any) => sum + ((t as any).points || 0), 0) || 0;
  const velocity = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

  const leadTime = 3;
  const techDebtRatio = 15;

  const isSMARTGoal = (goal: string) => {
    if (!goal) return false;
    const hasSpecific = goal.length > 20;
    const hasMeasurable = /\d+%|\d+\s+(tasks|features|items)|complete/i.test(goal);
    const hasAchievable = goal.length < 200;
    const hasRelevant = goal.length > 10;
    const hasTimeBound = /\d+\s+(day|week|sprint)/i.test(goal);
    return hasSpecific && hasMeasurable && hasAchievable && hasRelevant && hasTimeBound;
  };

  const renderPlanningTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sprint Goal (SMART)</h2>
            <p className="text-sm text-slate-500">Specific, Measurable, Achievable, Relevant, Time-bound</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Textarea
            value={sprintForm.goal}
            onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
            placeholder="Ex: Complete user authentication with 3 features, achieving 95% test coverage within 2 weeks..."
            rows={3}
            className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:ring-0 transition"
          />
          
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isSMARTGoal(sprintForm.goal) ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
            {isSMARTGoal(sprintForm.goal) ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <span className={`text-sm font-medium ${isSMARTGoal(sprintForm.goal) ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isSMARTGoal(sprintForm.goal) 
                ? "Goal meets SMART criteria" 
                : "Tip: Include specific numbers, timeframe (days/weeks), and measurable outcomes"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Team Roles</h2>
            <p className="text-sm text-slate-500">Define responsibilities for this sprint</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(isSelected ? "" : role.id)}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  isSelected 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected 
                    ? 'bg-violet-600' 
                    : 'bg-slate-100'
                }`}>
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <h3 className="font-semibold text-slate-900">{role.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{role.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sprint Duration</h2>
            <p className="text-sm text-slate-500">Choose the appropriate length for your objectives</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPRINT_DURATIONS.map((duration) => {
            const isSelected = sprintForm.duration === duration.value;
            
            return (
              <button
                key={duration.value}
                onClick={() => setSprintForm({ ...sprintForm, duration: duration.value })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  isSelected 
                    ? 'border-violet-500 bg-violet-50' 
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <h3 className="font-semibold text-slate-900">{duration.label}</h3>
                <p className="text-xs text-slate-500 mt-1">{duration.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Product Backlog</h2>
              <p className="text-sm text-slate-500">User stories with story points</p>
            </div>
          </div>
          <Input
            placeholder="Filter backlog..."
            value={backlogFilter}
            onChange={(e) => setBacklogFilter(e.target.value)}
            className="w-48"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add user story (e.g., As a user, I can...)"
              className="flex-1"
            />
            <Button onClick={handleAddTask} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4">
            {!sprint.tasks || sprint.tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No backlog items. Add user stories above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sprint.tasks
                  .filter(t => backlogFilter === "" || t.title.toLowerCase().includes(backlogFilter.toLowerCase()))
                  .map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"
                    >
                      <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 font-bold text-sm">
                        {(task as any).points || 0}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{task.title}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-slate-500 px-2">
            <span>Total: {sprint.tasks?.length || 0} items</span>
            <span>Points: {totalStoryPoints} ({Math.round(totalStoryPoints * 0.8)} usable with 20% reserve)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Gauge className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Workload Planning</h2>
            <p className="text-sm text-slate-500">Story points using Fibonacci sequence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-slate-600">Velocity Target:</span>
          <div className="flex gap-2">
            {FIBONACCI_POINTS.map(point => (
              <button
                key={point}
                onClick={() => setVelocityTarget(point)}
                className={`w-10 h-10 rounded-lg font-bold transition ${
                  velocityTarget === point
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-violet-100'
                }`}
              >
                {point}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Capacity</p>
            <p className="text-2xl font-bold text-slate-900">{velocityTarget} pts</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Reserve (20%)</p>
            <p className="text-2xl font-bold text-slate-900">{Math.round(velocityTarget * 0.2)} pts</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Usable</p>
            <p className="text-2xl font-bold text-slate-900">{Math.round(velocityTarget * 0.8)} pts</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleStartSprint}
        disabled={!sprintForm.goal.trim() || !selectedRole}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-12 text-lg"
      >
        <Rocket className="h-5 w-5 mr-2" />
        Start Sprint
      </Button>
    </div>
  );

  const renderActiveTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Stand-up</h2>
            <p className="text-sm text-slate-500">3 questions for the team</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString()}</p>
            <Input placeholder="What did you accomplish yesterday?" className="mb-2" />
            <Input placeholder="What will you do today?" className="mb-2" />
            <Input placeholder="Any blockers?" />
          </div>
          
          {standupEntries.length > 0 && (
            <div className="space-y-2 mt-4">
              {standupEntries.map(entry => (
                <div key={entry.id} className="bg-slate-50 rounded-xl p-3 text-sm">
                  <p className="text-xs text-slate-500 mb-1">{entry.date}</p>
                  <p><span className="font-medium">Yesterday:</span> {entry.yesterday}</p>
                  <p><span className="font-medium">Today:</span> {entry.today}</p>
                  {entry.blockers && <p className="text-red-600"><span className="font-medium">Blockers:</span> {entry.blockers}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sprint Tasks</h2>
              <p className="text-sm text-slate-500">Drag tasks to update status</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taskColumns.map((column) => {
            const columnTasks = sprint.tasks.filter(t => t.status === column.id);
            const Icon = column.icon;
            
            return (
              <div
                key={column.id}
                className={`rounded-xl border-2 ${column.color} p-3 min-h-[250px]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-700 text-sm">{column.label}</span>
                  </div>
                  <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
                    {getColumnStats(column.id)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {columnTasks.map((task: any) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedTask(String(task.id))}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedTask && task.status !== column.id) {
                          handleMoveTask(draggedTask, column.id);
                        }
                      }}
                      className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition cursor-move group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-violet-100 rounded text-violet-700 text-xs font-bold flex items-center justify-center">
                            {(task as any).points || 0}
                          </div>
                          <p className="font-medium text-slate-800 text-sm flex-1">{task.title}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sprint Progress</h2>
            <p className="text-sm text-slate-500">Track your velocity and completion</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase">Tasks Done</p>
              <p className="text-xl font-bold text-slate-900">{doneTasks}/{totalTasks}</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase">Progress</p>
              <p className="text-xl font-bold text-slate-900">{progress}%</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase">Points</p>
              <p className="text-xl font-bold text-slate-900">{completedStoryPoints}/{totalStoryPoints}</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase">Velocity</p>
              <p className="text-xl font-bold text-slate-900">{velocity}%</p>
            </div>
          </div>
          
          <Button
            onClick={handleCloseSprint}
            variant="ghost"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Close Sprint
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRetrospectiveTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sprint Review</h2>
            <p className="text-sm text-slate-500">Compare completed vs goals</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sprint Goal</p>
            <p className="font-medium text-slate-900">{sprint.goal || "No goal set"}</p>
          </div>
          
          <Textarea
            value={sprintForm.review}
            onChange={(e) => setSprintForm({ ...sprintForm, review: e.target.value })}
            placeholder="What was accomplished in this sprint..."
            rows={4}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Retrospective</h2>
            <p className="text-sm text-slate-500">Identify patterns and create action items</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Textarea
            value={sprintForm.retrospective}
            onChange={(e) => setSprintForm({ ...sprintForm, retrospective: e.target.value })}
            placeholder="What went well? What can be improved? Action items for next sprint..."
            rows={4}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Metrics</h2>
            <p className="text-sm text-slate-500">Key performance indicators</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border-2 ${velocity < 90 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Gauge className={`h-4 w-4 ${velocity < 90 ? 'text-amber-600' : 'text-emerald-600'}`} />
              <p className={`text-xs font-medium ${velocity < 90 ? 'text-amber-700' : 'text-emerald-700'}`}>
                Sprint Velocity
              </p>
            </div>
            <p className={`text-2xl font-bold ${velocity < 90 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {velocity}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Target: variance &lt; 10%</p>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${leadTime <= 5 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 ${leadTime <= 5 ? 'text-emerald-600' : 'text-amber-600'}`} />
              <p className={`text-xs font-medium ${leadTime <= 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                Lead Time
              </p>
            </div>
            <p className={`text-2xl font-bold ${leadTime <= 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {leadTime} days
            </p>
            <p className="text-xs text-slate-500 mt-1">Target: 2-5 days</p>
          </div>
          
          <div className={`p-4 rounded-xl border-2 ${techDebtRatio < 25 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Bug className={`h-4 w-4 ${techDebtRatio < 25 ? 'text-emerald-600' : 'text-amber-600'}`} />
              <p className={`text-xs font-medium ${techDebtRatio < 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
                Tech Debt
              </p>
            </div>
            <p className={`text-2xl font-bold ${techDebtRatio < 25 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {techDebtRatio}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Target: Below 25%</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSaveSprint}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Retrospective
      </Button>
    </div>
  );

  const tabs = [
    { id: "planning" as const, label: "Planning", icon: ClipboardList },
    { id: "active" as const, label: "Active Sprint", icon: Rocket },
    { id: "retrospective" as const, label: "Retrospective", icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Agile Sprints
              </h1>
              <p className="text-slate-500">
                AlterSquare Framework
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-violet-600" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Sprint Goal
              </span>
            </div>
            <p className="text-lg font-semibold text-slate-900 line-clamp-2">
              {sprint.goal || "No goal set"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-violet-600" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Duration
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {sprintForm.duration} days
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-violet-600" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Progress
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{progress}%</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="h-5 w-5 text-violet-600" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Velocity
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{velocity}%</p>
          </div>
        </div>

        {activeTab === "planning" && renderPlanningTab()}
        {activeTab === "active" && renderActiveTab()}
        {activeTab === "retrospective" && renderRetrospectiveTab()}
      </div>
    </div>
  );
}
