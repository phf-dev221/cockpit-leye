"use client";

const AUTH_SESSION_KEY = "teranga.auth.session";

export interface AuthSessionUser {
  id: number | string;
  full_name: string;
  email: string;
}

export interface AuthSessionWorkspace {
  id: number | string;
  name: string;
  slug?: string;
}

export interface AuthSession {
  token: string;
  user: AuthSessionUser | null;
  active_workspace: AuthSessionWorkspace | null;
}

function canUseStorage() {
  return typeof window !== "undefined";
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

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
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

export function getAuthToken() {
  return getAuthSession()?.token ?? null;
}

export function getActiveWorkspaceId() {
  const workspaceId = getAuthSession()?.active_workspace?.id;

  if (workspaceId === undefined || workspaceId === null) {
    return null;
  }

  return String(workspaceId);
}
