"use client";

import {
  buildStageLabel,
  buildWarning,
  createDemoProject,
  normalizeDemoProject,
  seededDemoProjects
} from "@/lib/data/demo-projects";
import type {
  DemoBoardLane,
  DemoBusinessSnapshot,
  DemoCalendarItem,
  DemoCanvasKey,
  DemoProject,
  DemoSprintTask,
  DemoStepKey,
  DemoStepStatus
} from "@/types";

const STORAGE_KEY = "teranga-power-demo-projects";
const listeners = new Set<() => void>();

export interface ProjectSnapshot {
  activeProjectId: string;
  projects: DemoProject[];
}

export interface CreateProjectPayload {
  founderNote?: string;
  stepValues?: Partial<Record<DemoStepKey, string>>;
  canvasValues?: Partial<Record<DemoCanvasKey, string>>;
}

function getDefaultSnapshot(): ProjectSnapshot {
  return {
    projects: seededDemoProjects,
    activeProjectId: seededDemoProjects[0].id
  };
}

function computeProject(project: DemoProject): DemoProject {
  const firstTodoStep = project.steps.find((step) => !step.value.trim());
  const fallbackStepId = firstTodoStep?.id ?? project.steps[project.steps.length - 1].id;
  const requestedStep = project.steps.find((step) => step.id === project.currentStepId);
  const currentStepId =
    requestedStep && (requestedStep.value.trim() || requestedStep.id === fallbackStepId)
      ? requestedStep.id
      : fallbackStepId;

  const steps = project.steps.map((step) => ({
    ...step,
    status: (step.value.trim() ? "done" : step.id === currentStepId ? "active" : "todo") as DemoStepStatus
  }));

  const nextProject = {
    ...project,
    currentStepId,
    steps
  };

  return {
    ...nextProject,
    stageLabel: buildStageLabel(nextProject),
    warning: buildWarning(nextProject)
  };
}

function updateActiveProject(
  snapshot: ProjectSnapshot,
  updater: (project: DemoProject) => DemoProject
): ProjectSnapshot {
  return {
    ...snapshot,
    projects: snapshot.projects.map((project) =>
      project.id === snapshot.activeProjectId ? computeProject(updater(project)) : project
    )
  };
}

function normalizeSnapshot(snapshot?: Partial<ProjectSnapshot>): ProjectSnapshot {
  const projects = (snapshot?.projects ?? seededDemoProjects)
    .filter((project): project is DemoProject => Boolean(project?.id && project?.name))
    .map((project) => normalizeDemoProject(project));

  const activeProjectId =
    projects.find((project) => project.id === snapshot?.activeProjectId)?.id ?? projects[0].id;

  return { projects, activeProjectId };
}

