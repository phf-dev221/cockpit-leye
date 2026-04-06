"use client";

import { useEffect, useMemo, useState } from "react";

import { projectService, type CreateProjectPayload, type ProjectSnapshot } from "@/features/projects/services/project-service";
import type { DemoBusinessSnapshot } from "@/types";

export function useProjectWorkspace() {
  const [snapshot, setSnapshot] = useState<ProjectSnapshot>(() => projectService.getInitialSnapshot());

  useEffect(() => {
    setSnapshot(projectService.loadSnapshot());
    return projectService.subscribe(() => {
      setSnapshot(projectService.loadSnapshot());
    });
  }, []);

  function commit(nextSnapshot: ProjectSnapshot) {
    setSnapshot(nextSnapshot);
    projectService.saveSnapshot(nextSnapshot);
  }

  const activeProject = useMemo(
    () => snapshot.projects.find((project) => project.id === snapshot.activeProjectId) ?? snapshot.projects[0],
    [snapshot]
  );

  return {
    projects: snapshot.projects,
    activeProjectId: snapshot.activeProjectId,
    activeProject,
    createProject: (name: string, seed?: CreateProjectPayload) =>
      commit(projectService.createProject(snapshot, name, seed)),
    renameProject: (name: string) => commit(projectService.renameProject(snapshot, name)),
    deleteProject: (projectId: string) => commit(projectService.deleteProject(snapshot, projectId)),
    setActiveProject: (projectId: string) => commit(projectService.setActiveProject(snapshot, projectId)),
    updateFounderNote: (value: string) => commit(projectService.updateFounderNote(snapshot, value)),
    updateFocusItem: (focusItemId: string, title: string, value: string) =>
      commit(projectService.updateFocusItem(snapshot, focusItemId, title, value)),
    addFocusItem: (title: string, value: string) => commit(projectService.addFocusItem(snapshot, title, value)),
    removeFocusItem: (focusItemId: string) => commit(projectService.removeFocusItem(snapshot, focusItemId)),
    updateStepValue: (stepId: Parameters<typeof projectService.updateStepValue>[1], value: string) =>
      commit(projectService.updateStepValue(snapshot, stepId, value)),
    updateCanvasValue: (canvasId: Parameters<typeof projectService.updateCanvasValue>[1], value: string) =>
      commit(projectService.updateCanvasValue(snapshot, canvasId, value)),
    jumpToStep: (stepId: Parameters<typeof projectService.jumpToStep>[1]) =>
      commit(projectService.jumpToStep(snapshot, stepId)),
    addDecision: (value: string) => commit(projectService.addDecision(snapshot, value)),
    toggleTask: (taskId: string) => commit(projectService.toggleTask(snapshot, taskId)),
    addQuickTask: (title: string) => commit(projectService.addQuickTask(snapshot, title)),
    addReminder: (title: string, dueLabel: string) =>
      commit(projectService.addReminder(snapshot, title, dueLabel)),
    toggleReminder: (reminderId: string) =>
      commit(projectService.toggleReminder(snapshot, reminderId)),
    removeReminder: (reminderId: string) =>
      commit(projectService.removeReminder(snapshot, reminderId)),
    addCalendarItem: (dayLabel: string, timeLabel: string, title: string) =>
      commit(projectService.addCalendarItem(snapshot, dayLabel, timeLabel, title)),
    removeCalendarItem: (itemId: string) =>
      commit(projectService.removeCalendarItem(snapshot, itemId)),
    moveBoardCard: (cardId: string, lane: Parameters<typeof projectService.moveBoardCard>[2]) =>
      commit(projectService.moveBoardCard(snapshot, cardId, lane)),
    addNotification: (title: string, detail: string, whenLabel: string) =>
      commit(projectService.addNotification(snapshot, title, detail, whenLabel)),
    toggleNotification: (notificationId: string) =>
      commit(projectService.toggleNotification(snapshot, notificationId)),
    removeNotification: (notificationId: string) =>
      commit(projectService.removeNotification(snapshot, notificationId)),
    addConversation: (
      person: string,
      context: string,
      painPoints: string,
      signals: string,
      trustLevel: "Low" | "Medium" | "High",
      learned: string
    ) => commit(projectService.addConversation(snapshot, person, context, painPoints, signals, trustLevel, learned)),
    removeConversation: (conversationId: string) =>
      commit(projectService.removeConversation(snapshot, conversationId)),
    addFileRecord: (name: string, target: string, url: string) =>
      commit(projectService.addFileRecord(snapshot, name, target, url)),
    removeFileRecord: (fileId: string) =>
      commit(projectService.removeFileRecord(snapshot, fileId)),
    updateSprintField: (
      field: "goal" | "duration" | "review" | "retrospective",
      value: string
    ) => commit(projectService.updateSprintField(snapshot, field, value)),
    addSprintTask: (title: string) => commit(projectService.addSprintTask(snapshot, title)),
    moveSprintTask: (taskId: string, status: "To Do" | "In Progress" | "Done") =>
      commit(projectService.moveSprintTask(snapshot, taskId, status)),
    removeSprintTask: (taskId: string) => commit(projectService.removeSprintTask(snapshot, taskId)),
    updateBusinessField: <
      TSection extends keyof DemoBusinessSnapshot,
      TField extends keyof DemoBusinessSnapshot[TSection]
    >(
      section: TSection,
      field: TField,
      value: DemoBusinessSnapshot[TSection][TField]
    ) => commit(projectService.updateBusinessField(snapshot, section, field, value)),
    advanceDay: () => commit(projectService.advanceDay(snapshot)),
    resetDemo: () => commit(projectService.resetSnapshot())
  };
}
