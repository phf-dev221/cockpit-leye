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

export interface WorkspaceMember {
  id: number;
  role: string;
  membership_status: string;
  joined_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export const workspaceApi = {
  async listWorkspaces() {
    const response = await requestJson<RawWorkspaceListResponse>("/api/workspaces", { cache: 'no-store' } as any);
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
  },

  async getMembers(workspaceId: string) {
    const response = await requestJson<{ data?: WorkspaceMember[] } | WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`);
    if (Array.isArray(response)) {
      return response;
    }
    return response.data ?? [];
  },

  async addMember(workspaceId: string, payload: { email: string; role: string; full_name?: string; password?: string }) {
    return requestJson<{ message?: string }>(`/api/workspaces/${workspaceId}/members/invite-user`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