export const projectService = {
  getInitialSnapshot(): ProjectSnapshot {
    return getDefaultSnapshot();
  },

  loadSnapshot(): ProjectSnapshot {
    if (typeof window === "undefined") {
      return getDefaultSnapshot();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return getDefaultSnapshot();
      }

      return normalizeSnapshot(JSON.parse(raw) as Partial<ProjectSnapshot>);
    } catch {
      return getDefaultSnapshot();
    }
  },

  saveSnapshot(snapshot: ProjectSnapshot) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  resetSnapshot(): ProjectSnapshot {
    return getDefaultSnapshot();
  },

  setActiveProject(snapshot: ProjectSnapshot, projectId: string): ProjectSnapshot {
    return { ...snapshot, activeProjectId: projectId };
  },

  createProject(snapshot: ProjectSnapshot, name: string, seed?: CreateProjectPayload): ProjectSnapshot {
    const project = createDemoProject(name, seed);
    return {
      projects: [project, ...snapshot.projects],
      activeProjectId: project.id
    };
  },

  renameProject(snapshot: ProjectSnapshot, name: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      name: name.trim() || project.name
    }));
  },

  deleteProject(snapshot: ProjectSnapshot, projectId: string): ProjectSnapshot {
    const remainingProjects =
      snapshot.projects.length > 1
        ? snapshot.projects.filter((project) => project.id !== projectId)
        : snapshot.projects;

    return {
      projects: remainingProjects,
      activeProjectId:
        remainingProjects.find((project) => project.id === snapshot.activeProjectId)?.id ??
        remainingProjects[0].id
    };
  },

  updateFounderNote(snapshot: ProjectSnapshot, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({ ...project, founderNote: value }));
  },

  updateFocusItem(snapshot: ProjectSnapshot, focusItemId: string, title: string, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      focusItems: project.focusItems.map((item) =>
        item.id === focusItemId
          ? {
              ...item,
              title: title.trim() || item.title,
              value: value.trim() || item.value
            }
          : item
      )
    }));
  },

  addFocusItem(snapshot: ProjectSnapshot, title: string, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      focusItems:
        title.trim() && value.trim()
          ? [{ id: `focus-${Date.now()}`, title: title.trim(), value: value.trim() }, ...project.focusItems].slice(0, 6)
          : project.focusItems
    }));
  },

  removeFocusItem(snapshot: ProjectSnapshot, focusItemId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      focusItems: project.focusItems.filter((item) => item.id !== focusItemId)
    }));
  },

  updateStepValue(snapshot: ProjectSnapshot, stepId: DemoStepKey, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      steps: project.steps.map((step) => (step.id === stepId ? { ...step, value } : step))
    }));
  },

  updateCanvasValue(snapshot: ProjectSnapshot, canvasId: DemoCanvasKey, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      canvases: project.canvases.map((canvas) =>
        canvas.id === canvasId ? { ...canvas, value } : canvas
      )
    }));
  },

  jumpToStep(snapshot: ProjectSnapshot, stepId: DemoStepKey): ProjectSnapshot {
    return {
      ...snapshot,
      projects: snapshot.projects.map((project) =>
        project.id === snapshot.activeProjectId
          ? computeProject({ ...project, currentStepId: stepId })
          : project
      )
    };
  },

  addDecision(snapshot: ProjectSnapshot, value: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      decisions: value.trim() ? [value.trim(), ...project.decisions].slice(0, 6) : project.decisions
    }));
  },

  toggleTask(snapshot: ProjectSnapshot, taskId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      quickTasks: project.quickTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    }));
  },

  addQuickTask(snapshot: ProjectSnapshot, title: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      quickTasks: title.trim()
        ? [{ id: `task-${Date.now()}`, title: title.trim(), done: false }, ...project.quickTasks].slice(0, 8)
        : project.quickTasks
    }));
  },

  addReminder(snapshot: ProjectSnapshot, title: string, dueLabel: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      reminders:
        title.trim() && dueLabel.trim()
          ? [{ id: `rem-${Date.now()}`, title: title.trim(), dueLabel: dueLabel.trim(), done: false }, ...project.reminders].slice(0, 8)
          : project.reminders
    }));
  },

  toggleReminder(snapshot: ProjectSnapshot, reminderId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      reminders: project.reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, done: !reminder.done } : reminder
      )
    }));
  },

  removeReminder(snapshot: ProjectSnapshot, reminderId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      reminders: project.reminders.filter((reminder) => reminder.id !== reminderId)
    }));
  },

  addCalendarItem(
    snapshot: ProjectSnapshot,
    dayLabel: string,
    timeLabel: string,
    title: string
  ): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      calendar:
        dayLabel.trim() && timeLabel.trim() && title.trim()
          ? [
              ...project.calendar,
              {
                id: `cal-${Date.now()}`,
                dayLabel: dayLabel.trim(),
                timeLabel: timeLabel.trim(),
                title: title.trim(),
                type: "focus"
              } satisfies DemoCalendarItem
            ].slice(-6)
          : project.calendar
    }));
  },

  removeCalendarItem(snapshot: ProjectSnapshot, itemId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      calendar: project.calendar.filter((item) => item.id !== itemId)
    }));
  },

  moveBoardCard(snapshot: ProjectSnapshot, cardId: string, lane: DemoBoardLane): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      boardCards: project.boardCards.map((card) => (card.id === cardId ? { ...card, lane } : card))
    }));
  },

  addNotification(snapshot: ProjectSnapshot, title: string, detail: string, whenLabel: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      notifications:
        title.trim() && detail.trim() && whenLabel.trim()
          ? [
              {
                id: `notif-${Date.now()}`,
                title: title.trim(),
                detail: detail.trim(),
                whenLabel: whenLabel.trim(),
                read: false,
                kind: "reminder" as const
              },
              ...project.notifications
            ].slice(0, 10)
          : project.notifications
    }));
  },

  toggleNotification(snapshot: ProjectSnapshot, notificationId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      notifications: project.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: !notification.read } : notification
      )
    }));
  },

  removeNotification(snapshot: ProjectSnapshot, notificationId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      notifications: project.notifications.filter((notification) => notification.id !== notificationId)
    }));
  },

  addConversation(
    snapshot: ProjectSnapshot,
    person: string,
    context: string,
    painPoints: string,
    signals: string,
    trustLevel: "Low" | "Medium" | "High",
    learned: string
  ): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      conversations:
        person.trim() && context.trim()
          ? [
              {
                id: `conv-${Date.now()}`,
                person: person.trim(),
                context: context.trim(),
                painPoints: painPoints.trim(),
                signals: signals.trim(),
                trustLevel,
                learned: learned.trim()
              },
              ...project.conversations
            ].slice(0, 12)
          : project.conversations
    }));
  },

  removeConversation(snapshot: ProjectSnapshot, conversationId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      conversations: project.conversations.filter((conversation) => conversation.id !== conversationId)
    }));
  },

  addFileRecord(snapshot: ProjectSnapshot, name: string, target: string, url: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      files:
        name.trim() && target.trim()
          ? [
              {
                id: `file-${Date.now()}`,
                name: name.trim(),
                target: target.trim(),
                url: url.trim() || "pending-upload"
              },
              ...project.files
            ].slice(0, 12)
          : project.files
    }));
  },

  removeFileRecord(snapshot: ProjectSnapshot, fileId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      files: project.files.filter((file) => file.id !== fileId)
    }));
  },

  updateSprintField(
    snapshot: ProjectSnapshot,
    field: "goal" | "duration" | "review" | "retrospective",
    value: string
  ): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      sprint: {
        ...project.sprint,
        [field]: value
      }
    }));
  },

  addSprintTask(snapshot: ProjectSnapshot, title: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      sprint: {
        ...project.sprint,
        tasks: title.trim()
          ? [...project.sprint.tasks, { id: `sprint-task-${Date.now()}`, title: title.trim(), status: "To Do" as const }]
          : project.sprint.tasks
      }
    }));
  },

  moveSprintTask(
    snapshot: ProjectSnapshot,
    taskId: string,
    status: DemoSprintTask["status"]
  ): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      sprint: {
        ...project.sprint,
        tasks: project.sprint.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
      }
    }));
  },

  removeSprintTask(snapshot: ProjectSnapshot, taskId: string): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      sprint: {
        ...project.sprint,
        tasks: project.sprint.tasks.filter((task) => task.id !== taskId)
      }
    }));
  },

  advanceDay(snapshot: ProjectSnapshot): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      dayCount: project.dayCount + 1
    }));
  },

  updateBusinessField<
    TSection extends keyof DemoBusinessSnapshot,
    TField extends keyof DemoBusinessSnapshot[TSection]
  >(
    snapshot: ProjectSnapshot,
    section: TSection,
    field: TField,
    value: DemoBusinessSnapshot[TSection][TField]
  ): ProjectSnapshot {
    return updateActiveProject(snapshot, (project) => ({
      ...project,
      business: {
        ...project.business,
        [section]: {
          ...project.business[section],
          [field]: value
        }
      }
    }));
  }
};
