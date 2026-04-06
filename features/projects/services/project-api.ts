"use client";

import type { DemoProject } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? "current";

interface ProjectListResponse {
  data?: DemoProject[];
  meta?: {
    activeProjectId?: string | null;
  };
}

interface ProjectResponse {
  data?: DemoProject;
}

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const projectApi = {
  async listProjects(workspaceId = DEFAULT_WORKSPACE_ID) {
    return requestJson<ProjectListResponse>(`/api/workspaces/${workspaceId}/projects`);
  },

  async createProject(
    payload: {
      name: string;
      founderNote?: string;
      stepValues?: Record<string, string | undefined>;
      canvasValues?: Record<string, string | undefined>;
    },
    workspaceId = DEFAULT_WORKSPACE_ID
  ) {
    return requestJson<ProjectResponse>(`/api/workspaces/${workspaceId}/projects`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async updateProject(projectId: string, payload: Partial<DemoProject>, workspaceId = DEFAULT_WORKSPACE_ID) {
    return requestJson<ProjectResponse>(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async deleteProject(projectId: string, workspaceId = DEFAULT_WORKSPACE_ID) {
    return requestJson(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
      method: "DELETE"
    });
  }
};
