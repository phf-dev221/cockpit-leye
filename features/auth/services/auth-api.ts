"use client";

import { requestJson } from "@/lib/api/client";
import {
  clearAuthSession,
  setAuthSession,
  updateAuthSessionUser,
  type AuthSession,
  type AuthSessionUser
} from "@/features/auth/services/auth-session";

export interface AuthApiResponse extends AuthSession {}

interface UserPayload extends AuthSessionUser {}

type UserResponse = { data?: UserPayload } | UserPayload;

function normalizeUserResponse(response: UserResponse): UserPayload | null {
  if (typeof response === "object" && response !== null && "data" in response) {
    return response.data ?? null;
  }

  return response as UserPayload;
}

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
    return requestJson<UserResponse>("/api/user").then((response) => normalizeUserResponse(response));
  },

  async updateProfile(payload: {
    full_name?: string;
    email?: string;
    avatar_url?: string | null;
    timezone?: string | null;
    locale?: string | null;
  }) {
    const response = await requestJson<{ data?: AuthSessionUser } | AuthSessionUser>("/api/user", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    const user = normalizeUserResponse(response);

    if (user) {
      updateAuthSessionUser(user);
    }

    return user;
  },

  async logout() {
    try {
      await requestJson("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      clearAuthSession();
    }
  }
};
