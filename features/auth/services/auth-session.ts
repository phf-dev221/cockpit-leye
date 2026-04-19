"use client";

import { FRONT_AUTH_COOKIE } from "@/features/auth/auth-constants";

const AUTH_SESSION_KEY = "teranga.auth.session";

export interface AuthSessionUser {
  id: number | string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  timezone?: string | null;
  locale?: string | null;
  can_create_workspace?: boolean;
}

export interface AuthSessionWorkspace {
  id: number | string;
  name: string;
  slug?: string;
}

export interface AuthSession {
  token?: string | null;
  user: AuthSessionUser | null;
  active_workspace: AuthSessionWorkspace | null;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function writeFrontAuthCookie(isAuthenticated: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  if (isAuthenticated) {
    document.cookie = `${FRONT_AUTH_COOKIE}=1; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    return;
  }

  document.cookie = `${FRONT_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  const sanitizedSession: AuthSession = {
    ...session,
    token: null,
  };

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sanitizedSession));
  writeFrontAuthCookie(Boolean(sanitizedSession.user));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    writeFrontAuthCookie(false);
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  writeFrontAuthCookie(false);
}

export function setActiveWorkspace(
  workspace: AuthSessionWorkspace | null
) {
  const session = getAuthSession();

  if (!session) {
    return;
  }

  setAuthSession({
    ...session,
    active_workspace: workspace
  });
}

export function updateAuthSessionUser(user: AuthSessionUser) {
  const session = getAuthSession();

  if (!session) {
    return;
  }

  setAuthSession({
    ...session,
    user
  });
}

export function getAuthToken() {
  return null;
}

export function hasAuthSession() {
  return Boolean(getAuthSession()?.user);
}

export function getActiveWorkspaceId() {
  const workspaceId = getAuthSession()?.active_workspace?.id;

  if (workspaceId === undefined || workspaceId === null) {
    return null;
  }

  return String(workspaceId);
}
