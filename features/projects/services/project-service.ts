"use client";

import { buildStageLabel, buildWarning, normalizeDemoProject } from "@/lib/data/demo-projects";
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

import { projectApi } from "@/features/projects/services/project-api";

export interface ProjectSnapshot {
  activeProjectId: string | null;
  projects: DemoProject[];
}

export interface CreateProjectPayload {
  founderNote?: string;
  stepValues?: Partial<Record<DemoStepKey, string>>;
  canvasValues?: Partial<Record<DemoCanvasKey, string>>;
}

const EMPTY_SNAPSHOT: ProjectSnapshot = {
  projects: [],
  activeProjectId: null
};

function computeProject(project: DemoProject): DemoProject {
  const firstTodoStep = project.steps.find((step) => !step.value.trim());
  const fallbackStepId = firstTodoStep?.id ?? project.steps[project.steps.length - 1]?.id ?? "define-problem";
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

function normalizeSnapshot(snapshot?: Partial<ProjectSnapshot>): ProjectSnapshot {
  const projects = (snapshot?.projects ?? [])
    .filter((project): project is DemoProject => Boolean(project?.id && project?.name))
    .map((project) => computeProject(normalizeDemoProject(project)));

  const activeProjectId =
    projects.find((project) => project.id === snapshot?.activeProjectId)?.id ?? projects[0]?.id ?? null;

  return { projects, activeProjectId };
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

async function persistActiveProject(snapshot: ProjectSnapshot) {
  const activeProject = snapshot.projects.find((project) => project.id === snapshot.activeProjectId);

  if (!activeProject) {
    return snapshot;
  }

  await projectApi.updateProject(activeProject.id, activeProject);
  return snapshot;
}

export const projectService = {
  getInitialSnapshot(): ProjectSnapshot {
    return EMPTY_SNAPSHOT;
  },

  async loadSnapshot(): Promise<ProjectSnapshot> {
    try {
      const response = await projectApi.listProjects();
      return normalizeSnapshot({
        projects: response.data ?? [],
        activeProjectId: response.meta?.activeProjectId ?? response.data?.[0]?.id ?? null
      });
    } catch {
      return EMPTY_SNAPSHOT;
    }
  },

  setActiveProject(snapshot: ProjectSnapshot, projectId: string): ProjectSnapshot {
    if (!snapshot.projects.some((project) => project.id === projectId)) {
      return snapshot;
    }

    return { ...snapshot, activeProjectId: projectId };
  },

  async refreshSnapshot(snapshot?: ProjectSnapshot): Promise<ProjectSnapshot> {
    const latest = await this.loadSnapshot();
    if (!snapshot?.activeProjectId) {
      return latest;
    }

    return {
      ...latest,
      activeProjectId:
        latest.projects.find((project) => project.id === snapshot.activeProjectId)?.id ?? latest.activeProjectId
    };
  },

  async createProject(snapshot: ProjectSnapshot, name: string, seed?: CreateProjectPayload): Promise<ProjectSnapshot> {
    const response = await projectApi.createProject({
      name: name.trim(),
      founderNote: seed?.founderNote,
      stepValues: seed?.stepValues,
      canvasValues: seed?.canvasValues
    });

    const createdProject = response.data ? computeProject(normalizeDemoProject(response.data)) : null;
    const projects = createdProject ? [createdProject, ...snapshot.projects] : snapshot.projects;

    return normalizeSnapshot({
      projects,
      activeProjectId: createdProject?.id ?? snapshot.activeProjectId
    });
  },

  async renameProject(snapshot: ProjectSnapshot, name: string): Promise<ProjectSnapshot> {
    const nextSnapshot = updateActiveProject(snapshot, (project) => ({
      ...project,
      name: name.trim() || project.name
    }));

    return persistActiveProject(nextSnapshot);
  },

  async deleteProject(snapshot: ProjectSnapshot, projectId: string): Promise<ProjectSnapshot> {
    await projectApi.deleteProject(projectId);
    const remainingProjects = snapshot.projects.filter((project) => project.id !== projectId);
    return normalizeSnapshot({
      projects: remainingProjects,
      activeProjectId:
        remainingProjects.find((project) => project.id === snapshot.activeProjectId)?.id ?? remainingProjects[0]?.id ?? null
    });
  },

  async updateFounderNote(snapshot: ProjectSnapshot, value: string): Promise<ProjectSnapshot> {
    return persistActiveProject(updateActiveProject(snapshot, (project) => ({ ...project, founderNote: value })));
  },

  async updateFocusItem(
    snapshot: ProjectSnapshot,
    focusItemId: string,
    title: string,
    value: string
  ): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
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
      }))
    );
  },

  async addFocusItem(snapshot: ProjectSnapshot, title: string, value: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        focusItems:
          title.trim() && value.trim()
            ? [{ id: `focus-${Date.now()}`, title: title.trim(), value: value.trim() }, ...project.focusItems].slice(0, 6)
            : project.focusItems
      }))
    );
  },

  async removeFocusItem(snapshot: ProjectSnapshot, focusItemId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        focusItems: project.focusItems.filter((item) => item.id !== focusItemId)
      }))
    );
  },

  async updateStepValue(snapshot: ProjectSnapshot, stepId: DemoStepKey, value: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        steps: project.steps.map((step) => (step.id === stepId ? { ...step, value } : step))
      }))
    );
  },

  async updateCanvasValue(snapshot: ProjectSnapshot, canvasId: DemoCanvasKey, value: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        canvases: project.canvases.map((canvas) => (canvas.id === canvasId ? { ...canvas, value } : canvas))
      }))
    );
  },

  async jumpToStep(snapshot: ProjectSnapshot, stepId: DemoStepKey): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        currentStepId: stepId
      }))
    );
  },

  async addDecision(snapshot: ProjectSnapshot, value: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        decisions: value.trim() ? [value.trim(), ...project.decisions].slice(0, 6) : project.decisions
      }))
    );
  },

  async toggleTask(snapshot: ProjectSnapshot, taskId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        quickTasks: project.quickTasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task))
      }))
    );
  },

  async addQuickTask(snapshot: ProjectSnapshot, title: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        quickTasks: title.trim()
          ? [{ id: `task-${Date.now()}`, title: title.trim(), done: false }, ...project.quickTasks].slice(0, 8)
          : project.quickTasks
      }))
    );
  },

  async addReminder(snapshot: ProjectSnapshot, title: string, dueLabel: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        reminders:
          title.trim() && dueLabel.trim()
            ? [{ id: `rem-${Date.now()}`, title: title.trim(), dueLabel: dueLabel.trim(), done: false }, ...project.reminders].slice(0, 8)
            : project.reminders
      }))
    );
  },

  async toggleReminder(snapshot: ProjectSnapshot, reminderId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        reminders: project.reminders.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, done: !reminder.done } : reminder
        )
      }))
    );
  },

  async removeReminder(snapshot: ProjectSnapshot, reminderId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        reminders: project.reminders.filter((reminder) => reminder.id !== reminderId)
      }))
    );
  },

  async addCalendarItem(snapshot: ProjectSnapshot, dayLabel: string, timeLabel: string, title: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
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
      }))
    );
  },

  async removeCalendarItem(snapshot: ProjectSnapshot, itemId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        calendar: project.calendar.filter((item) => item.id !== itemId)
      }))
    );
  },

  async moveBoardCard(snapshot: ProjectSnapshot, cardId: string, lane: DemoBoardLane): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        boardCards: project.boardCards.map((card) => (card.id === cardId ? { ...card, lane } : card))
      }))
    );
  },

  async addNotification(snapshot: ProjectSnapshot, title: string, detail: string, whenLabel: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
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
      }))
    );
  },

  async toggleNotification(snapshot: ProjectSnapshot, notificationId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        notifications: project.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: !notification.read } : notification
        )
      }))
    );
  },

  async removeNotification(snapshot: ProjectSnapshot, notificationId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        notifications: project.notifications.filter((notification) => notification.id !== notificationId)
      }))
    );
  },

  async addConversation(
    snapshot: ProjectSnapshot,
    person: string,
    context: string,
    painPoints: string,
    signals: string,
    trustLevel: "Low" | "Medium" | "High",
    learned: string
  ): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
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
      }))
    );
  },

  async removeConversation(snapshot: ProjectSnapshot, conversationId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        conversations: project.conversations.filter((conversation) => conversation.id !== conversationId)
      }))
    );
  },

  async addFileRecord(snapshot: ProjectSnapshot, name: string, target: string, url: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
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
      }))
    );
  },

  async removeFileRecord(snapshot: ProjectSnapshot, fileId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        files: project.files.filter((file) => file.id !== fileId)
      }))
    );
  },

  async updateSprintField(
    snapshot: ProjectSnapshot,
    field: "goal" | "duration" | "review" | "retrospective",
    value: string
  ): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        sprint: {
          ...project.sprint,
          [field]: value
        }
      }))
    );
  },

  async addSprintTask(snapshot: ProjectSnapshot, title: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        sprint: {
          ...project.sprint,
          tasks: title.trim()
            ? [...project.sprint.tasks, { id: `sprint-task-${Date.now()}`, title: title.trim(), status: "To Do" as const }]
            : project.sprint.tasks
        }
      }))
    );
  },

  async moveSprintTask(snapshot: ProjectSnapshot, taskId: string, status: DemoSprintTask["status"]): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        sprint: {
          ...project.sprint,
          tasks: project.sprint.tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
        }
      }))
    );
  },

  async removeSprintTask(snapshot: ProjectSnapshot, taskId: string): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        sprint: {
          ...project.sprint,
          tasks: project.sprint.tasks.filter((task) => task.id !== taskId)
        }
      }))
    );
  },

  async advanceDay(snapshot: ProjectSnapshot): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        dayCount: project.dayCount + 1
      }))
    );
  },

  async updateBusinessField<
    TSection extends keyof DemoBusinessSnapshot,
    TField extends keyof DemoBusinessSnapshot[TSection]
  >(
    snapshot: ProjectSnapshot,
    section: TSection,
    field: TField,
    value: DemoBusinessSnapshot[TSection][TField]
  ): Promise<ProjectSnapshot> {
    return persistActiveProject(
      updateActiveProject(snapshot, (project) => ({
        ...project,
        business: {
          ...project.business,
          [section]: {
            ...project.business[section],
            [field]: value
          }
        }
      }))
    );
  }
};
