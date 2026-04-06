"use client";

import { requestJson } from "@/lib/api/client";
import { clearAuthSession, setAuthSession, type AuthSession } from "@/features/auth/services/auth-session";

export interface AuthApiResponse extends AuthSession {}

function persistSession(response: AuthApiResponse) {
  if (response.token) {
    setAuthSession(response);
  }

  return response;
}

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const response = await requestJson<AuthApiResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return persistSession(response);
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    workspaceName?: string;
  }) {
    const response = await requestJson<AuthApiResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return persistSession(response);
  },

  async acceptInvitation(payload: {
    token: string;
    fullName?: string;
    password?: string;
  }) {
    const response = await requestJson<AuthApiResponse>("/api/workspaces/invitations/accept", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return persistSession(response);
  },

  me() {
    return requestJson<{
      id: number | string;
      full_name: string;
      email: string;
      avatar_url?: string | null;
      timezone?: string | null;
      locale?: string | null;
    }>("/api/user");
  },

  async logout() {
    await requestJson("/api/auth/logout", {
      method: "POST"
    });
    clearAuthSession();
  }
};
