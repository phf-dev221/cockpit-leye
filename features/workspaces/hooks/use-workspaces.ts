"use client";

import { useCallback, useEffect, useState } from "react";

import { getActiveWorkspaceId } from "@/features/auth/services/auth-session";
import { workspaceApi, type WorkspaceSummary } from "@/features/workspaces/services/workspace-api";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => getActiveWorkspaceId());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextWorkspaces = await workspaceApi.listWorkspaces();
      setWorkspaces(nextWorkspaces);
      setActiveWorkspaceId((current) => current ?? nextWorkspaces[0]?.id?.toString() ?? null);
      return nextWorkspaces;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load workspaces.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activateWorkspace = useCallback(async (workspaceId: string) => {
    setError(null);

    try {
      const workspace = await workspaceApi.activateWorkspace(workspaceId);
      setActiveWorkspaceId(workspace?.id?.toString() ?? workspaceId);
      return workspace;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to switch workspace.");
      return null;
    }
  }, []);

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace: workspaces.find((workspace) => workspace.id.toString() === activeWorkspaceId) ?? null,
    isLoading,
    error,
    refresh,
    activateWorkspace
  };
}
