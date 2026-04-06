"use client";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

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

export const authApi = {
  login(payload: { email: string; password: string }) {
    return requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  register(payload: {
    fullName: string;
    email: string;
    password: string;
    workspaceName?: string;
  }) {
    return requestJson("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  acceptInvitation(payload: {
    token: string;
    fullName?: string;
    password?: string;
  }) {
    return requestJson("/api/workspaces/invitations/accept", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
