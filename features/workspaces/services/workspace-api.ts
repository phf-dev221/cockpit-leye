"use client";

import { requestJson } from "@/lib/api/client";
import { setActiveWorkspace, type AuthSessionWorkspace } from "@/features/auth/services/auth-session";

export interface WorkspaceSummary extends AuthSessionWorkspace {
  status: string;
  default_timezone?: string;
  default_currency?: string | null;
}

interface WrappedWorkspaceListResponse {
  data?: WorkspaceSummary[];
}

type RawWorkspaceListResponse = WrappedWorkspaceListResponse | WorkspaceSummary[];

function normalizeWorkspaceListResponse(response: RawWorkspaceListResponse) {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data ?? [];
}

export const workspaceApi = {
  async listWorkspaces() {
    const response = await requestJson<RawWorkspaceListResponse>("/api/workspaces");
    return normalizeWorkspaceListResponse(response);
  },

  createWorkspace(payload: { name: string; default_timezone?: string; default_currency?: string }) {
    return requestJson<WorkspaceSummary>("/api/workspaces", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async activateWorkspace(workspaceId: string) {
    const response = await requestJson<{ active_workspace?: WorkspaceSummary }>(`/api/workspaces/${workspaceId}/activate`, {
      method: "POST"
    });

    if (response.active_workspace) {
      setActiveWorkspace(response.active_workspace);
    }

    return response.active_workspace ?? null;
  },

  inviteMember(workspaceId: string, payload: { email: string; role: string }) {
    return requestJson<{
      invitation?: { id?: number | string; email?: string; role?: string };
      invitation_token?: string;
    }>(`/api/workspaces/${workspaceId}/invitations`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
