"use client";

import { useEffect } from "react";

import { useProjectWorkspace } from "@/features/projects/hooks/use-project-workspace";

export function useSyncProjectRoute(projectId: string) {
  const { activeProjectId, projects, setActiveProject } = useProjectWorkspace();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const exists = projects.some((project) => project.id === projectId);
    if (exists && activeProjectId !== projectId) {
      setActiveProject(projectId);
    }
  }, [activeProjectId, projectId, projects, setActiveProject]);
}
