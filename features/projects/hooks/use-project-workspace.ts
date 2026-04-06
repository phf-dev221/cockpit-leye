"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { projectService, type CreateProjectPayload, type ProjectSnapshot } from "@/features/projects/services/project-service";
import type { DemoBusinessSnapshot, DemoProject } from "@/types";

type ProjectMutation<TArgs extends unknown[] = []> = (...args: TArgs) => Promise<ProjectSnapshot>;

function useProjectMutation<TArgs extends unknown[]>(
  setSnapshot: Dispatch<SetStateAction<ProjectSnapshot>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setIsMutating: Dispatch<SetStateAction<boolean>>,
  snapshot: ProjectSnapshot,
  action: (snapshot: ProjectSnapshot, ...args: TArgs) => Promise<ProjectSnapshot>
) {
  return useCallback(
    async (...args: TArgs) => {
      setIsMutating(true);
      setError(null);

      try {
        const nextSnapshot = await action(snapshot, ...args);
        setSnapshot(nextSnapshot);
        return nextSnapshot;
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to sync project data.");
        return snapshot;
      } finally {
        setIsMutating(false);
      }
    },
    [action, setError, setIsMutating, setSnapshot, snapshot]
  );
}

export function useProjectWorkspace() {
  const [snapshot, setSnapshot] = useState<ProjectSnapshot>(() => projectService.getInitialSnapshot());
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSnapshot = await projectService.loadSnapshot();
      setSnapshot(nextSnapshot);
      return nextSnapshot;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load projects.");
      return projectService.getInitialSnapshot();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeProject = useMemo<DemoProject | null>(
    () => snapshot.projects.find((project) => project.id === snapshot.activeProjectId) ?? snapshot.projects[0] ?? null,
    [snapshot]
  );

  const createProject = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.createProject);
  const renameProject = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.renameProject);
  const deleteProject = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.deleteProject);
  const updateFounderNote = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateFounderNote);
  const updateFocusItem = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateFocusItem);
  const addFocusItem = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addFocusItem);
  const removeFocusItem = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeFocusItem);
  const updateStepValue = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateStepValue);
  const updateCanvasValue = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateCanvasValue);
  const jumpToStep = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.jumpToStep);
  const addDecision = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addDecision);
  const toggleTask = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.toggleTask);
  const addQuickTask = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addQuickTask);
  const addReminder = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addReminder);
  const toggleReminder = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.toggleReminder);
  const removeReminder = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeReminder);
  const addCalendarItem = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addCalendarItem);
  const removeCalendarItem = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeCalendarItem);
  const moveBoardCard = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.moveBoardCard);
  const addNotification = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addNotification);
  const toggleNotification = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.toggleNotification);
  const removeNotification = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeNotification);
  const addConversation = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addConversation);
  const removeConversation = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeConversation);
  const addFileRecord = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addFileRecord);
  const removeFileRecord = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeFileRecord);
  const updateSprintField = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateSprintField);
  const addSprintTask = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.addSprintTask);
  const moveSprintTask = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.moveSprintTask);
  const removeSprintTask = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.removeSprintTask);
  const advanceDay = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.advanceDay);
  const updateBusinessField = useProjectMutation(setSnapshot, setError, setIsMutating, snapshot, projectService.updateBusinessField);

  const setActiveProject = useCallback((projectId: string) => {
    setSnapshot((current) => projectService.setActiveProject(current, projectId));
  }, []);

  return {
    projects: snapshot.projects,
    activeProjectId: snapshot.activeProjectId,
    activeProject,
    isLoading,
    isMutating,
    error,
    refresh,
    createProject: (name: string, seed?: CreateProjectPayload) => createProject(name, seed),
    renameProject: (name: string) => renameProject(name),
    deleteProject: (projectId: string) => deleteProject(projectId),
    setActiveProject,
    updateFounderNote: (value: string) => updateFounderNote(value),
    updateFocusItem: (focusItemId: string, title: string, value: string) => updateFocusItem(focusItemId, title, value),
    addFocusItem: (title: string, value: string) => addFocusItem(title, value),
    removeFocusItem: (focusItemId: string) => removeFocusItem(focusItemId),
    updateStepValue: (stepId: Parameters<typeof projectService.updateStepValue>[1], value: string) => updateStepValue(stepId, value),
    updateCanvasValue: (canvasId: Parameters<typeof projectService.updateCanvasValue>[1], value: string) => updateCanvasValue(canvasId, value),
    jumpToStep: (stepId: Parameters<typeof projectService.jumpToStep>[1]) => jumpToStep(stepId),
    addDecision: (value: string) => addDecision(value),
    toggleTask: (taskId: string) => toggleTask(taskId),
    addQuickTask: (title: string) => addQuickTask(title),
    addReminder: (title: string, dueLabel: string) => addReminder(title, dueLabel),
    toggleReminder: (reminderId: string) => toggleReminder(reminderId),
    removeReminder: (reminderId: string) => removeReminder(reminderId),
    addCalendarItem: (dayLabel: string, timeLabel: string, title: string) => addCalendarItem(dayLabel, timeLabel, title),
    removeCalendarItem: (itemId: string) => removeCalendarItem(itemId),
    moveBoardCard: (cardId: string, lane: Parameters<typeof projectService.moveBoardCard>[2]) => moveBoardCard(cardId, lane),
    addNotification: (title: string, detail: string, whenLabel: string) => addNotification(title, detail, whenLabel),
    toggleNotification: (notificationId: string) => toggleNotification(notificationId),
    removeNotification: (notificationId: string) => removeNotification(notificationId),
    addConversation: (
      person: string,
      context: string,
      painPoints: string,
      signals: string,
      trustLevel: "Low" | "Medium" | "High",
      learned: string
    ) => addConversation(person, context, painPoints, signals, trustLevel, learned),
    removeConversation: (conversationId: string) => removeConversation(conversationId),
    addFileRecord: (name: string, target: string, url: string) => addFileRecord(name, target, url),
    removeFileRecord: (fileId: string) => removeFileRecord(fileId),
    updateSprintField: (field: "goal" | "duration" | "review" | "retrospective", value: string) => updateSprintField(field, value),
    addSprintTask: (title: string) => addSprintTask(title),
    moveSprintTask: (taskId: string, status: "To Do" | "In Progress" | "Done") => moveSprintTask(taskId, status),
    removeSprintTask: (taskId: string) => removeSprintTask(taskId),
    updateBusinessField: <
      TSection extends keyof DemoBusinessSnapshot,
      TField extends keyof DemoBusinessSnapshot[TSection]
    >(
      section: TSection,
      field: TField,
      value: DemoBusinessSnapshot[TSection][TField]
    ) => updateBusinessField(section, field, value),
    advanceDay: () => advanceDay(),
    refreshWorkspace: refresh
  };
}
